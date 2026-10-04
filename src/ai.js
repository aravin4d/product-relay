import {canonical} from './value.js';
import {DELIVERY_AI_TASKS} from './ai-tasks.js';
export {DELIVERY_AI_TASKS};
// Shared browser/gateway protocol. This module never reads or stores a provider key.
export const AI_PROTOCOL_VERSION = 1;
export const AI_PROMPT_VERSION = 'relay-evidence-3';
export const AI_LIMITS = Object.freeze({sources:8, sourceCharacters:24000, contextCharacters:48000, requestBytes:220000, responseBytes:256000, outputTokens:4000, candidates:12});
export const AI_ROLES = Object.freeze(['Everyone','Product','Development','QA','BA','Operations','Support']);
const CONFIG_KEY = 'product-relay-ai-config-v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const fail = (message,code='invalid_request') => { throw new AIError(message,code); };

export class AIError extends Error {
  constructor(message,code='ai_error',status=0) { super(message); this.name='AIError'; this.code=code; this.status=status; }
}
function exactKeys(value,keys,label,optional=[]) {
  if(!object(value)||Object.keys(value).some(key=>!keys.includes(key))||keys.some(key=>!optional.includes(key)&&!(key in value))) fail(`Invalid ${label} fields.`);
}
function text(value,label,max=3000,optional=false) {
  if(typeof value!=='string'||value.length>max||(!optional&&!value.trim())) fail(`Invalid ${label}.`);
  return value;
}
function list(value,label,max) { if(!Array.isArray(value)||value.length>max)fail(`Invalid ${label}.`); return value; }

