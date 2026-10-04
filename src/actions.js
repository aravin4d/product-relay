// Manual, portable follow-through. Names and receipts are self-reported, not authenticated.
import {uid, clone, isStale} from './domain.js';

export const ACTION_ROLES = ['Product','Development','QA','Operations','Support'];
export const ACTION_STATUSES = ['proposed','accepted','in-progress','blocked','completed','not-applicable'];
const now = () => new Date().toISOString();
const meaningFields = ['actor','condition','outcome','applicability'];
const editableFields = ['impactReviewId','role','title','acceptanceCriteria','rationale','ownerId'];
const text = value => typeof value === 'string' && value.length <= 20000;
const required = value => text(value) && !!value.trim();
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const meaningEqual = (a,b) => meaningFields.every(key => a?.[key] === b?.[key]);
const changedActionScope = (before,after) => !meaningEqual(before.behaviorSnapshot,after.behaviorSnapshot)||before.role!==after.role||before.acceptanceCriteria!==after.acceptanceCriteria;
const expectedStatusRevision = (before,after) => !changedActionScope(before,after)&&before.statusRevision===before.revision?after.revision:before.statusRevision;
const equalExcept = (before,after,keys) => same(Object.fromEntries(Object.entries(before).filter(([key])=>!keys.includes(key))),Object.fromEntries(Object.entries(after).filter(([key])=>!keys.includes(key))));
function ensure(project) { for(const key of ['impactReviews','actions','actionChanges','actionDecisions','acknowledgments','verifications']) project[key] ??= []; }
function event(project,message) { project.events.push({id:uid(),text:message,at:now()}); }
function member(project,id) { const value=project.members?.find(item=>item.id===id);if(!value)throw new Error('Choose a named project teammate.');return value; }
function activeBehavior(project,id) { const value=project.behaviors?.find(item=>item.id===id);if(!value||value.status!=='approved'||value.archived)throw new Error('Choose an active approved product rule.');return value; }
function actionById(project,id) { const value=project.actions?.find(item=>item.id===id);if(!value)throw new Error('Team action not found.');return value; }
export function getBehaviorRevision(project,behaviorId,revision) {
  const record=project.decisions?.find(item=>item.behaviorId===behaviorId&&item.action!=='rejected'&&item.after?.revision===revision);
  if(!record)throw new Error('Choose an agreed product rule revision.');
  return clone(record.after);
}
function currentSnapshot(project,id) { const behavior=activeBehavior(project,id);return getBehaviorRevision(project,id,behavior.revision); }
function reviewById(project,id) { const value=project.impactReviews?.find(item=>item.id===id);if(!value)throw new Error('Confirm the rule impact before proposing team work.');return value; }
function applicableReview(project,id) { const review=reviewById(project,id),current=activeBehavior(project,review.behaviorId);if(!meaningEqual(current,review.behaviorSnapshot))throw new Error('The rule scope changed. Confirm its impact again.');return review; }
const templates = {
  Product: ['Confirm the product scope','Record the agreed scope, release boundary, and outstanding product decisions.'],
  Development: ['Implement the agreed behavior','Describe the implementation and show how it covers the actor, condition, outcome, and applicability.'],
  QA: ['Check the agreed behavior','Record checks for the applicable condition and outcome, including relevant boundary and exception cases.'],
  Operations: ['Prepare the applicable rollout','Record applicable rollout, rollback, monitoring, and runbook decisions; explain any items that do not apply.'],
  Support: ['Prepare the support guidance','Record customer-facing guidance and escalation handling for the applicable behavior and exceptions.']
};
export function getActionSuggestions(project,behaviorId) {
  const snapshot=currentSnapshot(project,behaviorId);
  return ACTION_ROLES.map(role=>({role,title:`${templates[role][0]}: ${snapshot.title}`,acceptanceCriteria:`${templates[role][1]}\nActor: ${snapshot.actor}\nWhen: ${snapshot.condition}\nOutcome: ${snapshot.outcome}\nApplies to: ${snapshot.applicability}`,rationale:`Manual ${role} follow-through for ${snapshot.title}; applicability must be confirmed by the reviewer.`,behaviorId,behaviorRevision:snapshot.revision,behaviorSnapshot:clone(snapshot)}));
}
export function confirmBehaviorImpact(project,behaviorId,{reviewerId,roles,rationale}) {
  const snapshot=currentSnapshot(project,behaviorId);member(project,reviewerId);
  if(!Array.isArray(roles)||!roles.length||roles.some(role=>!ACTION_ROLES.includes(role))||new Set(roles).size!==roles.length||!required(rationale))throw new Error('Select applicable team perspectives and explain the manually reviewed impact.');
  const review={id:uid(),behaviorId,behaviorRevision:snapshot.revision,behaviorSnapshot:snapshot,reviewerId,roles:clone(roles),rationale:rationale.trim(),at:now(),selfReported:true};
  ensure(project);project.impactReviews.push(review);event(project,`Manually reviewed team impact: ${snapshot.title}`);return review;
}
function actionDetails(project,input,base=null) {
  const values={};for(const key of editableFields)values[key]=input[key]??base?.[key]??(key==='ownerId'?'':undefined);
  const review=applicableReview(project,values.impactReviewId);
  if(!review.roles.includes(values.role)||!ACTION_ROLES.includes(values.role)||!['title','acceptanceCriteria','rationale'].every(key=>required(values[key])))throw new Error('An action needs a reviewed perspective, title, acceptance criteria, and rationale.');
  if(typeof values.ownerId!=='string')throw new Error('Choose a valid action owner.');if(values.ownerId)member(project,values.ownerId);
  return {...values,title:values.title.trim(),acceptanceCriteria:values.acceptanceCriteria.trim(),rationale:values.rationale.trim(),behaviorId:review.behaviorId,behaviorRevision:review.behaviorRevision,behaviorSnapshot:clone(review.behaviorSnapshot)};
}
export function addAction(project,input) {
  const value=actionDetails(project,input),record={id:uid(),...value,status:'proposed',revision:1,statusRevision:1,createdAt:now(),updatedAt:now()};
  ensure(project);project.actions.push(record);event(project,`Proposed ${record.role} action: ${record.title}`);return record;
}
export function proposeRoleActions(project,impactReviewId,{ownerIds={}}={}) {
  const review=applicableReview(project,impactReviewId),suggestions=getActionSuggestions(project,review.behaviorId).filter(item=>review.roles.includes(item.role));
  // Validate the entire batch before committing any suggestion.
  const inputs=suggestions.map(item=>({impactReviewId,role:item.role,title:item.title,acceptanceCriteria:item.acceptanceCriteria,rationale:review.rationale,ownerId:ownerIds[item.role]??''}));
  inputs.forEach(input=>actionDetails(project,input));return inputs.map(input=>addAction(project,input));
}
export function editAction(project,id,input) {
  const action=actionById(project,id);if(action.status!=='proposed')throw new Error('Only proposed actions can be edited directly. Use an action change for accepted scope.');
  const value=actionDetails(project,input,action);if(value.behaviorId!==action.behaviorId)throw new Error('An action cannot move to another product rule.');
  ensure(project);const before=clone(action);Object.assign(action,value,{revision:action.revision+1,statusRevision:action.revision+1,updatedAt:now()});decision(project,action,'edited',before,action,reviewById(project,action.impactReviewId).reviewerId,'Edited proposed action scope.');event(project,`Edited proposed team action: ${action.title}`);return action;
}
function decision(project,action,kind,before,after,memberId,note,proposalId) {
  const record={id:uid(),actionId:action.id,revision:after?.revision??before.revision,kind,memberId,note:note.trim(),before:clone(before),after:after?clone(after):null,at:now(),selfReported:true};
  if(proposalId)record.proposalId=proposalId;project.actionDecisions.push(record);return record;
}
export function actionReviewState(project,actionOrId) {
  const action=typeof actionOrId==='string'?actionById(project,actionOrId):actionOrId,current=project.behaviors?.find(item=>item.id===action.behaviorId),archived=!current||!!current.archived;
  const rulesStale=!current||!meaningEqual(current,action.behaviorSnapshot),sourceNeedsReview=isStale(project,current??action.behaviorSnapshot),reasons=[];
  if(archived)reasons.push('The linked product rule is archived or unavailable.');
  if(rulesStale)reasons.push('The actor, condition, outcome, or applicability changed after this action was scoped.');
  if(['completed','not-applicable'].includes(action.status)&&action.statusRevision!==action.revision)reasons.push('The reported outcome belongs to an earlier action scope revision.');
  return {needsReview:reasons.length>0,rulesStale,sourceNeedsReview,archived,reasons};
}
export function acceptAction(project,id,{reviewerId,note=''}) {
  const action=actionById(project,id);member(project,reviewerId);if(!text(note))throw new Error('Use a valid review note.');
  if(action.status!=='proposed')throw new Error('Only proposed actions can have their scope accepted.');
  if(actionReviewState(project,action).needsReview)throw new Error('Review this action against the current active rule before accepting its scope.');
  if(!action.ownerId)throw new Error('Assign a named owner before accepting this action.');
  ensure(project);const before=clone(action);Object.assign(action,{status:'accepted',updatedAt:now()});decision(project,action,'accepted',before,action,reviewerId,note);event(project,`Accepted team action scope: ${action.title}`);return action;
}
export function updateActionStatus(project,id,status,{memberId,note=''}) {
  const action=actionById(project,id);member(project,memberId);
  if(action.status==='proposed'||!ACTION_STATUSES.includes(status)||status==='proposed')throw new Error('Accept action scope before recording progress.');
  if(!text(note)||(['blocked','completed','not-applicable'].includes(status)&&!required(note)))throw new Error('Record a reason or completion note for this action status.');
  const state=actionReviewState(project,action);if(state.rulesStale||state.archived)throw new Error('Review the changed action scope before recording new progress.');
  ensure(project);const before=clone(action);Object.assign(action,{status,statusRevision:action.revision,updatedAt:now()});decision(project,action,'status',before,action,memberId,note);event(project,`Reported ${status} team action: ${action.title}`);return action;
}
export function proposeActionChange(project,id,input,reason) {
  const action=actionById(project,id);if(action.status==='proposed')throw new Error('Edit proposed actions directly.');if(!required(reason))throw new Error('Explain why the accepted action should change.');
  const proposed=actionDetails(project,input,action);if(proposed.behaviorId!==action.behaviorId)throw new Error('An action cannot move to another product rule.');
  if([...editableFields,'behaviorRevision'].every(key=>same(proposed[key],action[key])))throw new Error('Change the action scope or owner before proposing an update.');
  const record={id:uid(),actionId:id,base:clone(action),proposed,reason:reason.trim(),status:'pending',at:now()};ensure(project);project.actionChanges.push(record);return record;
}
export function acceptActionChange(project,proposalId,{reviewerId,note=''}) {
  const proposal=project.actionChanges?.find(item=>item.id===proposalId);if(!proposal||proposal.status!=='pending')throw new Error('This action change is no longer pending.');member(project,reviewerId);if(!text(note))throw new Error('Use a valid review note.');
  const action=actionById(project,proposal.actionId);if(!same(action,proposal.base))throw new Error('The action changed after this proposal. Recreate it.');
  const value=actionDetails(project,proposal.proposed);if(!value.ownerId)throw new Error('Assign a named owner before accepting this action.');
  const before=clone(action),revision=action.revision+1,statusRevision=expectedStatusRevision(action,{...value,revision});
  Object.assign(action,value,{revision,statusRevision,updatedAt:now()});proposal.status='accepted';decision(project,action,'change-accepted',before,action,reviewerId,note,proposal.id);event(project,`Accepted team action update: ${action.title}`);return action;
}
export function rejectActionChange(project,proposalId,{reviewerId,note=''}) {
  const proposal=project.actionChanges?.find(item=>item.id===proposalId);if(!proposal||proposal.status!=='pending')throw new Error('This action change is no longer pending.');member(project,reviewerId);if(!text(note))throw new Error('Use a valid review note.');
  const action=actionById(project,proposal.actionId);proposal.status='rejected';decision(project,action,'change-rejected',proposal.base,null,reviewerId,note,proposal.id);return proposal;
}
export function acknowledgeAction(project,id,{memberId,note=''}) {
  const action=actionById(project,id);member(project,memberId);if(!text(note))throw new Error('Use a valid acknowledgment note.');
  const record={id:uid(),targetType:'action',actionId:id,actionRevision:action.revision,behaviorId:action.behaviorId,behaviorRevision:action.behaviorRevision,memberId,note:note.trim(),at:now(),selfReported:true};ensure(project);project.acknowledgments.push(record);return record;
}
export function acknowledgeBehaviorChange(project,proposalId,{memberId,note=''}) {
  const proposal=project.behaviorChanges?.find(item=>item.id===proposalId),agreed=project.decisions?.find(item=>item.proposalId===proposalId&&item.action==='accepted');
  if(!proposal||proposal.status!=='accepted'||!agreed)throw new Error('Choose an accepted product rule change.');member(project,memberId);if(!text(note))throw new Error('Use a valid acknowledgment note.');
  const record={id:uid(),targetType:'behavior-change',changeId:proposalId,behaviorId:proposal.behaviorId,behaviorRevision:agreed.revision,memberId,note:note.trim(),at:now(),selfReported:true};ensure(project);project.acknowledgments.push(record);return record;
}
function safeUrl(value) {if(value==='')return true;if(typeof value!=='string'||value.length>2000)return false;try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password;}catch{return false;} }
export function recordVerification(project,behaviorId,{behaviorRevision,memberId,environment,release,result,artifactUrl='',note='',context='current'}) {
  const snapshot=getBehaviorRevision(project,behaviorId,behaviorRevision);member(project,memberId);
  if(!required(environment)||!required(release)||!['pass','fail','inconclusive'].includes(result)||!safeUrl(artifactUrl)||!text(note)||(!artifactUrl&&!required(note))||!['current','historical'].includes(context))throw new Error('Record an environment, release, result, and a safe artifact URL or evidence note.');
  if(context==='current') {const behavior=activeBehavior(project,behaviorId);if(behavior.revision!==behaviorRevision)throw new Error('Current verification must use the current agreed rule revision. Choose historical context for an earlier revision.');if(result==='pass'&&isStale(project,behavior))throw new Error('Supporting sources changed. Review the agreed rule evidence before recording a new current pass.');}
  const record={id:uid(),behaviorId,behaviorRevision,behaviorSnapshot:snapshot,memberId,environment:environment.trim(),release:release.trim(),result,artifactUrl,note:note.trim(),context,selfReported:true,at:now()};ensure(project);project.verifications.push(record);event(project,`Recorded self-reported ${result} verification: ${snapshot.title}`);return record;
}
export function verificationState(project,verificationOrId) {
  const record=typeof verificationOrId==='string'?project.verifications?.find(item=>item.id===verificationOrId):verificationOrId;if(!record)throw new Error('Verification record not found.');
  const current=project.behaviors?.find(item=>item.id===record.behaviorId),rulesStale=!current||!meaningEqual(current,record.behaviorSnapshot),sourceNeedsReview=isStale(project,current??record.behaviorSnapshot),reasons=[];
  if(record.context==='historical')reasons.push('This record was explicitly supplied for a historical agreed revision.');
  if(!current||current.archived)reasons.push('The linked product rule is archived or unavailable.');
  if(rulesStale)reasons.push('The actor, condition, outcome, or applicability changed after this verification.');
  const state=record.context==='historical'?'historical':reasons.length?'stale':'applicable';return {state,rulesStale,sourceNeedsReview,reasons};
}
export function listActions(project,{role='Everyone',behaviorId='',versionId=''}={}) {
  if(role!=='Everyone'&&!ACTION_ROLES.includes(role))throw new Error('Unknown team action perspective.');
  const actions=versionId?project.versions.find(item=>item.id===versionId)?.actions??[]:project.actions??[];
  return actions.filter(item=>(role==='Everyone'||item.role===role)&&(!behaviorId||item.behaviorId===behaviorId));
}
export function reviewSummary(project,{behaviorId=''}={}) {
  const actions=listActions(project,{behaviorId}).map(action=>({action,state:actionReviewState(project,action)}));
  const verifications=(project.verifications??[]).filter(item=>!behaviorId||item.behaviorId===behaviorId).map(verification=>({verification,state:verificationState(project,verification)}));
  const missingWork=[];
  for(const behavior of project.behaviors??[])if(behavior.status==='approved'&&!behavior.archived&&(!behaviorId||behavior.id===behaviorId)) {
    const related=actions.filter(item=>item.action.behaviorId===behavior.id),reviews=(project.impactReviews??[]).filter(item=>item.behaviorId===behavior.id&&meaningEqual(item.behaviorSnapshot,behavior));
    if(!reviews.length)missingWork.push({behaviorId:behavior.id,kind:'impact-review',reason:'Team impact has not been manually confirmed for this agreed rule scope.'});
    for(const role of new Set(reviews.flatMap(item=>item.roles)))if(!related.some(item=>item.action.role===role&&!item.state.rulesStale))missingWork.push({behaviorId:behavior.id,kind:'suggested-action',reason:`${role} impact was selected, but no action has been proposed for this scope.`});
    if(isStale(project,behavior))missingWork.push({behaviorId:behavior.id,kind:'source-review',reason:'Supporting source revisions changed; the agreed rule needs source review.'});
    for(const {action,state} of related) {
      if(state.needsReview)missingWork.push({behaviorId:behavior.id,actionId:action.id,kind:'action-review',reason:state.reasons.join(' ')});
      else if(!['completed','not-applicable'].includes(action.status))missingWork.push({behaviorId:behavior.id,actionId:action.id,kind:'action-work',reason:action.status==='blocked'?`Blocked: ${project.actionDecisions?.filter(item=>item.actionId===action.id&&item.kind==='status').at(-1)?.note??'reason unavailable'}`:`${action.role} action is ${action.status}.`});
    }
    const applicable=verifications.filter(item=>item.verification.behaviorId===behavior.id&&item.state.state==='applicable');
    if(!applicable.length)missingWork.push({behaviorId:behavior.id,kind:'verification',reason:'No applicable self-reported verification has been supplied for this agreed scope.'});
    for(const {verification} of applicable)if(verification.result!=='pass')missingWork.push({behaviorId:behavior.id,kind:'verification-result',reason:`${verification.result} result reported for ${verification.release} in ${verification.environment}.`});
  }
  return {actions,verifications,missingWork,selfReported:true};
}

