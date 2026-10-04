import {admin} from '../_shared/runtime.ts';
import {createOperationsHandler} from '../_shared/operations.js';
Deno.serve(createOperationsHandler({admin,workerSecret:Deno.env.get('RELAY_WORKER_SECRET'),deliveryConfig:JSON.parse(Deno.env.get('RELAY_DELIVERY_JSON')??'{"destinations":{}}'),secrets:(name:string)=>Deno.env.get(name)??''}));