export function validateAIRequest(value) {
  exactKeys(value,['version','task','projectTitle','baselineLabel','question','sources','consent','answerContext','provider','taskContext','projectId'],'AI request',['answerContext','provider','taskContext','projectId']);
  if(value.version!==AI_PROTOCOL_VERSION||!['extract_handbook','answer_question',...Object.keys(DELIVERY_AI_TASKS)].includes(value.task))fail('Unsupported AI request.');
  if(value.consent!==true)fail('Confirm which plaintext sources will be sent before using AI.','consent_required');
  const sources=list(value.sources,'selected sources',AI_LIMITS.sources);
  if(!sources.length)fail('Select at least one source.');
  const revisions=new Set(); let total=0;
  for(const source of sources) {
    exactKeys(source,['sourceId','revisionId','title','content'],'selected source');
    if(!UUID.test(source.sourceId)||!UUID.test(source.revisionId)||revisions.has(source.revisionId))fail('Invalid or duplicated source revision.');
    revisions.add(source.revisionId);
    text(source.title,'source title',300); text(source.content,'source content',AI_LIMITS.sourceCharacters);
    total+=source.content.length;
  }
  if(total>AI_LIMITS.contextCharacters)fail('Selected context is too large. Select fewer passages.','context_limit');
  text(value.projectTitle,'project title',200); text(value.baselineLabel,'baseline label',200);
  text(value.question,'question',2000,value.task==='extract_handbook');
  if(value.task==='extract_handbook'&&value.question!=='')fail('Handbook extraction does not accept a question.');
  if(value.projectId!==undefined&&!UUID.test(value.projectId))fail('Invalid shared project identity.');
  if(value.provider!==undefined&&!['openai','anthropic'].includes(value.provider))fail('Explicit provider is unavailable.');
  let taskContext;if(value.taskContext!==undefined){const c=value.taskContext;exactKeys(c,['role','scope','records','allowedRoles'],'delivery context',['allowedRoles']);if(c.allowedRoles!==undefined){list(c.allowedRoles,'allowed perspectives',100);if(!c.allowedRoles.length||new Set(c.allowedRoles).size!==c.allowedRoles.length||c.allowedRoles.some(r=>typeof r!=='string'||!r.trim()||r.length>100)||!c.allowedRoles.includes(c.role))fail('Invalid delivery perspectives.');}text(c.role,'perspective',100);if(!object(c.scope)||JSON.stringify(c.scope).length>2000)fail('Invalid delivery scope.');list(c.records,'selected record context',6);for(const r of c.records){exactKeys(r,['kind','id','revision','title','description'],'delivery context record');text(r.kind,'record kind',50);if(!UUID.test(r.id)||!Number.isSafeInteger(r.revision)||r.revision<1)fail('Invalid context identity.');text(r.title,'record title',1000);text(r.description,'record description',10000);}if(JSON.stringify(c).length>24000)fail('Delivery context is too large.');taskContext=structuredClone(c);}
  let answerContext;
  if(value.answerContext!==undefined){
    if(value.task!=='answer_question')fail('Only product answers accept agreed context.');
    const context=value.answerContext;exactKeys(context,['role','agreements','unknowns','selection'],'agreed context',['selection']);if(context.selection!==undefined){exactKeys(context.selection,['versionId','releaseId','environmentId','audience','build','mode'],'answer selection');for(const key of ['versionId','releaseId','environmentId'])if(context.selection[key]&&!UUID.test(context.selection[key]))fail('Invalid answer selection.');for(const key of ['audience','build'])text(context.selection[key],'answer selection',300,true);if(!['agreement','deployed'].includes(context.selection.mode))fail('AI answers require reviewed agreement selection.');}
    text(context.role,'answer perspective',100);list(context.agreements,'selected agreements',6);list(context.unknowns,'known unknowns',12);
    const ids=new Set();for(const agreement of context.agreements){exactKeys(agreement,['id','type','title','description','evidence'],'agreement');if(!UUID.test(agreement.id)||ids.has(agreement.id)||!['rule','section'].includes(agreement.type))fail('Invalid selected agreement.');ids.add(agreement.id);text(agreement.title,'agreement title',1000);text(agreement.description,'agreement detail',12000);validateEvidence(agreement.evidence,value,true);}
    context.unknowns.forEach(value=>text(value,'known unknown',2000));if(JSON.stringify(context).length>24000)fail('Selected agreement details are too large.','context_limit');answerContext=structuredClone(context);
  }
  // Clone only the declared fields: vaults, credentials, and unrelated project data never travel.
  if(DELIVERY_AI_TASKS[value.task]&&!taskContext)fail('Delivery tasks require selected role and scope context.');
  return {version:AI_PROTOCOL_VERSION,task:value.task,projectTitle:value.projectTitle,baselineLabel:value.baselineLabel,question:value.question,sources:sources.map(source=>({...source})),consent:true,...(answerContext?{answerContext}:{}),...(value.provider?{provider:value.provider}:{}),...(value.projectId?{projectId:value.projectId}:{}),...(taskContext?{taskContext}:{})};
}
/** @param {{task?:string, projectTitle?:string, title?:string, baselineLabel?:string, question?:string, sources:unknown[], consent?:boolean, answerContext?:unknown}} options */
export function createAIRequest({task='extract_handbook',projectTitle,title,baselineLabel='Selected current source revisions',question='',sources,consent=false,answerContext,provider,taskContext,projectId}) {
  return validateAIRequest({version:AI_PROTOCOL_VERSION,task,projectTitle:projectTitle??title,baselineLabel,question,sources,consent,...(answerContext?{answerContext}:{}),...(provider?{provider}:{}),...(projectId?{projectId}:{}),...(taskContext?{taskContext}:{})});
}
export async function aiInputHash(request) {
  const clean=validateAIRequest(request);
  const bytes=new TextEncoder().encode(canonical(clean));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}
