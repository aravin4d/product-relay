import {createConnectorService} from './connectors.js';
import {createMediaProvider} from './media-provider.js';
import {digest,equal} from '../../../src/value.js';
const secretsEqual=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
async function data(query){const r=await query;if(r.error)throw Object.assign(new Error('Job repository unavailable.'),{code:'repository_unavailable'});return r.data;}
export function createJobsHandler({admin,workerSecret,configuration,secrets,fetchImpl=fetch}){
 if(!workerSecret||workerSecret.length<32||/replace_with|example_secret|your_secret/i.test(workerSecret))throw new Error('A separate random worker secret of at least 32 characters is required; example placeholders cannot be used.');
 return async request=>{
  const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
  const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers});
  if(request.method!=='POST'||!secretsEqual(request.headers.get('authorization'), 'Bearer '+workerSecret))return reply(403,{error:'worker_auth_required'});
  let job;
  try{
   const rows=await data(admin.rpc('relay_claim_job',{p_lease_seconds:120}));job=rows?.[0];if(!job)return reply(200,{status:'idle'});if(job.status==='uncertain')return reply(200,{jobId:job.id,status:'uncertain',reason:'Expired lease requires reconciliation; no external request repeated.'});
   const member=await data(admin.from('relay_memberships').select('capability,active').eq('project_id',job.project_id).eq('user_id',job.actor_user_id).maybeSingle()),project=await data(admin.from('relay_projects').select('revision,active').eq('id',job.project_id).maybeSingle());
   if(!member?.active||!project?.active||!['owner','reviewer','editor'].includes(member.capability))throw Object.assign(new Error('Access changed.'),{code:'access_denied'});
   if(project.revision!==job.expected_revision)throw Object.assign(new Error('Input revision changed.'),{code:'stale_input'});
   if(await digest(job.input)!==job.input_hash)throw Object.assign(new Error('Job input was redefined.'),{code:'input_redefined'});
   const config=configuration.projects?.[job.project_id]??{providers:{}},connector=createConnectorService({config,secrets,fetchImpl});let output;
   const touch=async phase=>{const ok=await data(admin.rpc('relay_touch_job',{p_job:job.id,p_lease:job.lease_token,p_checkpoint:{...job.checkpoint,phase},p_lease_seconds:120}));if(!ok)throw Object.assign(new Error('Lease was cancelled or expired.'),{code:'lease_lost'});job.checkpoint={...job.checkpoint,phase};};
   if(job.kind==='connector-read'){await touch('reading-selected-reference');output=await connector.read(job.input.locator);}
   else if(['connector-write','test-dispatch'].includes(job.kind)){
    if(!['owner','reviewer'].includes(member.capability))throw Object.assign(new Error('Reviewer required.'),{code:'reviewer_required'});
    const existing=await data(admin.from('relay_outbox').select('*').eq('project_id',job.project_id).eq('idempotency_key',job.idempotency_key).maybeSingle());
    if(existing?.status==='sent')output=existing.receipt;
    else{
     if(existing)throw Object.assign(new Error('Earlier external send is unresolved.'),{code:'external_write_uncertain'});
     const recordId=job.input.externalRecordId,record=(await data(admin.from('relay_project_state').select('payload').eq('project_id',job.project_id).single())).payload.delivery?.external?.find(r=>r.id===recordId);
     if(!record)throw Object.assign(new Error('Reviewed external reference is required.'),{code:'external_reference_required'});
     if(job.kind==='test-dispatch'&&(record.data.locator?.provider!=='github'||record.data.locator.repository!==job.input.repository))throw Object.assign(new Error('Dispatch repository differs from its reviewed reference.'),{code:'external_scope_denied'});
     if(!equal(record.data.locator,job.input.locator)&&job.kind==='connector-write')throw Object.assign(new Error('External scope changed.'),{code:'external_scope_denied'});
     await data(admin.from('relay_outbox').insert({project_id:job.project_id,actor_user_id:job.actor_user_id,external_record_id:recordId,expected_external_revision:job.input.expectedRevision??job.input.expectedSha,idempotency_key:job.idempotency_key,operation:job.kind==='test-dispatch'?'test-dispatch':'comment',diff:job.input}));
     await touch('external-send-started');
     output=job.kind==='connector-write'?await connector.writeComment({...job.input,commandId:job.idempotency_key,projectId:job.project_id}):await connector.dispatch({...job.input,commandId:job.idempotency_key});
     await data(admin.from('relay_outbox').update({status:'sent',receipt:output}).eq('project_id',job.project_id).eq('idempotency_key',job.idempotency_key));
    }
   }else if(['ocr','transcribe'].includes(job.kind)){
    if(!secrets('OPENAI_API_KEY')||!secrets(job.kind==='ocr'?'OPENAI_OCR_MODEL':'OPENAI_TRANSCRIBE_MODEL'))throw Object.assign(new Error('Media model unavailable.'),{code:'not_configured'});
    const allowance=await data(admin.rpc('reserve_relay_project_ai_request',{p_user_id:job.actor_user_id,p_project_id:job.project_id}));if(!allowance?.[0]?.allowed)throw Object.assign(new Error('Provider allowance unavailable.'),{code:'usage_limit'});
    await touch('provider-send-started');output=await createMediaProvider({secrets,fetchImpl})(job.kind,job.input);
   }else throw Object.assign(new Error('Unsupported job.'),{code:'invalid_job_kind'});
   const stillActive=await data(admin.from('relay_memberships').select('active,capability').eq('project_id',job.project_id).eq('user_id',job.actor_user_id).maybeSingle()),currentProject=await data(admin.from('relay_projects').select('active,revision').eq('id',job.project_id).maybeSingle());if(!stillActive?.active||!currentProject?.active||!['owner','reviewer','editor'].includes(stillActive.capability)||job.kind!=='connector-read'&&!['owner','reviewer'].includes(stillActive.capability))throw Object.assign(new Error('Access lost during work.'),{code:'access_denied'});if(currentProject.revision!==job.expected_revision)throw Object.assign(new Error('Input changed during work.'),{code:'stale_input'});
   const saved=await data(admin.rpc('relay_checkpoint_job',{p_job:job.id,p_lease:job.lease_token,p_checkpoint:{...job.checkpoint,phase:'review-output'},p_status:'review-required',p_output:output,p_error:null}));
   return reply(200,{jobId:job.id,status:saved?'review-required':'lease-lost',externalCompletion:output?.accepted?'Actual test run still unknown':undefined});
  }catch(error){
   const code=error.code??'job_unavailable';if(job?.lease_token){const uncertain=['external_write_uncertain','provider_result_uncertain'].includes(code)||job.checkpoint?.phase?.endsWith('send-started')&&code==='repository_unavailable';await admin.rpc('relay_checkpoint_job',{p_job:job.id,p_lease:job.lease_token,p_checkpoint:job.checkpoint??{},p_status:uncertain?'uncertain':['connector_timeout','connector_rate_limited'].includes(code)&&job.attempts<5?'queued':'failed',p_output:null,p_error:code});if(job.kind==='connector-write'||job.kind==='test-dispatch')await admin.from('relay_outbox').update({status:uncertain?'uncertain':'failed',receipt:{error:code}}).eq('project_id',job.project_id).eq('idempotency_key',job.idempotency_key);}
   return reply(200,{jobId:job?.id,status:'requires-attention',error:code});
  }
 };
}
