import {createClient} from 'npm:@supabase/supabase-js@2.117.2';
import {createRelayHandler} from '../_shared/handler.js';
import {createOpenAIProvider} from '../_shared/openai.js';

function injectedKey(dictionary:string,single:string,legacy:string):string {
  const raw=Deno.env.get(dictionary);
  if(raw) {const keys=JSON.parse(raw);if(keys.default)return keys.default;}
  return Deno.env.get(single)??Deno.env.get(legacy)??'';
}
const supabaseUrl=Deno.env.get('SUPABASE_URL')??'';
const publicKey=injectedKey('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_PUBLISHABLE_KEY','SUPABASE_ANON_KEY');
const secretKey=injectedKey('SUPABASE_SECRET_KEYS','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY');
if(!supabaseUrl||!publicKey||!secretKey)throw new Error('Supabase gateway configuration is incomplete.');
const boundedFetch:typeof fetch=(input,init={})=>fetch(input,{...init,signal:init.signal?AbortSignal.any([init.signal,AbortSignal.timeout(8000)]):AbortSignal.timeout(8000)});
const options={auth:{persistSession:false,autoRefreshToken:false},global:{fetch:boundedFetch}};
const auth=createClient(supabaseUrl,publicKey,options);
const admin=createClient(supabaseUrl,secretKey,options);
const allowedOrigins=(Deno.env.get('RELAY_ALLOWED_ORIGINS')??'').split(',').map(value=>value.trim()).filter(Boolean);
if(!allowedOrigins.length||allowedOrigins.some(value=>new URL(value).origin!==value))throw new Error('Set explicit allowed website origins.');
const provider=createOpenAIProvider({apiKey:Deno.env.get('OPENAI_API_KEY'),model:Deno.env.get('OPENAI_MODEL')});

Deno.serve(createRelayHandler({
  allowedOrigins,
  provider,
  authenticate:async token=>{
    // getUser contacts Auth and verifies this exact JWT. Decoding claims alone is insufficient.
    const {data,error}=await auth.auth.getUser(token);
    if(error||!data.user||data.user.is_anonymous)return null;
    return {id:data.user.id};
  },
  consumeAllowance:async userId=>{
    const {data,error}=await admin.rpc('reserve_relay_ai_request',{p_user_id:userId});
    if(error||!Array.isArray(data)||data.length!==1)throw new Error('Allowance reservation failed.');
    return data[0];
  }
}));
