import {admin} from '../_shared/runtime.ts';
import {createJobsHandler} from '../_shared/jobs.js';
const configuration=JSON.parse(Deno.env.get('RELAY_CONNECTORS_JSON')??'{"projects":{}}');
Deno.serve(createJobsHandler({admin,workerSecret:Deno.env.get('RELAY_WORKER_SECRET'),configuration,secrets:(name:string)=>Deno.env.get(name)??''}));
