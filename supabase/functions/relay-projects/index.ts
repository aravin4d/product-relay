import {admin,authenticate,allowedOrigins} from '../_shared/runtime.ts';
import {createProjectsHandler} from '../_shared/projects.js';
Deno.serve(createProjectsHandler({admin,authenticate,allowedOrigins,connectorsConfiguration:JSON.parse(Deno.env.get('RELAY_CONNECTORS_JSON')??'{"projects":{}}')}));