function validateEvidence(items,request,required=false) {
  list(items,'citations',8);
  if(required&&!items.length)fail('A proposed behavior or factual answer needs source evidence.','invalid_output');
  const seen=new Set();
  for(const item of items) {
    exactKeys(item,['sourceId','revisionId','quote'],'citation');
    const source=request.sources.find(source=>source.sourceId===item.sourceId&&source.revisionId===item.revisionId);
    text(item.quote,'source quotation',3000);
    if(!source||!source.content.includes(item.quote))fail('AI returned an unsupported source quotation.','invalid_output');
    const key=JSON.stringify(item);
    if(seen.has(key))fail('AI repeated the same citation.','invalid_output');
    seen.add(key);
  }
}
export function validateAIResult(value,request) {
  request=validateAIRequest(request);const allowedRoles=request.taskContext?.allowedRoles??AI_ROLES;
  try {
    if(DELIVERY_AI_TASKS[request.task]){exactKeys(value,['candidates','questions','warnings'],'delivery output');list(value.candidates,'delivery candidates',12);list(value.questions,'questions',12);list(value.warnings,'warnings',12);for(const c of value.candidates){exactKeys(c,['kind','title','role','description','conditions','expected','unknowns','evidence'],'delivery candidate');if(!DELIVERY_AI_TASKS[request.task].kinds.includes(c.kind))fail('Wrong candidate family.');text(c.title,'candidate title',200);text(c.role,'candidate role',100);if(!allowedRoles.includes(c.role))fail('Invalid candidate perspective.');text(c.description,'description',4000);text(c.conditions,'conditions',2000,true);text(c.expected,'expected outcome',2000,true);list(c.unknowns,'candidate unknowns',12);c.unknowns.forEach(v=>text(v,'unknown',1000));validateEvidence(c.evidence,request,true);}for(const q of value.questions){exactKeys(q,['title','role','reason','evidence'],'question');text(q.title,'question',500);text(q.role,'question role',100);if(!allowedRoles.includes(q.role))fail('Invalid question perspective.');text(q.reason,'reason',1200);validateEvidence(q.evidence,request);}value.warnings.forEach(v=>text(v,'warning',1000));
    }else if(request.task==='extract_handbook') {
      exactKeys(value,['behaviors','questions','warnings','sections'],'handbook output',['sections']);
      list(value.behaviors,'behavior candidates',AI_LIMITS.candidates);
      list(value.questions,'questions',12); list(value.warnings,'warnings',12);
      for(const behavior of value.behaviors) {
        exactKeys(behavior,['title','actor','condition','outcome','scope','exclusions','roles','evidence'],'behavior candidate');
        text(behavior.title,'behavior title',200); text(behavior.actor,'actor',300);
        text(behavior.condition,'condition',1200); text(behavior.outcome,'outcome',2000);
        text(behavior.scope,'applicability',800); text(behavior.exclusions,'exclusions',800,true);
        list(behavior.roles,'audiences',allowedRoles.length);
        if(!behavior.roles.length||new Set(behavior.roles).size!==behavior.roles.length||behavior.roles.some(role=>!allowedRoles.includes(role)))fail('Invalid candidate audience.');
        validateEvidence(behavior.evidence,request,true);
      }
      for(const question of value.questions) {
        exactKeys(question,['title','role','reason','evidence'],'question candidate');
        text(question.title,'question title',500); text(question.reason,'question rationale',1200);
        if(!allowedRoles.includes(question.role))fail('Invalid question audience.');
        validateEvidence(question.evidence,request);
      }
      if(value.sections!==undefined){list(value.sections,'handbook sections',12);for(const section of value.sections){exactKeys(section,['title','body','role','evidence'],'section candidate');text(section.title,'section title',200);text(section.body,'section body',4000);if(!allowedRoles.includes(section.role))fail('Invalid section audience.');validateEvidence(section.evidence,request,true);}}
      value.warnings.forEach(warning=>text(warning,'warning',1000));
    } else {
      exactKeys(value,['status','answer','evidence','unknowns'],'answer output');
      if(!['answered','unknown'].includes(value.status))fail('Invalid answer state.');
      text(value.answer,'answer',6000); list(value.unknowns,'unknowns',12);
      value.unknowns.forEach(unknown=>text(unknown,'unknown',1000));
      validateEvidence(value.evidence,request,value.status==='answered');
      if(value.status==='unknown'&&!value.unknowns.length)fail('An unknown answer must explain missing context.');
    }
  } catch(error) { if(error instanceof AIError){error.code='invalid_output';} throw error; }
  return structuredClone(value);
}

