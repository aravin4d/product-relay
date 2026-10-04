import * as D from './domain.js';
const now=()=>new Date().toISOString();
import {equal as same} from './value.js';
export function captureStatement(p,{title,sourceId,quote,behaviorId='',role='Everyone',owner=''}) {
  if(!title?.trim()||!D.getRoles(p).includes(role))throw new Error('Give the statement a title and team perspective.');
  const evidence=D.makeEvidence(p,sourceId,quote),behavior=p.behaviors.find(b=>b.id===behaviorId);
  if(behaviorId&&(!behavior||behavior.status!=='approved'||behavior.archived))throw new Error('Compare with an active agreed rule.');
  const question=D.addQuestion(p,title,role,owner);
  const record={id:D.uid(),title:title.trim(),evidence,behaviorId,base:behavior?D.getBehaviorRevision(p,behaviorId,behavior.revision):null,questionId:question.id,role,owner:owner.trim(),status:'open',resolution:'',reviewerId:'',resultType:'',resultId:'',at:now()};
  p.reconciliations??=[];p.reconciliations.push(record);return record;
}
export function reconciliationState(p,record) {
  const stale=D.isStale(p,{evidence:[record.evidence]});
  const current=p.behaviors.find(b=>b.id===record.behaviorId),agreementChanged=!!record.base&&(!current||!same(current,record.base));
  const proposal=record.resultType==='proposal'?p.behaviorChanges.find(c=>c.id===record.resultId):null;
  return {stale,agreementChanged,state:proposal?`Proposal ${proposal.status}`:record.status==='open'?'Awaiting owner decision':record.resultType==='draft'?(p.behaviors.find(b=>b.id===record.resultId)?.status==='approved'?'New rule approved':'Rule draft awaiting approval'):'Decision recorded'};
}
export function resolveStatement(p,id,{reviewerId,resolution,action='keep',details}) {
  const r=p.reconciliations?.find(r=>r.id===id);if(!r||r.status!=='open')throw new Error('Choose an unresolved statement.');
  if(!p.members.some(m=>m.id===reviewerId)||!resolution?.trim())throw new Error('Choose a named reviewer and record the decision.');
  const state=reconciliationState(p,r);let resultId='';
  if(!['keep','defer','propose','draft'].includes(action))throw new Error('Choose a supported resolution.');
  if(action==='propose'||action==='draft') {
    if(state.stale||state.agreementChanged)throw new Error('The source or agreement changed. Capture a new comparison before proposing an update.');
    const input={...details,evidence:[D.clone(r.evidence)]};
    const result=action==='propose'?D.proposeBehaviorChange(p,r.behaviorId,input,resolution):D.addBehavior(p,input);resultId=result.id;
  }
  if(action==='defer') {r.resolution=resolution.trim();r.reviewerId=reviewerId;p.events.push({id:D.uid(),text:`Deferred walkthrough decision: ${r.title}`,at:now()});return r;}
  r.status='reviewed';r.resolution=resolution.trim();r.reviewerId=reviewerId;r.resultType=action==='propose'?'proposal':action;r.resultId=resultId;r.resolvedAt=now();
  D.resolveQuestion(p,r.questionId,resolution+(action==='propose'?' (Rule proposal awaits separate approval.)':action==='draft'?' (New rule draft awaits separate approval.)':''));return r;
}
export function validateReconciliations(p,{identifier,timestamp,unique,validateEvidence}) {
  const list=p.reconciliations??[];if(!Array.isArray(list)||list.length>2000)throw new Error('Invalid walkthrough reviews.');unique(list,'walkthrough review');
  for(const r of list){
    validateEvidence([r.evidence]);
    if(typeof r.title!=='string'||!r.title.trim()||r.title.length>2000||!D.getRoles(p).includes(r.role)||typeof r.owner!=='string'||!p.questions.some(q=>q.id===r.questionId)||!['open','reviewed'].includes(r.status)||!timestamp(r.at)||typeof r.resolution!=='string'||r.resolution.length>20000||typeof r.reviewerId!=='string'||typeof r.resultType!=='string'||typeof r.resultId!=='string')throw new Error('Invalid walkthrough decision.');
    if(r.behaviorId){if(!identifier(r.behaviorId)||!r.base||!same(D.getBehaviorRevision(p,r.behaviorId,r.base.revision),r.base))throw new Error('Invalid original rule comparison.');}else if(r.base!==null)throw new Error('Invalid original rule comparison.');
    if(r.reviewerId&&!p.members.some(m=>m.id===r.reviewerId))throw new Error('Unknown walkthrough reviewer.');
    if(r.status==='reviewed'){
      if(!r.resolution.trim()||!r.reviewerId||!timestamp(r.resolvedAt)||!['keep','proposal','draft'].includes(r.resultType))throw new Error('A reviewed statement needs a recorded decision.');
      if(r.resultType==='proposal'&&!p.behaviorChanges.some(c=>c.id===r.resultId&&c.behaviorId===r.behaviorId&&same(c.base,r.base)))throw new Error('Invalid walkthrough rule proposal.');
      if(r.resultType==='draft'&&!p.behaviors.some(b=>b.id===r.resultId))throw new Error('Invalid walkthrough draft.');
      if(r.resultType==='keep'&&r.resultId)throw new Error('Invalid kept agreement.');
    }else if(r.resultType||r.resultId||r.resolvedAt)throw new Error('Unresolved statement cannot claim a rule decision.');
  }
  return D.clone(list.map(r=>Object.fromEntries(['id','title','evidence','behaviorId','base','questionId','role','owner','status','resolution','reviewerId','resultType','resultId','at','resolvedAt'].filter(k=>r[k]!==undefined).map(k=>[k,r[k]]))));
}
