import {AIError} from '../../../src/ai.js';
import * as D from '../../../src/domain.js';
import * as L from '../../../src/lifecycle.js';
import * as K from '../../../src/knowledge.js';
import {equal,canonical} from '../../../src/value.js';
export function createProjectAIAuthorizer(admin){return async (userId,input)=>{
 if(!input.projectId)return; // Portable excerpts are explicitly supplied by the file holder.
 const {data:project,error:projectError}=await admin.from('relay_projects').select('active').eq('id',input.projectId).maybeSingle();if(projectError||!project?.active)throw new AIError('Selected shared project is unavailable.','context_access_denied');
 const deny=()=>{throw new AIError('Selected shared context is unavailable or changed.','context_access_denied');};
 const {data:member,error:membershipError}=await admin.from('relay_memberships').select('active,capability').eq('project_id',input.projectId).eq('user_id',userId).maybeSingle();if(membershipError||!member?.active||!['owner','reviewer','editor'].includes(member.capability))deny();
 const {data,error}=await admin.from('relay_project_state').select('payload').eq('project_id',input.projectId).maybeSingle();if(error||!data)deny();const p=D.importProject(D.exportProject(data.payload));
 if(input.task==='answer_question'){
  const selection=input.answerContext?.selection;if(!selection)deny();let expected;try{expected=K.answerPayload(p,K.retrieveKnowledge(p,input.question,{...selection,role:input.answerContext.role}));}catch{deny();}
  if(input.baselineLabel!==expected.baselineLabel||input.projectTitle!==expected.projectTitle||!equal(input.answerContext.agreements,expected.answerContext.agreements)||!equal(input.sources,expected.sources)||!equal(input.answerContext.unknowns,expected.answerContext.unknowns))deny();
 }else for(const supplied of input.sources){const source=p.sources.find(s=>s.id===supplied.sourceId),revision=source?.revisions.find(r=>r.id===supplied.revisionId);if(!source||source.archived||source.origin?.access==='lost'||revision?.id!==source.revisions.at(-1)?.id||!revision.content.includes(supplied.content))deny();}
 if(input.taskContext){if(!D.getRoles(p).includes(input.taskContext.role)||input.taskContext.allowedRoles&&!equal(input.taskContext.allowedRoles,D.activeRoles(p)))deny();for(const selected of input.taskContext.records){const r=L.ref(p,selected.kind,selected.id,selected.revision);if(!r||r.archived||L.ref(p,selected.kind,selected.id)?.revision!==selected.revision)deny();const description=(selected.kind==='requirements'?L.requirementText(p,r):canonical(r.data))+'\nScope: '+canonical(r.scope);if(r.title!==selected.title||description!==selected.description)deny();}}
};}