const stringSchema={type:'string'};
const evidenceSchema={type:'array',items:{type:'object',properties:{sourceId:stringSchema,revisionId:stringSchema,quote:stringSchema},required:['sourceId','revisionId','quote'],additionalProperties:false}};
const roleSchema={type:'string',enum:AI_ROLES};
export function aiOutputSchema(task,allowedRoles=AI_ROLES) {const roleSchema={type:'string',enum:allowedRoles};
  if(DELIVERY_AI_TASKS[task])return {type:'object',properties:{candidates:{type:'array',items:{type:'object',properties:{kind:{type:'string',enum:DELIVERY_AI_TASKS[task].kinds},title:stringSchema,role:roleSchema,description:stringSchema,conditions:stringSchema,expected:stringSchema,unknowns:{type:'array',items:stringSchema},evidence:evidenceSchema},required:['kind','title','role','description','conditions','expected','unknowns','evidence'],additionalProperties:false}},questions:{type:'array',items:{type:'object',properties:{title:stringSchema,role:roleSchema,reason:stringSchema,evidence:evidenceSchema},required:['title','role','reason','evidence'],additionalProperties:false}},warnings:{type:'array',items:stringSchema}},required:['candidates','questions','warnings'],additionalProperties:false};
  if(task==='extract_handbook')return {type:'object',properties:{
    behaviors:{type:'array',items:{type:'object',properties:{title:stringSchema,actor:stringSchema,condition:stringSchema,outcome:stringSchema,scope:stringSchema,exclusions:stringSchema,roles:{type:'array',items:roleSchema},evidence:evidenceSchema},required:['title','actor','condition','outcome','scope','exclusions','roles','evidence'],additionalProperties:false}},
    sections:{type:'array',items:{type:'object',properties:{title:stringSchema,body:stringSchema,role:roleSchema,evidence:evidenceSchema},required:['title','body','role','evidence'],additionalProperties:false}},
    questions:{type:'array',items:{type:'object',properties:{title:stringSchema,role:roleSchema,reason:stringSchema,evidence:evidenceSchema},required:['title','role','reason','evidence'],additionalProperties:false}},
    warnings:{type:'array',items:stringSchema}
  },required:['behaviors','questions','warnings','sections'],additionalProperties:false};
  if(task==='answer_question')return {type:'object',properties:{status:{type:'string',enum:['answered','unknown']},answer:stringSchema,evidence:evidenceSchema,unknowns:{type:'array',items:stringSchema}},required:['status','answer','evidence','unknowns'],additionalProperties:false};
  fail('Unsupported AI task.');
}

export function validateAIConfig(value) {
  if(!object(value))fail('AI connection is not configured.','not_configured');
  const url=new URL(text(value.supabaseUrl,'Supabase URL',500));
  if(url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname)||!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))fail('Use the HTTPS origin of your Supabase project.','invalid_config');
  const key=text(value.publishableKey,'Supabase publishable key',2500);
  if(!/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key)) {
    try {
      const parts=key.split('.');
      const claims=JSON.parse(atob(parts[1].replaceAll('-','+').replaceAll('_','/')));
      if(parts.length!==3||claims.role!=='anon')throw new Error('Not an anonymous public key.');
    } catch { fail('Only a Supabase publishable or legacy anon key belongs in the browser.','invalid_config'); }
  }
  return {supabaseUrl:url.origin,publishableKey:key};
}
export function saveAIConfig(config,storage=globalThis.localStorage) {
  const clean=validateAIConfig(config); storage.setItem(CONFIG_KEY,JSON.stringify(clean)); return clean;
}
export function loadAIConfig(storage=globalThis.localStorage) {
  try { const raw=storage?.getItem(CONFIG_KEY); return raw?validateAIConfig(JSON.parse(raw)):null; } catch { return null; }
}
export function clearAIConfig(storage=globalThis.localStorage) { storage?.removeItem(CONFIG_KEY); }

