import {admin,authenticate,allowedOrigins} from '../_shared/runtime.ts';
import {createOAuthHandler} from '../_shared/oauth.js';
Deno.serve(createOAuthHandler({admin,authenticate,allowedOrigins,config:JSON.parse(Deno.env.get('RELAY_OAUTH_JSON')??'{"providers":{},"returnUrls":[]}'),secrets:(name:string)=>Deno.env.get(name)??''}));
