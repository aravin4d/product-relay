import {createClient} from 'npm:@supabase/supabase-js@2.117.2';
const env=(name:string,legacy:string)=>Deno.env.get(name)??Deno.env.get(legacy)??'';
function key(dictionary:string,single:string,legacy:string){const raw=Deno.env.get(dictionary);return raw?JSON.parse(raw).default:env(single,legacy);}
const url=Deno.env.get('SUPABASE_URL')??'';
const secret=key('SUPABASE_SECRET_KEYS','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY'),publicKey=key('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_PUBLISHABLE_KEY','SUPABASE_ANON_KEY');
if(!url||!secret||!publicKey)throw new Error('Backend configuration is incomplete.');
const options={auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input:RequestInfo|URL,init:RequestInit={})=>fetch(input,{...init,signal:init.signal?AbortSignal.any([init.signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)})}};
export const admin=createClient(url,secret,options),auth=createClient(url,publicKey,options);
export const allowedOrigins=(Deno.env.get('RELAY_ALLOWED_ORIGINS')??'').split(',').map(s=>s.trim()).filter(Boolean);
if(!allowedOrigins.length||allowedOrigins.some(s=>new URL(s).origin!==s))throw new Error('Explicit website origins are required.');
export async function authenticate(token:string){const {data,error}=await auth.auth.getUser(token);return error||!data.user||data.user.is_anonymous?null:{id:data.user.id};}
