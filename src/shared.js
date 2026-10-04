import * as D from './domain.js';
import * as L from './lifecycle.js';
import {digest,equal} from './value.js';
import {validateAIConfig,readBoundedJSON} from './ai.js';
export const sharedState={connections:new Map(),projects:[],notifications:[],jobs:[],readingPack:null,health:null,portfolio:[],status:''};
const snapshot=p=>{const b=JSON.parse(D.exportProject(p));delete b.exportedAt;return b;};
const decode=p=>D.importProject(p?.format==='product-relay'?JSON.stringify(p):D.exportProject(p));
let credentials=()=>({}),accessLost=()=>{};
export function configureShared(getCredentials,onAccessLost){credentials=getCredentials;accessLost=onAccessLost;}
export function connection(id){return sharedState.connections.get(id);}
export function clearShared(){sharedState.connections.clear();sharedState.projects=[];sharedState.notifications=[];sharedState.jobs=[];sharedState.readingPack=null;sharedState.health=null;sharedState.portfolio=[];}
function invalidateConnections(ids){for(const id of ids){sharedState.connections.delete(id);accessLost(id);}}
export async function sharedCall(operation,parameters={}, {endpoint="relay-projects"}={}){
 const {config,session}=credentials();if(!config||!session||session.expiresAt<=Date.now()){invalidateConnections([...sharedState.connections.keys()]);clearShared();throw Object.assign(new Error('Sign in to the configured shared service first.'),{code:'auth_required',status:401});}
 const safe=validateAIConfig(config);let response;
 try{response=await fetch(safe.supabaseUrl+'/functions/v1/'+endpoint,{method:'POST',headers:{apikey:safe.publishableKey,Authorization:'Bearer '+session.accessToken,'Content-Type':'application/json'},body:JSON.stringify({operation,...parameters}),credentials:'omit',redirect:'error',signal:AbortSignal.timeout(20000)});}catch{throw Object.assign(new Error('Shared service could not be reached. An attempted command may have completed; retain its ID for reconciliation.'),{code:'network_unavailable',status:0});}
 if(response.status===401){invalidateConnections([...sharedState.connections.keys()]);clearShared();}
 const result=await readBoundedJSON(response,18000000);if(!response.ok){if(response.status===403&&result.error?.code==='access_denied')invalidateConnections([parameters.projectId]);throw Object.assign(new Error(result.error?.message??'Shared operation failed.'),{code:result.error?.code,status:response.status});}return result;
}
export async function listShared(){const result=await sharedCall('list');sharedState.projects=result.projects;return result.projects;}
export async function loadShared(id){const result=await sharedCall('read',{projectId:id});if(result.readingPack){sharedState.readingPack=result.readingPack;return result;}const project=decode(result.project);sharedState.connections.set(id,{revision:result.revision,base:D.clone(project),capability:result.capability,memberId:result.memberId});return {...result,project};}
export async function createShared(p,memberId){const result=await sharedCall('create',{project:snapshot(p),memberId,consent:true});const parsed=decode(result.project);sharedState.connections.set(p.id,{revision:result.revision,base:D.clone(parsed),capability:result.capability,memberId:result.memberId});return parsed;}
export function sharedChanges(before,after){
 const changes=[];
 const compare=(kind,left,right)=>{const a=new Map(left.map(r=>[r.id,r])),b=new Map(right.map(r=>[r.id,r]));for(const id of new Set([...a.keys(),...b.keys()])){const old=a.get(id)??null,next=b.get(id)??null;if(!equal(old,next))changes.push({kind,id,title:next?.title??next?.name??old?.title??old?.name??id,before:old,after:next});}};
 for(const kind of L.FAMILIES)compare(kind,L.list(before,kind),L.list(after,kind));
 const keys=new Set([...Object.keys(before),...Object.keys(after)]);keys.delete('delivery');
 for(const kind of keys){const left=before[kind]??null,right=after[kind]??null;if(equal(left,right))continue;if(Array.isArray(left)&&Array.isArray(right)&&[...left,...right].every(r=>r&&typeof r==='object'&&typeof r.id==='string'))compare(kind,left,right);else changes.push({kind,id:kind,title:kind,before:left,after:right});}
 const metadata=p=>Object.fromEntries(Object.entries(p.delivery??{}).filter(([key])=>!L.FAMILIES.includes(key)&&key!=='pendingShared'));
 if(!equal(metadata(before),metadata(after)))changes.push({kind:'workspace settings',id:'delivery-settings',title:'Workspace settings',before:metadata(before),after:metadata(after)});
 return changes;
}
function commandPayload(p,c){const clean=D.clone(p);delete clean.delivery?.pendingShared;return {projectId:p.id,commandId:c.commandId,expectedRevision:c.expectedRevision,baseHash:c.baseHash,project:snapshot(clean)};}
export async function persistShared(p,{allowOffline=false}={}){
 const link=connection(p.id);if(!link)return {project:p};if(!['owner','reviewer','editor'].includes(link.capability))throw new Error('This shared capability cannot edit the master.');
 const pending=p.delivery?.pendingShared??{commandId:crypto.randomUUID(),expectedRevision:link.revision,baseHash:await digest(link.base),createdAt:new Date().toISOString()};
 if(p.delivery?.pendingShared)throw new Error('Reconcile the queued command before making another shared edit. Its outcome may be uncertain; the encrypted draft is retained.');
 try{const result=await sharedCall('commit',commandPayload(p,pending));link.revision=result.revision;link.base=decode(result.project);return {project:decode(result.project)};}
 catch(error){if(allowOffline&&error.code==='network_unavailable'){L.ensure(p).pendingShared=pending;return {project:p,offline:true};}throw error;}
}
export async function submitOfflineDraft(p){const pending=p.delivery?.pendingShared;if(!pending)throw new Error('No queued draft.');const result=await sharedCall('commit',commandPayload(p,pending));const link=connection(p.id);if(link){link.revision=result.revision;link.base=decode(result.project);}return decode(result.project);}
export async function refreshSharedActivity(id){const results=await Promise.allSettled([sharedCall('notifications',{projectId:id}),sharedCall('jobs',{projectId:id}),sharedCall('health',{projectId:id})]);for(let i=0;i<results.length;i++){const r=results[i];if(r.status==='fulfilled'){if(i===0)sharedState.notifications=r.value.notifications;if(i===1)sharedState.jobs=r.value.jobs;if(i===2)sharedState.health=r.value.health;}else sharedState.status=r.reason.message;}}
