import {DOMParser} from 'npm:@xmldom/xmldom@0.8.15';
import {admin} from '../_shared/runtime.ts';
import {createJobsHandler} from '../_shared/jobs.js';
const configuration=JSON.parse(Deno.env.get('RELAY_CONNECTORS_JSON')??'{"projects":{}}');
Deno.serve(createJobsHandler({admin,workerSecret:Deno.env.get('RELAY_WORKER_SECRET'),configuration,XMLParser:class extends DOMParser{constructor(){super({errorHandler:{warning:()=>{throw new Error('Invalid XML report.');},error:()=>{throw new Error('Invalid XML report.');},fatalError:()=>{throw new Error('Invalid XML report.');}}});}},oauthConfiguration:JSON.parse(Deno.env.get('RELAY_OAUTH_JSON')??'{"providers":{}}'),secrets:(name:string)=>Deno.env.get(name)??''}));
