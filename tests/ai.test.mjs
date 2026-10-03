import test from 'node:test';
import assert from 'node:assert/strict';
import {AIError,AI_LIMITS,AI_PROTOCOL_VERSION,AI_PROMPT_VERSION,createAIRequest,validateAIRequest,validateAIResult,aiInputHash,validateAIConfig,saveAIConfig,loadAIConfig,clearAIConfig,signInAI,runAI,extractHandbook,answerQuestion,readBoundedJSON} from '../src/ai.js';
import {createRelayHandler} from '../supabase/functions/_shared/handler.js';
import {createOpenAIProvider} from '../supabase/functions/_shared/openai.js';

const sourceId='11111111-1111-4111-8111-111111111111';
const revisionId='22222222-2222-4222-8222-222222222222';
const userId='33333333-3333-4333-8333-333333333333';
const runId='44444444-4444-4444-8444-444444444444';
const source={sourceId,revisionId,title:'PRD',content:'Ordinary cancellation retains access until the paid period ends. Fraud-only cancellation in release 2 immediately revokes access.'};
const evidence={sourceId,revisionId,quote:'Ordinary cancellation retains access until the paid period ends.'};
const config={supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnopqrstuvwxyz'};
const request=()=>createAIRequest({projectTitle:'Orbit',sources:[source],consent:true});
const result=()=>({behaviors:[{title:'Ordinary cancellation',actor:'Workspace owner',condition:'Ordinary cancellation',outcome:'Access continues until the paid period ends.',scope:'Ordinary workspaces',exclusions:'Fraud-flagged workspaces have a separate release-2 rule.',roles:['Everyone','QA'],evidence:[evidence]}],questions:[{title:'Who owns rollback?',role:'Operations',reason:'Rollback instructions are not specified.',evidence:[]}],warnings:[]});
function endpoint(options={}) {return createRelayHandler({authenticate:async()=>({id:userId}),consumeAllowance:async()=>({allowed:true,remaining:9}),provider:{name:'openai',model:'test-model',generate:async()=>({result:result(),usage:{inputTokens:50,outputTokens:40,totalTokens:90}})},allowedOrigins:['https://aravin4d.github.io'],now:()=>new Date('2026-10-03T00:00:00.000Z'),randomUUID:()=>runId,...options});}
function post(body=request(),headers={}) {return new Request('https://example.supabase.co/functions/v1/relay-ai',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer verified-user-token',origin:'https://aravin4d.github.io',...headers},body:JSON.stringify(body)});}
const json=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});

test('AI requires explicit consent and bounded selected source context',()=>{
  assert.throws(()=>createAIRequest({projectTitle:'Orbit',sources:[source]}),error=>error.code==='consent_required');
  const large={...source,content:'x'.repeat(AI_LIMITS.sourceCharacters+1)};
  assert.throws(()=>createAIRequest({projectTitle:'Orbit',sources:[large],consent:true}),/source content/);
  const duplicate=request();duplicate.sources.push(source);assert.throws(()=>validateAIRequest(duplicate),/duplicated/);
});
test('unknown request/source fields cannot smuggle credentials or entire projects',()=>{
  const value=request();value.openAIKey='secret';assert.throws(()=>validateAIRequest(value),/fields/);
  const other=request();other.sources[0].vaultKey='secret';assert.throws(()=>validateAIRequest(other),/fields/);
});
test('context and task validation prevents oversized or malformed inputs',()=>{
  const value=request();value.sources=[1,2,3].map((n)=>({...source,revisionId:`0000000${n}-2222-4222-8222-222222222222`,content:'x'.repeat(20000)}));
  assert.throws(()=>validateAIRequest(value),error=>error.code==='context_limit');
  assert.throws(()=>createAIRequest({task:'execute_tool',projectTitle:'Orbit',sources:[source],consent:true}),/Unsupported/);
  assert.throws(()=>createAIRequest({task:'answer_question',projectTitle:'Orbit',sources:[source],consent:true}),/question/);
});
test('source hashes change when content, revision, or task context changes',async()=>{
  const first=request();const hash=await aiInputHash(first);assert.match(hash,/^[a-f0-9]{64}$/);
  const changed=request();changed.sources[0].content+=' More context.';assert.notEqual(await aiInputHash(changed),hash);
  changed.sources[0].content=first.sources[0].content;changed.baselineLabel='Release 1';assert.notEqual(await aiInputHash(changed),hash);
});
test('proposed behavior requires evidence and preserves qualified fields',()=>{
  assert.deepEqual(validateAIResult(result(),request()),result());
  const value=result();value.behaviors[0].evidence=[];assert.throws(()=>validateAIResult(value,request()),error=>error.code==='invalid_output');
  value.behaviors[0].evidence=[evidence];value.behaviors[0].scope='';assert.throws(()=>validateAIResult(value,request()),/applicability/);
});
test('hallucinated quotations and revision references are rejected',()=>{
  const value=result();value.behaviors[0].evidence[0]={...evidence,quote:'Cancellation revokes all access.'};assert.throws(()=>validateAIResult(value,request()),/unsupported source quotation/);
  value.behaviors[0].evidence[0]={...evidence,revisionId:runId};assert.throws(()=>validateAIResult(value,request()),/unsupported source quotation/);
});
test('AI cannot attach approval state or unsupported roles to candidates',()=>{
  const value=result();value.behaviors[0].status='approved';assert.throws(()=>validateAIResult(value,request()),/fields/);
  delete value.behaviors[0].status;value.behaviors[0].roles=['Administrator'];assert.throws(()=>validateAIResult(value,request()),/audience/);
});
test('unknown answers explain missing context and factual answers require evidence',()=>{
  const req=createAIRequest({task:'answer_question',projectTitle:'Orbit',sources:[source],question:'Who owns rollback?',consent:true});
  const answer={status:'unknown',answer:'The selected context does not specify rollback ownership.',evidence:[],unknowns:['Rollback owner']};
  assert.deepEqual(validateAIResult(answer,req),answer);
  answer.unknowns=[];assert.throws(()=>validateAIResult(answer,req),/explain missing/);
  answer.status='answered';answer.answer='PM owns rollback.';assert.throws(()=>validateAIResult(answer,req),/source evidence/);
});
test('configuration persists only public connection data, never tokens or provider keys',()=>{
  const memory=new Map();const storage={setItem:(key,value)=>memory.set(key,value),getItem:key=>memory.get(key),removeItem:key=>memory.delete(key)};
  saveAIConfig({...config,accessToken:'session-secret',openAIKey:'provider-secret'},storage);
  assert.deepEqual(loadAIConfig(storage),config);assert.doesNotMatch([...memory.values()][0],/session-secret|provider-secret/);
  clearAIConfig(storage);assert.equal(loadAIConfig(storage),null);
});
test('config rejects secret keys, user JWTs and insecure remote URLs',()=>{
  assert.throws(()=>validateAIConfig({...config,publishableKey:'sb_secret_abcdefghijklmnopqrstuvwxyz'}),/Only a Supabase/);
  const jwt=`header.${Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')}.signature`;
  assert.throws(()=>validateAIConfig({...config,publishableKey:jwt}),/Only a Supabase/);
  assert.throws(()=>validateAIConfig({...config,supabaseUrl:'http://remote.example'}),/HTTPS origin/);
  assert.throws(()=>validateAIConfig({...config,supabaseUrl:'https://name:secret@remote.example'}),/HTTPS origin/);
  assert.equal(validateAIConfig({...config,supabaseUrl:'http://127.0.0.1:54321'}).supabaseUrl,'http://127.0.0.1:54321');
});
test('password sign-in returns a session token without retaining refresh tokens',async()=>{
  const calls=[];
  const session=await signInAI({...config,email:'qa@example.com',password:'example-password',fetchImpl:async(url,options)=>{calls.push({url,options});return json({access_token:'user-token',refresh_token:'refresh-secret',expires_in:3600,user:{id:userId,email:'qa@example.com'}});}});
  assert.equal(session.accessToken,'user-token');assert.equal(session.refreshToken,undefined);assert.equal(calls[0].options.credentials,'omit');
  assert.match(calls[0].url,/auth\/v1\/token\?grant_type=password$/);assert.equal(calls[0].options.headers.apikey,config.publishableKey);
});
test('sign-in failures do not expose upstream response details',async()=>{
  await assert.rejects(signInAI({...config,email:'qa@example.com',password:'example-password',fetchImpl:async()=>new Response('internal secret response',{status:400})}),error=>error.code==='sign_in_failed'&&!error.message.includes('secret'));
});
test('gateway authenticates before reading context or calling provider',async()=>{
  let called=0;const handler=endpoint({authenticate:async()=>null,consumeAllowance:async()=>{called++;},provider:{generate:async()=>{called++;}}});
  const response=await handler(post());assert.equal(response.status,401);assert.equal(called,0);
  assert.equal((await response.json()).error.code,'auth_required');
});
test('missing authorization is denied without authentication invocation',async()=>{
  let called=false;const handler=endpoint({authenticate:async()=>{called=true;}});
  const req=post();req.headers.delete('authorization');assert.equal((await handler(req)).status,401);assert.equal(called,false);
});
test('CORS permits only explicit origins and preflight never processes context',async()=>{
  let calls=0;const handler=endpoint({authenticate:async()=>{calls++;return {id:userId};}});
  const denied=await handler(post(request(),{origin:'https://attacker.example'}));assert.equal(denied.status,403);assert.equal(denied.headers.get('access-control-allow-origin'),null);
  const preflight=await handler(new Request('https://example.supabase.co/functions/v1/relay-ai',{method:'OPTIONS',headers:{origin:'https://aravin4d.github.io'}}));
  assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://aravin4d.github.io');assert.equal(calls,0);
});
test('malformed/oversized requests do not reserve budget',async()=>{
  let calls=0;const handler=endpoint({consumeAllowance:async()=>{calls++;return {allowed:true};}});
  const missingConsent=request();missingConsent.consent=false;assert.equal((await handler(post(missingConsent))).status,400);
  const huge=post();huge.headers.set('content-length',String(AI_LIMITS.requestBytes+1));assert.equal((await handler(huge)).status,413);
  assert.equal(calls,0);
});
test('actual streamed request size is bounded even without Content-Length',async()=>{
  let calls=0;const handler=endpoint({consumeAllowance:async()=>{calls++;return {allowed:true};}});
  const req=new Request('https://example.supabase.co/functions/v1/relay-ai',{method:'POST',headers:{authorization:'Bearer token','content-type':'application/json'},body:'x'.repeat(AI_LIMITS.requestBytes+1)});
  assert.equal((await handler(req)).status,413);assert.equal(calls,0);
});
test('allowlist and exhaustion failures fail closed without paid provider calls',async()=>{
  let calls=0;const provider={generate:async()=>{calls++;}};
  for(const [reason,status] of [['not_allowed',403],['usage_limit',429]]) {
    const response=await endpoint({provider,consumeAllowance:async()=>({allowed:false,reason})})(post());assert.equal(response.status,status);
  }
  const response=await endpoint({provider,consumeAllowance:async()=>{throw new Error('DB failed');}})(post());assert.equal(response.status,503);assert.equal(calls,0);
});
test('gateway sends provenance, usage and validated candidates without persisting sources',async()=>{
  const response=await endpoint()(post());assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  const envelope=await response.json();assert.deepEqual(envelope.result,result());assert.equal(envelope.metadata.inputHash,await aiInputHash(request()));assert.equal(envelope.metadata.runId,runId);assert.equal(envelope.metadata.remainingRequests,9);
});
test('gateway rejects fabricated results and hides provider exception data',async()=>{
  const invalid=result();invalid.behaviors[0].evidence[0]={...evidence,quote:'Fake quotation'};
  const bad=await endpoint({provider:{generate:async()=>({result:invalid})}})(post());assert.equal(bad.status,502);assert.equal((await bad.json()).error.code,'invalid_output');
  const failed=await endpoint({provider:{generate:async()=>{throw new Error('Secret token and source body');}}})(post());assert.doesNotMatch(await failed.text(),/Secret token|source body/);
});
test('provider uses Responses strict schema, bounded tokens, and no external tools',async()=>{
  let outbound;
  const provider=createOpenAIProvider({apiKey:'server-only-secret',model:'test-model',fetchImpl:async(url,options)=>{outbound={url,options,body:JSON.parse(options.body)};return json({status:'completed',output:[{type:'reasoning',content:[]},{type:'message',content:[{type:'output_text',text:JSON.stringify(result())}]}],usage:{input_tokens:10,output_tokens:20,total_tokens:30}});}});
  const output=await provider.generate(request());assert.deepEqual(output.result,result());assert.deepEqual(output.usage,{inputTokens:10,outputTokens:20,totalTokens:30});
  assert.equal(outbound.url,'https://api.openai.com/v1/responses');assert.equal(outbound.body.store,false);assert.equal(outbound.body.background,false);assert.equal(outbound.body.max_output_tokens,4000);assert.equal(outbound.body.text.format.strict,true);assert.equal(outbound.body.tools,undefined);
  assert.match(outbound.body.instructions,/untrusted source material/);assert.doesNotMatch(JSON.stringify(output),/server-only-secret/);
});
test('provider handles refusal, incomplete and malformed structured output distinctly',async()=>{
  const cases=[{status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'No'}]}],code:'provider_refusal'},{status:'incomplete',output:[],code:'invalid_output'},{status:'completed',output:[{type:'message',content:[{type:'output_text',text:'broken'}]}],code:'invalid_output'}];
  for(const body of cases) {
    const provider=createOpenAIProvider({apiKey:'secret',model:'test-model',fetchImpl:async()=>json(body)});
    await assert.rejects(provider.generate(request()),error=>error.code===body.code);
  }
});
test('provider timeout and upstream HTTP errors remain safe',async()=>{
  const timed=createOpenAIProvider({apiKey:'secret',model:'test-model',fetchImpl:async()=>{throw new DOMException('timeout','TimeoutError');}});
  await assert.rejects(timed.generate(request()),error=>error.code==='provider_timeout');
  const failed=createOpenAIProvider({apiKey:'secret',model:'test-model',fetchImpl:async()=>new Response('provider-key secret',{status:401})});
  await assert.rejects(failed.generate(request()),error=>error.code==='provider_unavailable'&&!error.message.includes('secret'));
});
test('browser-to-gateway end-to-end fake provider returns reviewed candidates and same input hash',async()=>{
  const handler=endpoint();let outbound;
  const output=await extractHandbook({...config,accessToken:'verified-user-token',projectTitle:'Orbit',sources:[source],consent:true,fetchImpl:async(url,options)=>{outbound={url,options};return handler(new Request(url,options));}});
  assert.equal(output.behaviors[0].condition,'Ordinary cancellation');assert.equal(output.metadata.inputHash,await aiInputHash(request()));assert.equal(output.behaviors[0].status,undefined);assert.equal(outbound.options.credentials,'omit');assert.match(outbound.url,/functions\/v1\/relay-ai$/);
});
test('client does not fetch without authentication or consent',async()=>{
  let calls=0;const fetchImpl=async()=>{calls++;return json({});};
  await assert.rejects(extractHandbook({...config,projectTitle:'Orbit',sources:[source],consent:true,fetchImpl}),error=>error.code==='auth_required');
  await assert.rejects(extractHandbook({...config,accessToken:'token',projectTitle:'Orbit',sources:[source],fetchImpl}),error=>error.code==='consent_required');assert.equal(calls,0);
});
test('client rejects result returned for another input revision',async()=>{
  const response=await endpoint()(post());const envelope=await response.json();envelope.metadata.inputHash='0'.repeat(64);
  await assert.rejects(runAI({...config,accessToken:'token',request:request(),fetchImpl:async()=>json(envelope)}),error=>error.code==='stale_output');
});
test('client validates output citations independently of the gateway',async()=>{
  const response=await endpoint()(post());const envelope=await response.json();envelope.result.behaviors[0].evidence[0].quote='Fake quote';
  await assert.rejects(runAI({...config,accessToken:'token',request:request(),fetchImpl:async()=>json(envelope)}),error=>error.code==='invalid_output');
});
test('client displays safe gateway errors rather than arbitrary response text',async()=>{
  await assert.rejects(runAI({...config,accessToken:'token',request:request(),fetchImpl:async()=>new Response(JSON.stringify({error:{code:'usage_limit',message:'Secret upstream text'}}),{status:429})}),error=>error.code==='usage_limit'&&!error.message.includes('Secret'));
});
test('grounded question uses explicitly selected baseline and preserves unknowns',async()=>{
  const handler=endpoint({provider:{name:'openai',model:'test-model',generate:async input=>{assert.equal(input.baselineLabel,'Release 1');return {result:{status:'unknown',answer:'Rollback ownership is missing.',evidence:[],unknowns:['Rollback owner']},usage:null};}}});
  const output=await answerQuestion({...config,accessToken:'token',projectTitle:'Orbit',baselineLabel:'Release 1',sources:[source],question:'Who owns rollback?',consent:true,fetchImpl:async(url,options)=>handler(new Request(url,options))});
  assert.equal(output.status,'unknown');assert.equal(output.unknowns[0],'Rollback owner');
});
test('streamed invalid JSON and oversized responses are rejected',async()=>{
  await assert.rejects(readBoundedJSON(new Response('broken')),error=>error.code==='invalid_output');
  await assert.rejects(readBoundedJSON(new Response('x'.repeat(101)),100),error=>error.code==='response_limit');
});