export function validateActionCollections(project,{identifier,timestamp,unique,validateEvidence}) {
  const limits={impactReviews:3000,actions:5000,actionChanges:5000,actionDecisions:20000,acknowledgments:20000,verifications:10000};
  for(const [key,limit] of Object.entries(limits)){const list=project[key]??[];if(!Array.isArray(list)||list.length>limit)throw new Error(`Invalid ${key} collection.`);unique(list,key);}
  const members=new Set((project.members??[]).map(item=>item.id)),actions=project.actions??[],actionIds=new Set(actions.map(item=>item.id)),changes=project.actionChanges??[],changeMap=new Map(changes.map(item=>[item.id,item])),reviews=project.impactReviews??[],reviewMap=new Map(reviews.map(item=>[item.id,item]));
  const knownMember=id=>identifier(id)&&members.has(id),validRevision=value=>Number.isSafeInteger(value)&&value>0;
  function snapshot(record) {
    if(!identifier(record.behaviorId)||!validRevision(record.behaviorRevision)||record.behaviorSnapshot?.id!==record.behaviorId||record.behaviorSnapshot?.revision!==record.behaviorRevision)throw new Error('Invalid action rule revision reference.');
    validateEvidence(record.behaviorSnapshot.evidence);
    if(!same(getBehaviorRevision(project,record.behaviorId,record.behaviorRevision),record.behaviorSnapshot))throw new Error('Team work must preserve the exact agreed rule snapshot.');
  }
  for(const review of reviews){snapshot(review);if(!knownMember(review.reviewerId)||!Array.isArray(review.roles)||!review.roles.length||review.roles.some(role=>!ACTION_ROLES.includes(role))||new Set(review.roles).size!==review.roles.length||!required(review.rationale)||!timestamp(review.at)||review.selfReported!==true)throw new Error('Invalid manual impact review.');}
  function details(record) {
    snapshot(record);const review=reviewMap.get(record.impactReviewId);
    if(!review||review.behaviorId!==record.behaviorId||review.behaviorRevision!==record.behaviorRevision||!same(review.behaviorSnapshot,record.behaviorSnapshot)||!review.roles.includes(record.role)||!ACTION_ROLES.includes(record.role)||!['title','acceptanceCriteria','rationale'].every(key=>required(record[key]))||typeof record.ownerId!=='string'||(record.ownerId&&!knownMember(record.ownerId)))throw new Error('Invalid reviewed team action scope or owner.');
  }
  function action(record) {
    details(record);if(!identifier(record.id)||!ACTION_STATUSES.includes(record.status)||!validRevision(record.revision)||!validRevision(record.statusRevision)||record.statusRevision>record.revision||!timestamp(record.createdAt)||!timestamp(record.updatedAt)||(record.status!=='proposed'&&!record.ownerId))throw new Error('Invalid team action state.');
  }
  actions.forEach(action);
  for(const change of changes){if(!actionIds.has(change.actionId)||change.base?.id!==change.actionId||change.base?.status==='proposed'||!required(change.reason)||!['pending','accepted','rejected'].includes(change.status)||!timestamp(change.at))throw new Error('Invalid team action change.');action(change.base);details(change.proposed);if(change.proposed.behaviorId!==change.base.behaviorId||['id','status','revision','statusRevision'].some(key=>change.proposed[key]!==undefined))throw new Error('An action proposal cannot replace identity or progress.');}
  const latestStates=new Map(),knownStates=[...actions];
  for(const record of project.actionDecisions??[]) {
    if(!actionIds.has(record.actionId)||record.before?.id!==record.actionId||!validRevision(record.revision)||!['edited','accepted','status','change-accepted','change-rejected'].includes(record.kind)||!knownMember(record.memberId)||!text(record.note)||!timestamp(record.at)||record.selfReported!==true)throw new Error('Invalid team action decision.');action(record.before);
    if(record.kind==='change-rejected'){if(record.after!==null||record.revision!==record.before.revision)throw new Error('Invalid rejected action snapshot.');}
    else {action(record.after);if(record.after.id!==record.actionId||record.after.revision!==record.revision)throw new Error('Invalid team action decision snapshot.');}
    if(record.kind==='accepted'&&(record.before.status!=='proposed'||record.after.status!=='accepted'||!equalExcept(record.before,record.after,['status','updatedAt'])))throw new Error('Invalid team action scope acceptance.');
    if(record.kind==='edited'&&(record.before.status!=='proposed'||record.after.status!=='proposed'||record.after.revision!==record.before.revision+1||record.after.statusRevision!==record.after.revision||record.after.createdAt!==record.before.createdAt||record.after.behaviorId!==record.before.behaviorId))throw new Error('Invalid proposed action edit.');
    if(record.kind==='status'&&(record.before.status==='proposed'||record.after.status==='proposed'||!equalExcept(record.before,record.after,['status','statusRevision','updatedAt'])||record.after.statusRevision!==record.after.revision||(['blocked','completed','not-applicable'].includes(record.after.status)&&!required(record.note))))throw new Error('Invalid team action progress report.');
    if(record.kind==='change-accepted'&&(record.before.status==='proposed'||record.after.revision!==record.before.revision+1||record.after.status!==record.before.status||record.after.createdAt!==record.before.createdAt||record.after.statusRevision!==expectedStatusRevision(record.before,record.after)))throw new Error('Invalid accepted action scope revision.');
    if(record.kind.startsWith('change-')){const proposal=changeMap.get(record.proposalId);if(!proposal||proposal.actionId!==record.actionId||proposal.status!==(record.kind==='change-accepted'?'accepted':'rejected')||!same(record.before,proposal.base))throw new Error('Invalid action decision proposal reference.');if(record.kind==='change-accepted'&&[...editableFields,'behaviorId','behaviorRevision','behaviorSnapshot'].some(key=>!same(record.after[key],proposal.proposed[key])))throw new Error('Accepted action scope must match its reviewed proposal.');}
    else if(record.proposalId!==undefined)throw new Error('Invalid action decision proposal reference.');
    if(record.kind!=='change-rejected') {
      const prior=latestStates.get(record.actionId);
      if(prior?!same(prior,record.before):!['edited','accepted'].includes(record.kind)||record.before.revision!==1||record.before.statusRevision!==1)throw new Error('Team action history is missing or out of sequence.');
      latestStates.set(record.actionId,record.after);knownStates.push(record.before,record.after);
    }
  }
  for(const record of actions)if(record.status!=='proposed'&&!(project.actionDecisions??[]).some(item=>item.actionId===record.id&&['accepted','change-accepted'].includes(item.kind)&&item.revision===record.revision))throw new Error('Accepted action is missing scope review history.');
  for(const record of actions){const latest=(project.actionDecisions??[]).filter(item=>item.actionId===record.id&&item.after).at(-1);if(latest?!same(latest.after,record):record.status!=='proposed'||record.revision!==1||record.statusRevision!==1)throw new Error('Team action state does not match its recorded history.');}
  for(const change of changes)if(!knownStates.some(item=>same(item,change.base)))throw new Error('Action proposal base is not a recorded action revision.');
  for(const change of changes)if(change.status!=='pending'&&!(project.actionDecisions??[]).some(item=>item.proposalId===change.id&&item.kind===(change.status==='accepted'?'change-accepted':'change-rejected')))throw new Error('Reviewed action change is missing its decision history.');
  for(const receipt of project.acknowledgments??[]) {
    if(!knownMember(receipt.memberId)||!text(receipt.note)||!timestamp(receipt.at)||receipt.selfReported!==true)throw new Error('Invalid self-reported acknowledgment.');getBehaviorRevision(project,receipt.behaviorId,receipt.behaviorRevision);
    if(receipt.targetType==='action') {if(!knownStates.some(item=>item.id===receipt.actionId&&item.revision===receipt.actionRevision&&item.behaviorId===receipt.behaviorId&&item.behaviorRevision===receipt.behaviorRevision))throw new Error('Invalid action acknowledgment revision.');}
    else if(receipt.targetType==='behavior-change'){if(!(project.decisions??[]).some(item=>item.action==='accepted'&&item.proposalId===receipt.changeId&&item.behaviorId===receipt.behaviorId&&item.revision===receipt.behaviorRevision))throw new Error('Invalid changed rule acknowledgment.');}
    else throw new Error('Invalid acknowledgment target.');
  }
  for(const record of project.verifications??[]){snapshot(record);if(!knownMember(record.memberId)||!required(record.environment)||!required(record.release)||!['pass','fail','inconclusive'].includes(record.result)||!safeUrl(record.artifactUrl)||!text(record.note)||(!record.artifactUrl&&!required(record.note))||!['current','historical'].includes(record.context)||!timestamp(record.at)||record.selfReported!==true)throw new Error('Invalid self-reported verification.');}
  for(const version of project.versions)if(version.actions!==undefined){if(!Array.isArray(version.actions)||version.actions.length>5000)throw new Error('Invalid baseline actions.');unique(version.actions,'snapshot action');for(const record of version.actions){action(record);if(!actionIds.has(record.id)||!knownStates.some(item=>same(item,record))||!(version.behaviors??[]).some(item=>item.id===record.behaviorId&&meaningEqual(item,record.behaviorSnapshot)))throw new Error('Baseline action must reference a recorded action revision and an agreed baseline rule.');}}
}
export function cleanActionCollections(project,cleanBehavior,pick) {
  const scoped=record=>({...pick(record,['impactReviewId','role','title','acceptanceCriteria','rationale','ownerId','behaviorId','behaviorRevision']),behaviorSnapshot:cleanBehavior(record.behaviorSnapshot)});
  const action=record=>({...scoped(record),...pick(record,['id','status','revision','statusRevision','createdAt','updatedAt'])});
  return {
    impactReviews:(project.impactReviews??[]).map(record=>({...pick(record,['id','behaviorId','behaviorRevision','reviewerId','roles','rationale','at','selfReported']),behaviorSnapshot:cleanBehavior(record.behaviorSnapshot)})),
    actions:(project.actions??[]).map(action),
    actionChanges:(project.actionChanges??[]).map(record=>({...pick(record,['id','actionId','reason','status','at']),base:action(record.base),proposed:scoped(record.proposed)})),
    actionDecisions:(project.actionDecisions??[]).map(record=>({...pick(record,['id','actionId','revision','kind','memberId','note','at','selfReported','proposalId']),before:action(record.before),after:record.after?action(record.after):null})),
    acknowledgments:(project.acknowledgments??[]).map(record=>pick(record,['id','targetType','actionId','actionRevision','changeId','behaviorId','behaviorRevision','memberId','note','at','selfReported'])),
    verifications:(project.verifications??[]).map(record=>({...pick(record,['id','behaviorId','behaviorRevision','memberId','environment','release','result','artifactUrl','note','context','selfReported','at']),behaviorSnapshot:cleanBehavior(record.behaviorSnapshot)})),
    cleanAction:action
  };
}
