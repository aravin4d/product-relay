import {directoryOperation,operationalHealth} from './operations.js';
import {assetOperation} from './assets.js';
import {connectorCatalog} from './connectors.js';
import * as D from '../../../src/domain.js';
import * as L from '../../../src/lifecycle.js';
import {canonical,equal,digest} from '../../../src/value.js';
import {readBoundedJSON} from '../../../src/ai.js';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const approvalKinds=['requirements','cases','guidance','components','objectives','templates'];
const deny=(message,code='access_denied',status=403)=>{throw Object.assign(new Error(message),{code,status});};
const prefix=(before,after,label)=>{if(!Array.isArray(after)||before.length>after.length||before.some((r,i)=>!equal(r,after[i])))deny('Immutable '+label+' was changed.','history_redefined',409);};
function immutableById(before,after,label){for(const old of before){const r=after.find(r=>r.id===old.id);if(!r||!equal(old,r))deny('Immutable '+label+' was changed.','history_redefined',409);}}

// Snapshot commands are domain-validated diffs, subject to server-side capabilities,
// actor binding and append-only history checks. A valid JSON shape is not authority.
const decodeSnapshot=value=>D.importProject(value?.format==='product-relay'?JSON.stringify(value):D.exportProject(value));
const encodeSnapshot=value=>JSON.parse(D.exportProject(value));
export function validateSharedMutation(before,proposed,membership,commandId) {
  const p=decodeSnapshot(proposed),reviewer=['owner','reviewer'].includes(membership.capability),actor=membership.member_id,at=new Date().toISOString();
  if(!['owner','reviewer','editor'].includes(membership.capability))deny('Editing is not permitted.');
  if(p.id!==before.id||p.createdAt!==before.createdAt)deny('Project identity changed.','identity_mismatch',409);
  const requireReview=()=>{if(!reviewer)deny('This change requires an authenticated reviewer.','reviewer_required');};
  if(!equal(before.members,p.members)&&membership.capability!=='owner')deny('Only the owner can change project identities.','owner_required');
  if(!equal({master:L.state(before).masterOwnerId,alternate:L.state(before).alternateOwnerId},{master:L.state(p).masterOwnerId,alternate:L.state(p).alternateOwnerId})&&membership.capability!=='owner')deny('Custody requires the owner.','owner_required');
  prefix(before.events,p.events,'activity');immutableById(before.versions,p.versions,'baselines');
  for(const key of ['decisions','actionDecisions','impactReviews','verifications','acknowledgments'])immutableById(before[key]??[],p[key]??[],key);
  for(const old of before.mergeArchives??[]){const next=p.mergeArchives?.find(a=>a.id===old.id);if(next&&!equal(old,next)||!next&&!p.delivery?.historyArchives?.some(a=>a.archiveIds?.includes(old.id)))deny('Merge parent requires a verified archive manifest.','history_redefined',409);}
  for(const old of before.aiRuns??[]){const next=p.aiRuns.find(r=>r.id===old.id),immutable=r=>{const value={...r};delete value.draftIds;delete value.sectionDraftIds;delete value.proposalIds;return value;};if(!next||!equal(immutable(old),immutable(next)))deny('AI run provenance was redefined.','history_redefined',409);for(const key of ['draftIds','sectionDraftIds','proposalIds'])prefix(old[key]??[],next[key]??[],'AI draft links');}
  for(const key of ['behaviorChanges','changes','actionChanges'])for(const old of before[key]??[]){const next=(p[key]??[]).find(r=>r.id===old.id);if(!next)deny('Proposal history was removed.','history_redefined',409);if(old.status!=='pending'&&!equal(old,next))deny('A concluded proposal was rewritten.','history_redefined',409);if(next.status!==old.status)requireReview();}
  for(const source of before.sources){const next=p.sources.find(s=>s.id===source.id);if(!next)deny('Source history was removed.','history_redefined',409);prefix(source.revisions,next.revisions,'source revisions');}
  for(const key of ['sections','behaviors','actions','questions','reconciliations'])for(const old of before[key]??[])if(!(p[key]??[]).some(r=>r.id===old.id))deny('Recorded context must be archived, never removed.','history_redefined',409);
  for(const key of ['sections','behaviors'])for(const next of p[key]??[]){const old=(before[key]??[]).find(r=>r.id===next.id);if((next.status==='approved'||old?.status==='approved')&&!equal(old,next))requireReview();}
  for(const key of ['decisions','actionDecisions','impactReviews'])if((p[key]?.length??0)>(before[key]?.length??0))requireReview();
  for(const receipt of (p.acknowledgments??[]).filter(r=>!(before.acknowledgments??[]).some(a=>a.id===r.id)))if(receipt.memberId!==actor)deny('Receipt must belong to the authenticated actor.','actor_mismatch');
  for(const result of (p.verifications??[]).filter(r=>!(before.verifications??[]).some(a=>a.id===r.id)))if(result.memberId!==actor)deny('Verification must belong to the authenticated actor.','actor_mismatch');
  for(const kind of L.FAMILIES){
    for(const old of L.list(before,kind)){const next=L.get(p,kind,old.id);if(!next)deny('Delivery history was removed.','history_redefined',409);prefix(old.history,next.history,kind+' revisions');if(next.history.length>old.history.length){const original={...old};delete original.history;if(!equal(next.history[old.history.length].snapshot,original))deny('The earlier active revision was redefined.','history_redefined',409);}if(kind==='runs'&&!equal(old,next))deny('Runs are immutable.','history_redefined',409);if(approvalKinds.includes(kind)&&old.status==='approved'&&!equal(old,next))requireReview();prefix(old.data.acknowledgments??[],next.data.acknowledgments??[],'owner receipts');}
    for(const r of L.list(p,kind)){
      const old=L.get(before,kind,r.id);if(equal(old,r))continue;
      if(kind==='edges'||kind==='carryForwards'||kind==='proposals'&&['accepted','rejected'].includes(r.status)||kind==='exceptions'&&r.status==='accepted')requireReview();
      for(const h of r.history.slice(old?.history.length??0))if(h.memberId!==actor)deny('Revision actor must match this account.','actor_mismatch');
      if(approvalKinds.includes(kind)&&r.status==='approved'){requireReview();if(equal(old?.approval,r.approval)){if(!equal({title:old.title,role:old.role,scope:old.scope,refs:old.refs,evidence:old.evidence,data:old.data},{title:r.title,role:r.role,scope:r.scope,refs:r.refs,evidence:r.evidence,data:r.data}))deny('Approved content needs a new reviewed decision.','approval_required',409);}else{if(r.approval.memberId!==actor)deny('Reviewer identity must match this account.','actor_mismatch');if((kind==='requirements'&&r.data.type==='NFR'||kind==='cases'&&r.refs.some(l=>l.kind==='requirements'&&L.ref(p,l.kind,l.id,l.revision)?.data.type==='NFR'))&&!L.validMeasures(r.data.acceptanceMeasures))deny('NFR approval needs numerical acceptance measures.','approval_basis_invalid',409);if(!L.hasDeclaredScope(r.scope)||L.sourceNeedsReview(p,r)||L.staleRefs(p,r).length||kind==='cases'&&(!r.data.steps?.trim()||!r.data.expected?.trim())||r.data.unknowns?.length&&!r.data.unknownsResolution?.trim())deny('Approval needs current context, known applicability and resolved unknowns.','approval_basis_invalid',409);r.approval={...r.approval,at,identity:'authenticated',actorUserId:membership.user_id,commandId};}}
      for(const receipt of (r.data.acknowledgments??[]).slice(old?.data.acknowledgments?.length??0)){if(receipt.memberId!==actor||r.ownerId!==actor)deny('Owner receipt does not match this account.','actor_mismatch');receipt.identity='authenticated';receipt.actorUserId=membership.user_id;receipt.commandId=commandId;receipt.at=at;}
      if(kind==='exceptions'&&r.status==='accepted'&&!equal(old,r)){if(r.data.acceptedBy!==actor)deny('Risk reviewer must match this account.','actor_mismatch');r.data.acceptanceIdentity={identity:'authenticated',actorUserId:membership.user_id,commandId,at};}
      if(kind==='runs'&&!old&&r.ownerId!==actor)deny('Run recorder must match this account.','actor_mismatch');
      if(kind==='work'&&['completed','in-progress','blocked'].includes(r.status)&&r.status!==old?.status&&r.ownerId!==actor&&!reviewer)deny('Only the assigned owner or reviewer can record this work state.');
    }
  }
  for(const key of ['historyArchives','conflictReviews','workflowStudies','verificationGates'])prefix(before.delivery?.[key]??[],p.delivery?.[key]??[],key);
  for(const r of (p.delivery?.conflictReviews??[]).slice(before.delivery?.conflictReviews?.length??0)){requireReview();if(r.memberId!==actor)deny('Conflict reviewer must match this account.','actor_mismatch');}
  delete p.delivery?.pendingShared;
  return D.importProject(D.exportProject(p));
}
async function one(query){const {data,error}=await query;if(error){const code=['revision_conflict','access_denied','owner_required','idempotency_conflict','transfer_owner_first','active_member_required','already_committed','already_rebased'].find(c=>error.message?.includes(c));throw Object.assign(new Error(code?code.replaceAll('_',' '):'Repository operation failed.'),{code:code??'repository_unavailable',status:['revision_conflict','idempotency_conflict','already_committed','already_rebased'].includes(code)?409:code?403:503});}return data;}
export function createProjectsHandler({admin,authenticate,allowedOrigins=[],connectorsConfiguration={projects:{}},deliveryConfiguration={destinations:{}}}){
 const origins=new Set(allowedOrigins);
 return async request=>{
  const origin=request.headers.get('origin'),headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
  const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers});
  if(origin&&!origins.has(origin))return reply(403,{error:{code:'origin_denied',message:'Website is not enabled.'}});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type'}});
  if(request.method!=='POST')return reply(405,{error:{code:'method_required',message:'Use POST.'}});
  try{
   const token=request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1],user=token&&await authenticate(token);if(!user?.id)deny('Sign in again.','auth_required',401);
   if(!request.headers.get('content-type')?.startsWith('application/json'))deny('Use JSON.','invalid_request',415);
   const input=await readBoundedJSON(request,24000000),operation=input.operation;
   if(operation==='directory')return reply(200,await directoryOperation({admin,user,input:input.settings??{action:'list'}}));
   if(operation==='list'){
    const memberships=await one(admin.from('relay_memberships').select('project_id,capability,member_id').eq('user_id',user.id).eq('active',true));
    if(!memberships.length)return reply(200,{projects:[]});const projects=await one(admin.from('relay_projects').select('id,name,revision,updated_at').in('id',memberships.map(m=>m.project_id)).eq('active',true));
    return reply(200,{projects:projects.map(p=>({...p,...memberships.find(m=>m.project_id===p.id)}))});
   }
   if(operation==='portfolio'){
    const memberships=await one(admin.from('relay_memberships').select('project_id').eq('user_id',user.id).eq('active',true).in('capability',['owner','reviewer','editor','observer']).limit(21));const ids=memberships.slice(0,20).map(m=>m.project_id);if(!ids.length)return reply(200,{projects:[],partial:false});
    const metadata=await one(admin.from('relay_projects').select('id,name,revision,updated_at').in('id',ids).eq('active',true)),states=await one(admin.from('relay_project_state').select('project_id,payload').in('project_id',metadata.map(m=>m.id)));
    return reply(200,{partial:memberships.length>20,projects:metadata.map(m=>{const p=states.find(s=>s.project_id===m.id)?.payload;if(!p)return {...m,unavailable:true};const gaps=L.obligations(p,{});return {...m,obligationCount:gaps.length,reasons:gaps.slice(0,10).map(x=>({title:x.record.title,reason:x.reason})),scope:'All recorded scopes; unknown qualifiers remain unresolved'};})});
   }
   if(operation==='create'){
    if(input.consent!==true)deny('Confirm moving plaintext context to this shared service.','consent_required',400);
    const p=decodeSnapshot(input.project);L.ensure(p).importProvenance={at:new Date().toISOString(),actorUserId:user.id,historyAuthority:'Imported historical sign-offs are unverified unless matched to this service journal'};if(!UUID.test(input.memberId))deny('Choose your project identity.','invalid_request',400);
    const revision=await one(admin.rpc('relay_create_project',{p_actor:user.id,p_project:p,p_member:input.memberId}));
    return reply(200,{project:encodeSnapshot(p),revision,capability:'owner',memberId:input.memberId});
   }
   if(!UUID.test(input.projectId))deny('Invalid project identity.','invalid_request',400);
   const meta=await one(admin.from('relay_projects').select('*').eq('id',input.projectId).eq('active',true).maybeSingle());
   const membership=await one(admin.from('relay_memberships').select('*').eq('project_id',input.projectId).eq('user_id',user.id).eq('active',true).maybeSingle());
   if(!meta||!membership)deny('Access is unavailable.');
   const state=await one(admin.from('relay_project_state').select('payload').eq('project_id',input.projectId).single()),p=D.importProject(D.exportProject(state.payload));
   const fullRead=membership.capability!=='reader';
   if(operation==='read'){
    if(!fullRead){const candidates=L.list(p,'guidance').filter(r=>r.data.customerSafe&&r.status==='approved'&&!r.archived&&L.roleMatches(p,r.role,membership.perspective)&&L.scopeMatch(r.scope,input.context??{})===true&&!L.staleRefs(p,r).length);return reply(200,{readingPack:candidates.length?L.readingPack(p,{role:membership.perspective,context:input.context??{},ids:candidates.map(r=>r.id)}):{format:'product-relay-reading-pack',version:1,projectLabel:p.name,items:[]},revision:meta.revision,capability:'reader'});}
    return reply(200,{project:encodeSnapshot(p),revision:meta.revision,capability:membership.capability,memberId:membership.member_id});
   }
   if(operation==='notifications'){const feed=await one(admin.from('relay_notifications').select('id,revision,summary,created_at,read_at').eq('project_id',p.id).eq('user_id',user.id).order('created_at',{ascending:false}).limit(100));return reply(200,{notifications:feed});}
   if(operation==='mark-read'){if(!UUID.test(input.notificationId))deny('Invalid notification.','invalid_request',400);await one(admin.from('relay_notifications').update({read_at:new Date().toISOString()}).eq('project_id',p.id).eq('user_id',user.id).eq('id',input.notificationId));return reply(200,{ok:true});}
   if(operation==='subscribe'){
    const settings=input.settings??{};if(!Number.isSafeInteger(settings.digestMinutes)||settings.digestMinutes<0||settings.digestMinutes>10080||!D.getRoles(p).includes(settings.perspective))deny('Invalid subscription.','invalid_request',400);
    await one(admin.from('relay_subscriptions').upsert({project_id:p.id,user_id:user.id,enabled:settings.enabled===true,digest_minutes:settings.digestMinutes,perspective:settings.perspective,owned_only:settings.ownedOnly===true,release_id:settings.releaseId||null,environment_id:settings.environmentId||null}));return reply(200,{ok:true});
   }
   if(operation==='commit'||operation==='rebase'){
    if(operation==='rebase'){if(!UUID.test(input.originalCommandId))deny('Original command identity required.','invalid_request',400);const returned=decodeSnapshot(input.originalDraft);if(returned.id!==p.id||returned.createdAt!==p.createdAt||returned.delivery?.pendingShared?.commandId!==input.originalCommandId)deny('Invalid retained offline draft.','invalid_request',400);const original=await one(admin.from('relay_commands').select('resulting_revision').eq('project_id',p.id).eq('command_id',input.originalCommandId).maybeSingle());if(original)deny('The original command already committed. Open its accepted master; do not rebase it twice.','already_committed',409);}
    if(!fullRead||!UUID.test(input.commandId)||!Number.isSafeInteger(input.expectedRevision))deny('Invalid command.','invalid_request',400);
    const requestHash=await digest({projectId:p.id,commandId:input.commandId,expectedRevision:input.expectedRevision,baseHash:input.baseHash,project:input.project,...(operation==='rebase'?{originalCommandId:input.originalCommandId,originalDraft:input.originalDraft}:{})});
    const retired=operation==='commit'&&await one(admin.from('relay_offline_returns').select('command_id').eq('project_id',p.id).eq('command_id',input.commandId).maybeSingle());if(retired)deny('This offline command was replaced by a reviewed rebase.','command_retired',409);
    const previous=await one(admin.from('relay_commands').select('actor_user_id,request_hash,resulting_revision').eq('project_id',p.id).eq('command_id',input.commandId).maybeSingle());
    if(previous){if(previous.actor_user_id!==user.id||previous.request_hash!==requestHash)deny('Command ID was reused with different content.','idempotency_conflict',409);return reply(200,{project:encodeSnapshot(p),revision:meta.revision,committedRevision:previous.resulting_revision,duplicate:true});}
    if(meta.revision!==input.expectedRevision||await digest(p)!==input.baseHash)return reply(409,{error:{code:'revision_conflict',message:'Shared context changed. Refresh and review the differences before resubmitting.'},revision:meta.revision});
    const proposed=decodeSnapshot(input.project);
    for(const archive of proposed.delivery?.historyArchives??[]){if(p.delivery?.historyArchives?.some(old=>equal(old,archive)))continue;const parents=p.mergeArchives.filter(a=>archive.archiveIds.includes(a.id));const body={format:'product-relay-history',version:1,projectId:p.id,createdAt:p.createdAt,archivedAt:archive.at,reviewedBy:archive.memberId,note:archive.note,archives:parents};if(!parents.length||await digest(body)!==archive.hash)deny('Archive manifest does not preserve the exact parent history.','history_redefined',409);}
    const next=validateSharedMutation(p,input.project,membership,input.commandId);
    const reviewedJob=async id=>{if(!UUID.test(id))deny('Retrieved origin needs its job receipt.','invalid_origin',400);const j=await one(admin.from('relay_jobs').select('status,output,error_code,input,expected_revision').eq('project_id',p.id).eq('id',id).maybeSingle());if(!j)deny('Retrieval receipt unavailable.','invalid_origin',400);return j;};
    for(const r of L.list(next,'external').filter(r=>!equal(r,L.get(p,'external',r.id))))if(r.data.origin==='provider-retrieved'){const j=await reviewedJob(r.data.lastJobId),o=j.output;if(!o||j.status!=='review-required'||r.title!==o.title||r.data.description!==o.description||r.data.externalId!==o.externalId||r.data.externalRevision!==o.revision||r.data.url!==o.url||!equal(r.data.locator,o.locator))deny('External context differs from its actual retrieval.','invalid_origin',400);}
    for(const source of next.sources){const old=p.sources.find(s=>s.id===source.id);if(old?.origin&&!source.origin)deny('External origin cannot be removed silently.','external_origin_changed',409);if(source.origin&&!equal(old?.origin,source.origin)){const j=await reviewedJob(source.origin.lastJobId);if(source.origin.access==='lost'){if(j.error_code!=='connector_access_lost'||!equal(j.input.locator,source.origin.locator))deny('Access-loss receipt does not match.','invalid_origin',400);}else if(!j.output||j.status!=='review-required'||source.revisions.at(-1).content!==(j.output.description??j.output.text)||!equal(j.output.locator??{provider:source.origin.provider},source.origin.locator))deny('Source refresh differs from its retrieval.','invalid_origin',400);}}
    for(const r of next.aiRuns.filter(r=>!p.aiRuns.some(old=>old.id===r.id))){const receipt=await one(admin.from('relay_ai_receipts').select('*').eq('id',r.id).eq('project_id',p.id).eq('actor_user_id',user.id).maybeSingle());if(!receipt||receipt.input_hash!==r.inputHash||receipt.provider!==r.provider||receipt.model!==r.model||receipt.prompt_version!==r.promptVersion||receipt.schema_version!==r.schemaVersion||Date.parse(receipt.at)!==Date.parse(r.at)||r.metrics&&(r.metrics.latencyMs!==receipt.latency_ms||!equal(r.metrics.usage,receipt.usage)))deny('AI provenance lacks its verified service receipt.','invalid_origin',400);}
    for(const r of L.list(next,'assets').filter(r=>r.data.remote&&!equal(r,L.get(p,'assets',r.id)))){if(r.data.storageProjectId!==p.id)deny('Private original belongs to another project.','asset_scope_denied');const a=await one(admin.from('relay_asset_receipts').select('*').eq('project_id',p.id).eq('hash',r.data.hash).maybeSingle());if(!a||a.object_key!==r.data.objectKey||a.byte_length!==r.data.byteLength||a.file_name!==r.data.fileName||a.media_type!==r.data.mediaType)deny('Private original receipt is unavailable.','invalid_origin',400);}
    for(const run of L.list(next,'runs').filter(r=>!L.get(p,'runs',r.id)))if(run.data.origin==='provider-retrieved'){const j=await reviewedJob(run.data.providerJobId),o=j.output;if(!o||j.status!=='review-required'||run.data.build!==o.build||run.data.executedAt!==(o.executedAt??'')||run.data.results.length!==o.caseResults?.length||run.data.results.some((r,i)=>r.result!==o.caseResults[i].result||r.title!==o.caseResults[i].title))deny('Run evidence differs from actual retrieved results.','invalid_origin',400);}
    for(const d of L.list(next,'deployments').filter(r=>!L.get(p,'deployments',r.id)))if(d.data.origin==='provider-retrieved'){const j=await reviewedJob(d.data.providerJobId);if(j.output?.type!=='deployment'||j.output.status!=='success'||d.data.build!==j.output.build)deny('Deployment observation is not backed by its retrieval.','invalid_origin',400);}
    for(const l of next.delivery?.crossProjectLinks??[]){if(p.delivery?.crossProjectLinks?.some(old=>equal(old,l)))continue;if(!['owner','reviewer'].includes(membership.capability))deny('Cross-project dependency requires a reviewer.','reviewer_required');const targetMember=await one(admin.from('relay_memberships').select('capability,active').eq('project_id',l.targetProjectId).eq('user_id',user.id).maybeSingle());if(!targetMember?.active||targetMember.capability==='reader')deny('Target project access is unavailable.','target_access_unavailable');const target=await one(admin.from('relay_project_state').select('payload').eq('project_id',l.targetProjectId).maybeSingle());if(!target||!L.ref(target.payload,l.kind,l.recordId,l.revision))deny('Target revision is unavailable.','target_access_unavailable');}

    const recipients=await one(admin.from('relay_memberships').select('*').eq('project_id',p.id).eq('active',true)),subscriptions=await one(admin.from('relay_subscriptions').select('*').eq('project_id',p.id));
    const changed=L.FAMILIES.flatMap(kind=>L.list(next,kind).filter(r=>!equal(r,L.get(p,kind,r.id))));
    const targets=recipients.filter(m=>{const sub=subscriptions.find(s=>s.user_id===m.user_id);if(!sub)return true;if(!sub.enabled)return false;return !changed.length||changed.some(r=>L.roleMatches(p,r.role,sub.perspective)&&(!sub.owned_only||r.ownerId===m.member_id)&&L.scopeMatch(r.scope,{releaseId:sub.release_id,environmentId:sub.environment_id})!==false);}).map(m=>m.user_id);
    const result=await one(admin.rpc(operation==='rebase'?'relay_rebase_project':'relay_commit_project',{p_project:p.id,p_actor:user.id,p_command:input.commandId,p_expected:input.expectedRevision,p_payload:next,p_hash:requestHash,p_summary:`Project updated: ${changed.length} delivery record change(s)`,p_targets:targets,p_cap:membership.capability,p_member:membership.member_id,...(operation==='rebase'?{p_original_command:input.originalCommandId,p_return:decodeSnapshot(input.originalDraft)}:{})}));
    return reply(200,{project:encodeSnapshot(next),revision:result.revision,duplicate:result.duplicate});
   }
   if(operation==='membership'||operation==='transfer'){
    if(membership.capability!=='owner')deny('Only the authenticated owner can change membership.','owner_required');
    if(!UUID.test(input.userId))deny('Provide an existing account UUID.','invalid_request',400);
    if(operation==='membership'){if(!UUID.test(input.memberId)||!['editor','reviewer','observer','reader'].includes(input.capability)||!D.getRoles(p).includes(input.perspective))deny('Invalid membership.','invalid_request',400);await one(admin.rpc('relay_direct_membership',{p_project:p.id,p_actor:user.id,p_user:input.userId,p_member:input.memberId,p_cap:input.capability,p_active:input.active===true,p_perspective:input.perspective}));}
    else await one(admin.rpc('relay_audited_transfer',{p_project:p.id,p_actor:user.id,p_new_owner:input.userId}));return reply(200,{ok:true});
   }
   if(!fullRead)deny('This capability can only read sanitized guidance.');
   if(['upload-asset','download-asset'].includes(operation))return reply(200,await assetOperation({admin,operation,input,projectId:p.id,actorUserId:user.id,capability:membership.capability}));
   if(operation==='offline-returns')return reply(200,{returns:await one(admin.from('relay_offline_returns').select('command_id,actor_user_id,at').eq('project_id',p.id).order('at',{ascending:false}).limit(100))});
   if(operation==='offline-return'){if(!UUID.test(input.commandId))deny('Invalid return.','invalid_request',400);const returned=await one(admin.from('relay_offline_returns').select('payload').eq('project_id',p.id).eq('command_id',input.commandId).maybeSingle());if(!returned)deny('Retained return unavailable.','not_found',404);return reply(200,{project:encodeSnapshot(returned.payload)});}
   if(operation==='delivery-settings'){const settings=input.settings;if(settings){if(!['email','slack','teams','webhook'].includes(settings.channel)||typeof settings.destination!=='string'||settings.destination.length>200||settings.enabled&&(!settings.consent||deliveryConfiguration.destinations?.[settings.destination]?.channel!==settings.channel))deny('Select and authorize a configured delivery destination.','consent_required',400);await one(admin.from('relay_delivery_settings').upsert({project_id:p.id,user_id:user.id,channel:settings.channel,destination:settings.destination,enabled:settings.enabled===true,updated_at:new Date().toISOString()}));}return reply(200,{destinations:Object.entries(deliveryConfiguration.destinations??{}).map(([id,d])=>({id,channel:d.channel,label:d.label??id})),settings:await one(admin.from('relay_delivery_settings').select('channel,destination,enabled').eq('project_id',p.id).eq('user_id',user.id))});}
   if(operation==='controls'){if(membership.capability!=='owner')deny('Owner controls required.','owner_required');if(input.settings){const q=input.settings;if(!Number.isSafeInteger(q.dailyRequests)||q.dailyRequests<0||q.dailyRequests>100||typeof q.enabled!=='boolean')deny('Invalid allowance.','invalid_request',400);await one(admin.rpc('relay_set_all_controls',{p_project:p.id,p_actor:user.id,p_enabled:q.enabled,p_daily:q.dailyRequests,p_controls:q.controls??{},p_operations:q.operations??{}}));}const budget=await one(admin.from('relay_project_ai_budgets').select('enabled,daily_requests').eq('project_id',p.id).maybeSingle()),controls=await one(admin.from('relay_operational_controls').select('*').eq('project_id',p.id).maybeSingle()),audit=await one(admin.from('relay_administration_audit').select('operation,details,actor_user_id,at').eq('project_id',p.id).order('at',{ascending:false}).limit(50));return reply(200,{budget:budget??{enabled:true,daily_requests:20},controls,audit});}
   if(operation==='catalog')return reply(200,{connectors:connectorCatalog(connectorsConfiguration.projects?.[p.id]??{providers:{}})});
   if(operation==='jobs'){const jobs=await one(admin.from('relay_jobs').select('id,kind,status,attempts,error_code,cost_uncertain,created_at,updated_at').eq('project_id',p.id).order('created_at',{ascending:false}).limit(100));return reply(200,{jobs});}
   if(operation==='cancel-job'){if(!UUID.test(input.jobId))deny('Invalid job.','invalid_request',400);await one(admin.from('relay_jobs').update({cancel_requested:true,status:'cancelled'}).eq('project_id',p.id).eq('id',input.jobId).eq('actor_user_id',user.id).in('status',['queued','review-required','uncertain']));await one(admin.from('relay_jobs').update({cancel_requested:true}).eq('project_id',p.id).eq('id',input.jobId).eq('actor_user_id',user.id).eq('status','leased'));return reply(200,{ok:true});}
   if(operation==='enqueue'){
    if(!['owner','reviewer','editor'].includes(membership.capability)||!UUID.test(input.commandId)||!['connector-read','connector-write','test-dispatch','ocr','transcribe'].includes(input.kind)||input.consent!==true)deny('Review and authorize a configured job.','job_authorization_required');
    if(meta.revision!==input.expectedRevision)deny('Job context changed.','revision_conflict',409);
    if(input.kind!=='connector-read'&&!['owner','reviewer'].includes(membership.capability))deny('This action requires a reviewer.','reviewer_required');
    if(input.kind==='test-dispatch'){if(!Array.isArray(input.input.caseRefs)||input.input.caseRefs.length>1000||input.input.caseRefs.some(l=>l.kind!=='cases'||L.ref(p,l.kind,l.id,l.revision)?.status!=='approved'||L.get(p,l.kind,l.id)?.revision!==l.revision))deny('Review current approved case scope before dispatch.','stale_input',409);}
    const jobId=await one(admin.rpc('relay_enqueue_job',{p_project:p.id,p_actor:user.id,p_command:input.commandId,p_revision:input.expectedRevision,p_kind:input.kind,p_hash:await digest(input.input),p_input:input.input}));return reply(200,{jobId});
   }
   if(operation==='job-result'){const job=await one(admin.from('relay_jobs').select('id,kind,status,input,output,error_code,cost_uncertain,expected_revision').eq('project_id',p.id).eq('id',input.jobId).maybeSingle());if(!job)deny('Job unavailable.','not_found',404);return reply(200,{job});}
   if(operation==='health'){
    return reply(200,{health:{...await operationalHealth(admin,p.id),projectRevision:meta.revision,updatedAt:meta.updated_at}});
   }
   deny('Unknown operation.','invalid_request',400);
  }catch(error){return reply(error.status??503,{error:{code:error.code??'repository_unavailable',message:error.status?error.message:'Shared operation did not complete. Keep the local file.'}});}
 };
}
