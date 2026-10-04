import {equal} from './value.js';
// Qualified product rules retain their scope through review and historical snapshots.
import {ROLES, getRoles, uid, clone, isStale, makeEvidence} from './domain.js';
const now = () => new Date().toISOString();
const fields = ['title','actor','condition','outcome','applicability','owner','audiences','evidence','originRunId'];
const text = value => typeof value === 'string';
const required = value => text(value) && value.trim().length > 0 && value.length <= 20000;
function ensure(project) { project.behaviors ??= []; project.behaviorChanges ??= []; project.decisions ??= []; }
function event(project, message) { project.events.push({id:uid(), text:message, at:now()}); }
function find(project, id) {
  const behavior = project.behaviors?.find(item => item.id === id);
  if (!behavior) throw new Error('Product rule not found.');
  return behavior;
}
function details(project, input, base = null) {
  const value = {};
  for (const key of ['title','actor','condition','outcome','applicability']) {
    const raw = input[key] ?? base?.[key];
    if (!required(raw)) throw new Error('A product rule needs a title, actor, condition, outcome, and explicit applicability.');
    value[key] = raw.trim();
  }
  const owner = input.owner ?? base?.owner ?? '';
  if (!text(owner) || owner.length > 300) throw new Error('Use a valid product rule owner.');
  value.owner = owner.trim();
  const audiences = input.audiences ?? base?.audiences ?? ['Everyone'];
  if (!Array.isArray(audiences) || !audiences.length || audiences.some(role => !getRoles(project).includes(role)) || new Set(audiences).size !== audiences.length) throw new Error('Select valid team perspectives for this rule.');
  value.audiences = clone(audiences);
  if (input.sourceId === '__none') value.evidence = [];
  else if (input.sourceId) value.evidence = [makeEvidence(project, input.sourceId, input.quote)];
  else if (input.evidence !== undefined) {
    if (!Array.isArray(input.evidence) || input.evidence.length > 100) throw new Error('Invalid rule evidence.');
    value.evidence = input.evidence.map(item => {
      const current = makeEvidence(project, item.sourceId, item.quote);
      if (current.revisionId !== item.revisionId) throw new Error('Rule evidence changed. Select the current source revision.');
      return current;
    });
  } else value.evidence = clone(base?.evidence ?? []);
  const originRunId=input.originRunId??base?.originRunId;
  if(originRunId!==undefined){if(!project.aiRuns?.some(run=>run.id===originRunId))throw new Error('Unknown originating AI run.');value.originRunId=originRunId;}
  return value;
}
function decision(project, behavior, action, before, after, note, proposalId) {
  const record = {id:uid(), behaviorId:behavior.id, revision:after?.revision ?? before.revision, action, owner:after?.owner ?? before.owner, note:note.trim(), at:now(), before:clone(before), after:after ? clone(after) : null};
  if (proposalId) record.proposalId = proposalId;
  project.decisions.push(record);
  return record;
}
export function addBehavior(project, input) {
  const value = details(project, input);
  ensure(project);
  const behavior = {id:uid(), ...value, status:'draft', ownerNote:'', revision:1, updatedAt:now()};
  project.behaviors.push(behavior); event(project, `Drafted product rule: ${behavior.title}`); return behavior;
}
export function editBehavior(project, id, input) {
  const behavior = find(project,id);
  if (behavior.archived || behavior.status !== 'draft') throw new Error('Only active draft rules can be edited directly. Use a proposal for approved rules.');
  const value = details(project,input,behavior);
  Object.assign(behavior,value,{revision:behavior.revision+1, updatedAt:now()});
  event(project,`Edited draft rule: ${behavior.title}`); return behavior;
}
export function approveBehavior(project, id, ownerNote = '') {
  const behavior = find(project,id);
  if (behavior.archived || behavior.status !== 'draft') throw new Error('Only active draft rules can be approved.');
  if (!text(ownerNote)) throw new Error('Use a valid owner decision.');
  if (!behavior.owner) throw new Error('Assign an owner before approving this rule.');
  if (isStale(project,behavior)) throw new Error('The supporting source changed. Update the draft evidence before approving.');
  if (!behavior.evidence.length && !ownerNote.trim()) throw new Error('Add exact source evidence or record an explicit owner decision.');
  const before = clone(behavior);
  Object.assign(behavior,{status:'approved',ownerNote:ownerNote.trim(),updatedAt:now()});
  ensure(project); decision(project,behavior,'approved',before,behavior,ownerNote);
  event(project,`Approved product rule: ${behavior.title}`); return behavior;
}
export function proposeBehaviorChange(project, id, input, reason) {
  const behavior = find(project,id);
  if (behavior.archived || behavior.status !== 'approved') throw new Error('Only active approved rules can receive change proposals.');
  if (!required(reason)) throw new Error('Explain why this product rule should change.');
  const proposed = details(project,input,behavior);
  if (fields.every(key=>equal(proposed[key],behavior[key]))) throw new Error('Change the rule, scope, owner, audiences, or evidence before proposing an update.');
  ensure(project);
  const proposal = {id:uid(),behaviorId:id,base:clone(behavior),proposed,reason:reason.trim(),status:'pending',at:now()};
  project.behaviorChanges.push(proposal); event(project,`Proposed product rule update: ${behavior.title}`); return proposal;
}
export function behaviorProposalBlocker(project, proposal) {
  const behavior = project.behaviors?.find(item=>item.id===proposal.behaviorId);
  if (!behavior || behavior.archived) return 'Product rule is unavailable.';
  if (!equal(behavior,proposal.base)) return 'Product rule changed after this proposal. Recreate it from the current rule.';
  if (isStale(project,proposal.proposed)) return 'Supporting evidence changed. Recreate this proposal with current evidence.';
  return '';
}
export function acceptBehaviorChange(project, proposalId, ownerNote = '') {
  const proposal = project.behaviorChanges?.find(item=>item.id===proposalId);
  if (!proposal || proposal.status !== 'pending') throw new Error('This product rule proposal is no longer pending.');
  const blocker = behaviorProposalBlocker(project,proposal);
  if (blocker) throw new Error(blocker);
  if (!text(ownerNote)) throw new Error('Use a valid owner decision.');
  if (!proposal.proposed.owner) throw new Error('Assign an owner before approving this rule.');
  if (!proposal.proposed.evidence.length && !ownerNote.trim()) throw new Error('Record an explicit owner decision for this rule without evidence.');
  const behavior = find(project,proposal.behaviorId), before = clone(behavior);
  Object.assign(behavior,clone(proposal.proposed),{revision:behavior.revision+1,status:'approved',ownerNote:ownerNote.trim(),updatedAt:now()});
  proposal.status='accepted'; decision(project,behavior,'accepted',before,behavior,ownerNote,proposal.id);
  event(project,`Accepted product rule update: ${behavior.title}`); return behavior;
}
export function rejectBehaviorChange(project, proposalId) {
  const proposal = project.behaviorChanges?.find(item=>item.id===proposalId);
  if (!proposal || proposal.status !== 'pending') throw new Error('This product rule proposal is no longer pending.');
  const behavior=find(project,proposal.behaviorId);
  proposal.status='rejected'; decision(project,behavior,'rejected',proposal.base,null,proposal.reason,proposal.id);
  event(project,`Rejected product rule update: ${behavior.title}`);
}
export function archiveBehavior(project,id) {
  const behavior=find(project,id);
  if (project.behaviorChanges?.some(item=>item.behaviorId===id&&item.status==='pending')) throw new Error('Resolve pending rule proposals before archiving this rule.');
  behavior.archived=true; event(project,`Archived product rule: ${behavior.title}`);
}
export function restoreBehavior(project,id) { const behavior=find(project,id);behavior.archived=false;event(project,`Restored product rule: ${behavior.title}`); }
export function listBehaviors(project,{audience='Everyone',versionId='',includeDrafts=true}={}) {
  if (!getRoles(project).includes(audience)) throw new Error('Unknown team perspective.');
  const records=versionId ? project.versions.find(version=>version.id===versionId)?.behaviors??[] : project.behaviors??[];
  return records.filter(record=>!record.archived&&(includeDrafts||record.status==='approved')&&(audience==='Everyone'||record.audiences.includes('Everyone')||record.audiences.includes(audience)));
}
export function validateBehaviorCollections(project, context) {
  const {identifier,timestamp,archived,unique,validateEvidence,aiRunIds}=context;
  const behaviors=project.behaviors??[], changes=project.behaviorChanges??[], decisions=project.decisions??[];
  if (!Array.isArray(behaviors)||behaviors.length>1000||!Array.isArray(changes)||changes.length>2000||!Array.isArray(decisions)||decisions.length>5000) throw new Error('Invalid product rule collections.');
  unique(behaviors,'behavior');unique(changes,'behavior proposal');unique(decisions,'decision');
  function validateFields(record) {
    if (!record || ['title','actor','condition','outcome','applicability'].some(key=>!required(record[key])) || !text(record.owner) || record.owner.length>300 || !Array.isArray(record.audiences) || !record.audiences.length || record.audiences.some(role=>!getRoles(project).includes(role)) || new Set(record.audiences).size!==record.audiences.length) throw new Error('Invalid qualified product rule.');
    validateEvidence(record.evidence);
    if(record.originRunId!==undefined&&!aiRunIds?.has(record.originRunId))throw new Error('Invalid originating AI run reference.');
  }
  function validateRecord(record) {
    validateFields(record);
    if (!identifier(record.id)||!Number.isSafeInteger(record.revision)||record.revision<1||!['draft','approved'].includes(record.status)||!text(record.ownerNote)||!timestamp(record.updatedAt)||!archived(record.archived)) throw new Error('Invalid product rule review state.');
    if (record.status==='approved'&&(!record.owner.trim()||(!record.evidence.length&&!record.ownerNote.trim()))) throw new Error('Approved product rules need an owner and evidence or an explicit decision.');
  }
  const behaviorIds=new Set(behaviors.map(record=>record.id));behaviors.forEach(validateRecord);
  const proposalMap=new Map(changes.map(record=>[record.id,record]));
  for (const proposal of changes) {
    if (!behaviorIds.has(proposal.behaviorId)||proposal.base?.id!==proposal.behaviorId||proposal.base?.status!=='approved'||!required(proposal.reason)||!['pending','accepted','rejected'].includes(proposal.status)||!timestamp(proposal.at)) throw new Error('Invalid product rule proposal.');
    validateRecord(proposal.base);validateFields(proposal.proposed);
    if (proposal.proposed?.id!==undefined || proposal.proposed?.status!==undefined || proposal.proposed?.revision!==undefined) throw new Error('A product rule proposal cannot override identity or review state.');
  }
  for (const record of decisions) {
    if (!behaviorIds.has(record.behaviorId)||!Number.isSafeInteger(record.revision)||record.revision<1||!['approved','accepted','rejected'].includes(record.action)||!text(record.owner)||!record.owner.trim()||!text(record.note)||!timestamp(record.at)||record.before?.id!==record.behaviorId) throw new Error('Invalid product rule decision.');
    validateRecord(record.before);
    if (record.action==='rejected') {
      if (record.after!==null||record.revision!==record.before.revision) throw new Error('Invalid rejected rule decision.');
    } else {
      validateRecord(record.after);
      if (record.after.id!==record.behaviorId||record.after.status!=='approved'||record.after.revision!==record.revision||record.after.owner!==record.owner||record.after.ownerNote!==record.note) throw new Error('Invalid approved rule decision snapshot.');
      if (record.action==='approved'&&(record.before.status!=='draft'||record.after.revision!==record.before.revision)) throw new Error('Invalid initial rule approval.');
      if (record.action==='accepted'&&(record.before.status!=='approved'||record.after.revision!==record.before.revision+1)) throw new Error('Invalid accepted rule revision.');
    }
    if (record.action==='approved') { if(record.proposalId!==undefined)throw new Error('Initial rule approval cannot reference a proposal.'); }
    else {
      const proposal=proposalMap.get(record.proposalId);
      if (!proposal||proposal.behaviorId!==record.behaviorId||proposal.status!==record.action) throw new Error('Invalid rule decision proposal reference.');
    }
  }
  for (const record of behaviors) if(record.status==='approved'&&!decisions.some(item=>item.behaviorId===record.id&&item.action!=='rejected'&&item.revision===record.revision))throw new Error('Approved product rule is missing its decision history.');
  for (const version of project.versions) {
    const snapshots=version.behaviors??[];
    if (!Array.isArray(snapshots)||snapshots.length>1000) throw new Error('Invalid baseline product rules.');
    unique(snapshots,'snapshot behavior');
    for(const snapshot of snapshots){validateRecord(snapshot);if(!behaviorIds.has(snapshot.id)||snapshot.status!=='approved'||snapshot.archived)throw new Error('A baseline must contain approved product rules from this project.');}
  }
}
export function cleanBehaviorCollections(project, cleanEvidence, pick) {
  const clean=record=>({...pick(record,['id','title','actor','condition','outcome','applicability','owner','audiences','status','ownerNote','revision','updatedAt','archived','originRunId']),evidence:cleanEvidence(record.evidence)});
  return {
    behaviors:(project.behaviors??[]).map(clean),
    behaviorChanges:(project.behaviorChanges??[]).map(record=>({...pick(record,['id','behaviorId','reason','status','at']),base:clean(record.base),proposed:{...pick(record.proposed,fields.filter(key=>key!=='evidence')),evidence:cleanEvidence(record.proposed.evidence)}})),
    decisions:(project.decisions??[]).map(record=>({...pick(record,['id','behaviorId','revision','action','owner','note','at','proposalId']),before:clean(record.before),after:record.after?clean(record.after):null})),
    cleanBehavior:clean
  };
}
