import {AIError,AI_LIMITS,aiOutputSchema,readBoundedJSON} from '../../../src/ai.js';
import {instructions} from './openai.js';
export function createAnthropicProvider({apiKey,model,fetchImpl=fetch,timeoutMs=45000}){
 if(!apiKey||!model)throw new AIError('Provider secrets/model are missing.','not_configured');
 return {name:'anthropic',model,async generate(request){
  let response;try{response=await fetchImpl('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','Content-Type':'application/json'},body:JSON.stringify({model,max_tokens:AI_LIMITS.outputTokens,system:instructions,messages:[{role:'user',content:JSON.stringify({task:request.task,projectTitle:request.projectTitle,baselineLabel:request.baselineLabel,question:request.question,sources:request.sources,answerContext:request.answerContext,taskContext:request.taskContext})}],output_config:{format:{type:'json_schema',schema:aiOutputSchema(request.task,request.taskContext?.allowedRoles)}}}),signal:AbortSignal.timeout(timeoutMs),redirect:'error'});}catch(cause){throw new AIError('Provider request did not complete.',['TimeoutError','AbortError'].includes(cause.name)?'provider_timeout':'provider_unavailable');}
  if(!response.ok)throw new AIError('Selected provider is unavailable.','provider_unavailable');
  const body=await readBoundedJSON(response);if(body.stop_reason!=='end_turn')throw new AIError('Provider response was incomplete.','invalid_output');
  const content=(body.content??[]).filter(c=>c.type==='text').map(c=>c.text).join('');let result;try{result=JSON.parse(content);}catch{throw new AIError('Provider output was not valid JSON.','invalid_output');}
  const u=body.usage,inputTokens=u?.input_tokens,outputTokens=u?.output_tokens,usage=Number.isSafeInteger(inputTokens)&&Number.isSafeInteger(outputTokens)&&inputTokens>=0&&outputTokens>=0?{inputTokens,outputTokens,totalTokens:inputTokens+outputTokens}:null;
  return {result,usage};
 }};
}
