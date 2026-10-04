import {AIError,AI_LIMITS,AI_PROTOCOL_VERSION,AI_PROMPT_VERSION,validateAIRequest,validateAIResult,aiInputHash,readBoundedJSON} from '../../../src/ai.js';

// Dependency injection lets tests exercise the real endpoint without credentials or paid calls.
/**
 * @param {object} options
 * @param {(token:string)=>Promise<{id:string}|null>} options.authenticate
 * @param {(userId:string)=>Promise<{allowed:boolean,reason?:string,remaining?:number}>} options.consumeAllowance
 * @param {{name:string,model:string,generate:(request:ReturnType<typeof validateAIRequest>)=>Promise<{result:unknown,usage?:unknown}>}} options.provider
 * @param {string[]} [options.allowedOrigins]
 * @param {()=>Date} [options.now]
 * @param {()=>string} [options.randomUUID]
 */
export function createRelayHandler({authenticate,consumeAllowance,provider,providers={},defaultProvider,authorizeInput=async()=>{},recordReceipt=async()=>{},allowedOrigins=[],now=()=>new Date(),randomUUID=()=>crypto.randomUUID()}) {
  const origins=new Set(allowedOrigins);
  return async function handler(request) {
    const origin=request.headers.get('origin');
    const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
    if(origin&&origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
    const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers});
    const error=(status,code,message)=>reply(status,{version:AI_PROTOCOL_VERSION,error:{code,message}});
    if(origin&&!origins.has(origin))return error(403,'origin_denied','Website origin is not enabled.');
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Max-Age':'600'}});
    if(request.method!=='POST')return error(405,'invalid_request','Use POST.');
    const token=request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if(!token)return error(401,'auth_required','A signed-in user is required.');
    let user;
    try{user=await authenticate(token);}catch{return error(503,'auth_unavailable','Account verification is unavailable.');}
    if(!user?.id)return error(401,'auth_required','Session is invalid or expired.');
    if(!request.headers.get('content-type')?.split(';')[0].trim().match(/^application\/json$/i))return error(415,'invalid_request','Use application/json.');
    const declaredLength=Number(request.headers.get('content-length'));
    if(declaredLength>AI_LIMITS.requestBytes)return error(413,'context_limit','Request is too large.');
    let input;
    try{input=validateAIRequest(await readBoundedJSON(request,AI_LIMITS.requestBytes));}
    catch(cause){return error(cause.code==='response_limit'?413:400,cause.code==='response_limit'?'context_limit':cause.code??'invalid_request','Selected context is invalid.');}
    const selectedName=input.provider??defaultProvider??provider?.name,selected=providers[selectedName]??(provider?.name===selectedName?provider:null);if(!selected)return error(503,'not_configured','The selected provider is not configured.');
    try{await authorizeInput(user.id,input);}catch{return error(403,'context_access_denied','Selected shared context is unavailable or changed.');}
    let allowance;
    try{allowance=await consumeAllowance(user.id,input);}catch{return error(503,'allowance_unavailable','Usage control is unavailable.');}
    if(!allowance?.allowed)return error(allowance?.reason==='not_allowed'?403:429,allowance?.reason==='not_allowed'?'not_allowed':'usage_limit','AI access or daily allowance is unavailable.');
    const runId=randomUUID(),startedAt=Date.now();
    try {
      const output=await selected.generate(input);
      const result=validateAIResult(output.result,input);
      await authorizeInput(user.id,input);const metadata={runId,inputHash:await aiInputHash(input),provider:selected.name,model:selected.model,promptVersion:AI_PROMPT_VERSION,schemaVersion:AI_PROTOCOL_VERSION,at:now().toISOString(),usage:output.usage??null,remainingRequests:allowance.remaining??null,latencyMs:Date.now()-startedAt};await recordReceipt(user.id,input,metadata);return reply(200,{version:AI_PROTOCOL_VERSION,result,metadata});
    } catch(cause) {
      const code=cause instanceof AIError?cause.code:'provider_unavailable';
      const status=code==='provider_timeout'?504:code==='provider_refusal'?422:502;
      // Do not reflect provider error bodies, request text, tokens, or secrets.
      return error(status,code,'AI processing did not complete. The project was not changed.');
    }
  };
}