export async function readBoundedJSON(response,maxBytes=AI_LIMITS.responseBytes) {
  if(!response.body)fail('Empty response.','invalid_output');
  const reader=response.body.getReader(); let total=0; const chunks=[];
  try {
    while(true) { const {done,value}=await reader.read(); if(done)break; total+=value.byteLength; if(total>maxBytes){await reader.cancel();fail('Response exceeds the supported size.','response_limit');}chunks.push(value); }
  } finally { reader.releaseLock(); }
  const joined=new Uint8Array(total); let offset=0;
  for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.byteLength;}
  try { return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined)); }
  catch { fail('Service returned an invalid response.','invalid_output'); }
}
function timeoutSignal(signal,milliseconds) {
  const timeout=AbortSignal.timeout(milliseconds);
  return signal?AbortSignal.any([signal,timeout]):timeout;
}
export async function signInAI({supabaseUrl,publishableKey,email,password,signal,fetchImpl=fetch}) {
  const config=validateAIConfig({supabaseUrl,publishableKey});
  text(email,'email',320); text(password,'password',1000);
  let response;
  try { response=await fetchImpl(`${config.supabaseUrl}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:timeoutSignal(signal,15000),credentials:'omit',redirect:'error'}); }
  catch(error) { throw new AIError(error.name==='AbortError'?'Sign-in cancelled.':'Could not reach the sign-in service.','auth_unavailable'); }
  if(!response.ok)throw new AIError('Sign-in failed. Check the account and password.','sign_in_failed',response.status);
  const result=await readBoundedJSON(response,30000);
  if(typeof result.access_token!=='string'||!object(result.user)||!UUID.test(result.user.id)||!Number.isFinite(result.expires_in))fail('Invalid sign-in response.','invalid_output');
  // Refresh token is intentionally not returned: this portable prototype does not persist sessions.
  return {accessToken:result.access_token,expiresAt:Date.now()+result.expires_in*1000,user:{id:result.user.id,email:result.user.email??email}};
}
export async function signOutAI({supabaseUrl,publishableKey,accessToken,fetchImpl=fetch}) {
  const config=validateAIConfig({supabaseUrl,publishableKey});
  if(!accessToken)return;
  const response=await fetchImpl(`${config.supabaseUrl}/auth/v1/logout`,{method:'POST',headers:{apikey:config.publishableKey,Authorization:`Bearer ${accessToken}`},credentials:'omit',redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!response.ok&&response.status!==401)throw new AIError('Local sign-out completed; remote session revocation could not be confirmed.','sign_out_failed',response.status);
}
export async function runAI({supabaseUrl,publishableKey,gatewayUrl,accessToken,request,signal,fetchImpl=fetch}) {
  request=validateAIRequest(request);
  if(typeof accessToken!=='string'||!accessToken.trim())fail('Sign in to the optional AI service first.','auth_required');
  let endpoint; let headers;
  if(supabaseUrl||publishableKey) {
    const config=validateAIConfig({supabaseUrl,publishableKey});
    endpoint=`${config.supabaseUrl}/functions/v1/relay-ai`; headers={apikey:config.publishableKey};
  } else {
    const url=new URL(gatewayUrl);
    if(url.username||url.password||url.protocol!=='https:'||url.search||url.hash)fail('Invalid AI gateway URL.','invalid_config');
    endpoint=url.href; headers={};
  }
  const inputHash=await aiInputHash(request);
  const body=JSON.stringify(request);
  if(new TextEncoder().encode(body).byteLength>AI_LIMITS.requestBytes)fail('Selected context is too large. Select fewer passages.','context_limit');
  let response;
  try { response=await fetchImpl(endpoint,{method:'POST',headers:{...headers,'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body,credentials:'omit',redirect:'error',signal:timeoutSignal(signal,75000)}); }
  catch(error) { throw new AIError(signal?.aborted?'AI request cancelled.':error.name==='TimeoutError'?'AI request timed out.':'AI gateway could not be reached.','request_failed'); }
  if(!response.ok) {
    let body; try{body=await readBoundedJSON(response,12000);}catch{}
    const safeMessages={auth_required:'Sign in again to use AI.',not_allowed:'This account has not been enabled for AI.',usage_limit:'The gateway request allowance has been reached.',consent_required:'Confirm the selected plaintext sources before sending.',provider_timeout:'AI timed out. Keep the existing project and try a smaller selection.',provider_refusal:'The AI provider declined this request.',invalid_output:'The AI result failed evidence checks. Existing records were preserved.',invalid_request:'The gateway rejected the selected context.',context_limit:'Select fewer or shorter source passages.',not_configured:'The AI gateway is not configured.',origin_denied:'This website is not enabled for the AI gateway.',provider_unavailable:'The AI provider is currently unavailable.'};
    const code=typeof body?.error?.code==='string'?body.error.code:'gateway_error';
    throw new AIError(safeMessages[code]??'The AI request failed. Existing records were preserved.',code,response.status);
  }
  const envelope=await readBoundedJSON(response);
  exactKeys(envelope,['version','result','metadata'],'gateway result');
  if(envelope.version!==AI_PROTOCOL_VERSION||envelope.metadata?.inputHash!==inputHash)fail('AI result belongs to different input.','stale_output');
  if(!object(envelope.metadata)||!UUID.test(envelope.metadata.runId)||(!['openai','anthropic'].includes(envelope.metadata.provider)||(request.provider&&envelope.metadata.provider!==request.provider))||typeof envelope.metadata.model!=='string'||typeof envelope.metadata.at!=='string'||!Number.isFinite(Date.parse(envelope.metadata.at))||envelope.metadata.promptVersion!==AI_PROMPT_VERSION||envelope.metadata.schemaVersion!==AI_PROTOCOL_VERSION)fail('Invalid AI provenance.','invalid_output');
  const metadata=envelope.metadata;
  if(Object.keys(metadata).some(key=>!['runId','inputHash','provider','model','promptVersion','schemaVersion','at','usage','remainingRequests','latencyMs'].includes(key))||metadata.model.length>200||(metadata.remainingRequests!==null&&(!Number.isInteger(metadata.remainingRequests)||metadata.remainingRequests<0)))fail('Invalid AI provenance.','invalid_output');
  if(metadata.latencyMs!==undefined&&(!Number.isSafeInteger(metadata.latencyMs)||metadata.latencyMs<0))fail('Invalid AI latency metadata.','invalid_output');
  if(metadata.usage!==null&&(!object(metadata.usage)||Object.keys(metadata.usage).some(key=>!['inputTokens','outputTokens','totalTokens'].includes(key))||['inputTokens','outputTokens','totalTokens'].some(key=>!Number.isInteger(metadata.usage[key])||metadata.usage[key]<0)))fail('Invalid AI usage metadata.','invalid_output');
  const result=validateAIResult(envelope.result,request);
  return {...result,...(DELIVERY_AI_TASKS[request.task]?{behaviors:[],sections:[]}:{}),metadata:structuredClone(envelope.metadata)};
}
export async function extractHandbook(options) { return runAI({...options,request:createAIRequest({...options,task:'extract_handbook',question:''})}); }
export async function answerQuestion(options) { return runAI({...options,request:createAIRequest({...options,task:'answer_question'})}); }
