import {validateReconciliations} from './reconciliation.js';
import {validateBehaviorCollections, cleanBehaviorCollections, addBehavior, approveBehavior} from './behaviors.js';
import {validateActionCollections, cleanActionCollections} from './actions.js';
export {addBehavior, editBehavior, approveBehavior, proposeBehaviorChange, behaviorProposalBlocker, acceptBehaviorChange, rejectBehaviorChange, archiveBehavior, restoreBehavior, listBehaviors} from './behaviors.js';
export {ACTION_ROLES, ACTION_STATUSES, getBehaviorRevision, getActionSuggestions, confirmBehaviorImpact, addAction, proposeRoleActions, editAction, acceptAction, updateActionStatus, proposeActionChange, acceptActionChange, rejectActionChange, acknowledgeAction, acknowledgeBehaviorChange, recordVerification, actionReviewState, verificationState, listActions, currentOwnerAcknowledgment, reviewSummary} from './actions.js';
export const ROLES = ['Everyone', 'Product', 'QA', 'Development', 'Operations', 'Support'];
export const uid = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();
export const clone = value => structuredClone(value);
export function createProject(name, description = '') {
  if (!name.trim()) throw new Error('Give the product a name.');
  return {id: uid(), name: name.trim(), description: description.trim(), sources: [], sections: [], changes: [], versions: [], events: [], members:[], questions:[], behaviors:[], behaviorChanges:[], decisions:[], aiRuns:[], impactReviews:[], actions:[], actionChanges:[], actionDecisions:[], acknowledgments:[], verifications:[], reconciliations:[], mergeArchives:[], createdAt: now()};
}
function event(project, text) { project.events.push({id: uid(), text, at: now()}); }
export function updateProject(project,name,description){if(!name.trim())throw new Error('Give the product a name.');project.name=name.trim();project.description=description.trim();event(project,'Updated product details');}
export function addMember(project,name,role){
  if(!name.trim()||!ROLES.includes(role))throw new Error('Add a name and choose a team perspective.');
  project.members??=[];if(project.members.some(m=>m.name.toLowerCase()===name.trim().toLowerCase()))throw new Error('That team member already exists.');
  const member={id:uid(),name:name.trim(),role};project.members.push(member);event(project,`Added ${member.name} to the project team`);return member;
}
export function updateMember(project,id,name,role){
 const member=project.members?.find(m=>m.id===id);if(!member||!name.trim()||!ROLES.includes(role))throw new Error('Choose a teammate, name, and perspective.');
 if(project.members.some(m=>m.id!==id&&m.name.toLowerCase()===name.trim().toLowerCase()))throw new Error('That team member already exists.');
 member.name=name.trim();member.role=role;event(project,`Updated teammate: ${member.name}`);
}
export function addQuestion(project,title,role='Everyone',owner=''){
  if(!title.trim()||!ROLES.includes(role))throw new Error('Add a question and audience.');project.questions??=[];
  const question={id:uid(),title:title.trim(),role,owner:owner.trim(),status:'open',resolution:'',at:now()};project.questions.push(question);event(project,`Raised question: ${question.title}`);return question;
}
export function resolveQuestion(project,id,resolution){const q=project.questions?.find(q=>q.id===id);if(!q||q.status!=='open'||!resolution.trim())throw new Error('Record an answer or decision before resolving this question.');q.status='resolved';q.resolution=resolution.trim();event(project,`Resolved question: ${q.title}`);}
export function editDraft(project,id,details){
  const s=project.sections.find(s=>s.id===id);if(!s||s.status!=='draft'||s.archived)throw new Error('Only active drafts can be edited directly. Use a proposal for approved content.');
  const temporary=clone(project);const replacement=addSection(temporary,details);
  Object.assign(s,replacement,{id:s.id});event(project,`Edited draft: ${s.title}`);
}
export function archiveSection(project,id){
  const s=project.sections.find(s=>s.id===id);if(!s)throw new Error('Section not found.');
  if(project.changes.some(c=>c.sectionId===id&&c.status==='pending'))throw new Error('Resolve pending proposals before archiving this section.');
  s.archived=true;event(project,`Archived ${s.title}; historical versions retained`);
}
export function restoreSection(project,id){const s=project.sections.find(s=>s.id===id);if(!s)throw new Error('Section not found.');s.archived=false;event(project,`Restored ${s.title}`);}
export function archiveSource(project,id){
  const s=project.sources.find(s=>s.id===id);if(!s)throw new Error('Source not found.');
  if(project.sections.some(section=>!section.archived&&section.evidence.some(e=>e.sourceId===id))||project.changes.some(c=>c.status==='pending'&&c.evidence.some(e=>e.sourceId===id))||(project.behaviors??[]).some(b=>!b.archived&&b.evidence.some(e=>e.sourceId===id))||(project.behaviorChanges??[]).some(c=>c.status==='pending'&&c.proposed.evidence.some(e=>e.sourceId===id)))throw new Error('This source supports active content. Update or archive its linked sections and product rules, and resolve proposals first.');
  s.archived=true;event(project,`Archived source: ${s.title}`);
}
export function restoreSource(project,id){const s=project.sources.find(s=>s.id===id);if(!s)throw new Error('Source not found.');s.archived=false;event(project,`Restored source: ${s.title}`);}
export function proposalBlocker(project,proposal){
  const section=project.sections.find(s=>s.id===proposal.sectionId);
  if(!section||section.archived)return 'Section is unavailable.';
  if(JSON.stringify(section)!==JSON.stringify(proposal.base))return 'Section changed since this proposal. Recreate it from the current handbook.';
  if(isStale(project,{evidence:proposal.evidence}))return 'Supporting evidence changed. Recreate this proposal with current evidence.';
  return '';
}
function normalizeDocumentMetadata(content, metadata) {
  if (metadata === undefined) return undefined;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error('Invalid original document metadata.');
  const string=value=>typeof value==='string';
  const positive=value=>Number.isSafeInteger(value)&&value>0&&value<=100000;
  if (!string(metadata.fileName)||!metadata.fileName.trim()||metadata.fileName.length>512||!string(metadata.mediaType)||metadata.mediaType.length>150||!Number.isSafeInteger(metadata.byteLength)||metadata.byteLength<0||metadata.byteLength>100000000||!string(metadata.sha256)||!/^[a-f0-9]{64}$/i.test(metadata.sha256)||!['plain-text','pdfjs','mammoth'].includes(metadata.parser)||!string(metadata.parserVersion)||metadata.parserVersion.length>100||!Array.isArray(metadata.warnings)||metadata.warnings.length>100||metadata.warnings.some(value=>!string(value)||value.length>2000)||!Array.isArray(metadata.blocks)||metadata.blocks.length>10000||(metadata.pageCount!==undefined&&!positive(metadata.pageCount))||(metadata.reviewed!==undefined&&typeof metadata.reviewed!=='boolean')) throw new Error('Invalid original document metadata.');
  const ids=new Set();
  const blocks=metadata.blocks.map(block=>{
    const location=block?.location;
    if (!block||!string(block.id)||!block.id.trim()||block.id.length>150||ids.has(block.id)||!Number.isSafeInteger(block.start)||!Number.isSafeInteger(block.end)||block.start<0||block.start>=block.end||block.end>content.length||!location||!string(location.label)||!location.label.trim()||location.label.length>300||(location.page!==undefined&&!positive(location.page))||(location.paragraph!==undefined&&!positive(location.paragraph))) throw new Error('Invalid original document location.');
    ids.add(block.id);
    return {id:block.id,start:block.start,end:block.end,location:{label:location.label,...(location.page===undefined?{}:{page:location.page}),...(location.paragraph===undefined?{}:{paragraph:location.paragraph})}};
  });
  return {fileName:metadata.fileName,mediaType:metadata.mediaType,byteLength:metadata.byteLength,sha256:metadata.sha256,parser:metadata.parser,parserVersion:metadata.parserVersion,warnings:clone(metadata.warnings),blocks,...(metadata.pageCount===undefined?{}:{pageCount:metadata.pageCount}),...(metadata.reviewed===undefined?{}:{reviewed:metadata.reviewed})};
}
export function makeEvidence(project, sourceId, quote) {
  const source=project.sources.find(item=>item.id===sourceId),revision=source?.revisions.at(-1);
  if (!revision||source.archived||typeof quote!=='string'||!quote.trim()||!revision.content.includes(quote)) throw new Error('Evidence must be an exact passage from the selected active source.');
  const evidence={sourceId,revisionId:revision.id,quote};
  const start=revision.content.indexOf(quote);
  // Repeated wording cannot reliably identify one original page or paragraph.
  if (revision.document && revision.content.indexOf(quote,start+1)===-1) {
    const locations=revision.document.blocks.filter(block=>block.start<start+quote.length&&block.end>start).map(block=>({blockId:block.id,...clone(block.location)}));
    if(locations.length)evidence.locations=locations;
  }
  return evidence;
}
export function addSource(project, title, content, kind = 'Document', metadata) {
  if (typeof title!=='string'||typeof content!=='string'||!title.trim() || !content.trim()||typeof kind!=='string') throw new Error('A source needs a title and some text.');
  if (content.length > 200000) throw new Error('Split this source into files smaller than 200,000 characters.');
  const document=normalizeDocumentMetadata(content,metadata);
  const source = {id: uid(), title: title.trim(), kind, revisions: [{id: uid(), content, at: now(),...(document?{document}:{})}]};
  project.sources.push(source); event(project, `Added ${source.title}`); return source;
}
export function reviseSource(project, sourceId, content, metadata) {
  const source = project.sources.find(s => s.id === sourceId);
  if (!source || source.archived || typeof content!=='string'||!content.trim()) throw new Error('Choose an active source and supply its revised text.');
  if (content.length > 200000) throw new Error('Source text is too large.');
  const document=normalizeDocumentMetadata(content,metadata);
  if (source.revisions.at(-1).content === content&&JSON.stringify(source.revisions.at(-1).document)===JSON.stringify(document)) return false;
  source.revisions.push({id: uid(), content, at: now(),...(document?{document}:{})});
  event(project, `New source revision: ${source.title}`); return true;
}
function normalizeAIRun(project, input) {
  const identifier=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const small=value=>typeof value==='string'&&!!value.trim()&&value.length<=300;
  if(input?.proposalIds!==undefined&&(!Array.isArray(input.proposalIds)||input.proposalIds.length>1000||new Set(input.proposalIds).size!==input.proposalIds.length||input.proposalIds.some(id=>!project.behaviorChanges.some(c=>c.id===id))))throw new Error('Invalid AI rule proposal references.');
  if(input?.sectionDraftIds!==undefined&&(!Array.isArray(input.sectionDraftIds)||input.sectionDraftIds.length>1000||new Set(input.sectionDraftIds).size!==input.sectionDraftIds.length||input.sectionDraftIds.some(id=>!project.sections.some(s=>s.id===id))))throw new Error('Invalid AI section draft references.');
  if (!input||!identifier(input.id)||!['task','provider','model','promptVersion'].every(key=>small(input[key]))||!((Number.isSafeInteger(input.schemaVersion)&&input.schemaVersion>0)||(small(input.schemaVersion)&&input.schemaVersion.length<=100))||typeof input.inputHash!=='string'||!/^[a-f0-9]{64}$/i.test(input.inputHash)||typeof input.at!=='string'||!Number.isFinite(Date.parse(input.at))||!Array.isArray(input.sourceRefs)||!input.sourceRefs.length||input.sourceRefs.length>100||!Array.isArray(input.draftIds)||input.draftIds.length>1000||new Set(input.draftIds).size!==input.draftIds.length||input.draftIds.some(id=>!identifier(id)||!project.behaviors?.some(behavior=>behavior.id===id))) throw new Error('Invalid AI run metadata.');
  const used=new Set(),sourceRefs=input.sourceRefs.map(reference=>{
    const source=project.sources.find(source=>source.id===reference?.sourceId),revision=source?.revisions.find(revision=>revision.id===reference.revisionId),key=reference?.sourceId+':'+reference?.revisionId;
    if(!revision||used.has(key))throw new Error('Invalid AI source revision reference.');used.add(key);return {sourceId:source.id,revisionId:revision.id};
  });
  return {id:input.id,task:input.task,provider:input.provider,model:input.model,promptVersion:input.promptVersion,schemaVersion:input.schemaVersion,inputHash:input.inputHash,at:input.at,sourceRefs,draftIds:clone(input.draftIds),sectionDraftIds:clone(input.sectionDraftIds??[]),proposalIds:clone(input.proposalIds??[])};
}
export function recordAIRun(project,input) {
  const record=normalizeAIRun(project,{id:uid(),draftIds:[],...input});
  if((project.aiRuns??[]).some(run=>run.id===record.id))throw new Error('AI run already recorded.');
  project.aiRuns??=[];if(project.aiRuns.length>=2000)throw new Error('AI run history exceeds supported limits.');
  project.aiRuns.push(record);return record;
}
export function linkRunDraft(project,runId,behaviorId) {
  const run=project.aiRuns?.find(run=>run.id===runId),behavior=project.behaviors?.find(behavior=>behavior.id===behaviorId);
  if(!run||!behavior||behavior.status!=='draft')throw new Error('Choose a recorded AI run and an active rule draft.');
  if(behavior.originRunId&&behavior.originRunId!==runId)throw new Error('This draft already belongs to another AI run.');
  if(!run.draftIds.includes(behaviorId))run.draftIds.push(behaviorId);behavior.originRunId=runId;
}
export function linkRunProposal(project,runId,proposalId){const run=project.aiRuns?.find(r=>r.id===runId),proposal=project.behaviorChanges.find(c=>c.id===proposalId);if(!run||!proposal||proposal.status!=='pending')throw new Error('Choose an AI run and a pending rule proposal.');run.proposalIds??=[];if(!run.proposalIds.includes(proposalId))run.proposalIds.push(proposalId);}
export function linkRunSection(project,runId,sectionId){const run=project.aiRuns?.find(r=>r.id===runId),section=project.sections.find(s=>s.id===sectionId);if(!run||!section||section.status!=='draft'||section.archived)throw new Error('Choose an AI run and an active handbook draft.');run.sectionDraftIds??=[];if(!run.sectionDraftIds.includes(sectionId))run.sectionDraftIds.push(sectionId);}
export function addSection(project, {title, body, role = 'Everyone', sourceId, quote}) {
  if (!title.trim() || !body.trim()) throw new Error('A handbook section needs a title and content.');
  if (!ROLES.includes(role)) throw new Error('Unknown audience.');
  const evidence = [];
  if (sourceId) {
    evidence.push(makeEvidence(project,sourceId,quote));
  }
  const section = {id: uid(), title: title.trim(), body: body.trim(), role, evidence, status: 'draft', ownerNote: '', updatedAt: now()};
  project.sections.push(section); event(project, `Drafted ${section.title}`); return section;
}
export function isStale(project, section) {
  return section.evidence.some(e => { const source=project.sources.find(s => s.id === e.sourceId); return !source||source.archived||source.revisions.at(-1)?.id !== e.revisionId; });
}
export function approveSection(project, sectionId, ownerNote = '') {
  const section = project.sections.find(s => s.id === sectionId);
  if (!section || section.archived) throw new Error('Section not found.');
  if (isStale(project, section)) throw new Error('The supporting source changed. Propose an updated section before approving.');
  if (!section.evidence.length && !ownerNote.trim()) throw new Error('Add evidence or record an explicit owner decision.');
  section.status = 'approved'; section.ownerNote = ownerNote.trim(); section.updatedAt = now();
  event(project, `Approved ${section.title}`);
}
export function proposeChange(project, sectionId, body, reason, sourceId = '', quote = '', details = {}) {
  const section = project.sections.find(s => s.id === sectionId);
  if (!section || section.archived || !body.trim() || !reason.trim()) throw new Error('A proposal needs an active section, revised text, and a reason.');
  let evidence = clone(section.evidence);
  if (sourceId === '__none') evidence=[];
  else if (sourceId) {
    evidence = [makeEvidence(project,sourceId,quote)];
  }
  const title=details.title?.trim()??section.title,role=details.role??section.role;
  if(!title||!ROLES.includes(role))throw new Error('A proposal needs a title and valid audience.');
  if(body.trim()===section.body && title===section.title && role===section.role && JSON.stringify(evidence)===JSON.stringify(section.evidence)) throw new Error('Change the wording, audience, title, or evidence before proposing an update.');
  const proposal = {id: uid(), sectionId, base: clone(section), title,role, body: body.trim(), reason: reason.trim(), evidence, status: 'pending', at: now()};
  project.changes.push(proposal); event(project, `Proposed an update to ${section.title}`); return proposal;
}
export function acceptChange(project, proposalId, ownerNote = '') {
  const proposal = project.changes.find(c => c.id === proposalId);
  const section = project.sections.find(s => s.id === proposal?.sectionId);
  if (!proposal || proposal.status !== 'pending' || !section || section.archived) throw new Error('This proposal is no longer available.');
  if (JSON.stringify(section) !== JSON.stringify(proposal.base)) throw new Error('This section changed after the proposal. Create a fresh proposal.');
  if (isStale(project, {evidence: proposal.evidence})) throw new Error('Proposal evidence is outdated. Create a fresh proposal with current evidence.');
  if (!proposal.evidence.length && !ownerNote.trim()) throw new Error('Record an owner decision for an update without source evidence.');
  section.title=proposal.title??section.title;section.role=proposal.role??section.role;
  section.body = proposal.body; section.evidence = clone(proposal.evidence); section.ownerNote = ownerNote.trim(); section.status = 'approved'; section.updatedAt = now();
  proposal.status = 'accepted'; event(project, `Accepted an update to ${section.title}`);
}
export function rejectChange(project, proposalId) {
  const p = project.changes.find(c => c.id === proposalId);
  if (!p || p.status !== 'pending') throw new Error('Proposal is no longer pending.');
  p.status = 'rejected'; event(project, 'Rejected a proposed update');
}
export function saveVersion(project, label, {includeActions=false} = {}) {
  const sections = project.sections.filter(s => s.status === 'approved' && !s.archived);
  const behaviors=(project.behaviors??[]).filter(b=>b.status==='approved'&&!b.archived);
  if (!sections.length&&!behaviors.length) throw new Error('Approve at least one section or product rule before saving a version.');
  if ([...sections,...behaviors].some(s => isStale(project, s))) throw new Error('Some approved sections have changed evidence. Review those sections first.');
  const version = {id: uid(), number: project.versions.length + 1, label: label.trim() || 'Approved handbook', at: now(), sections: clone(sections), questions:clone(project.questions??[]),behaviors:clone(behaviors)};
  if(includeActions)version.actions=clone((project.actions??[]).filter(action=>behaviors.some(behavior=>behavior.id===action.behaviorId&&['actor','condition','outcome','applicability'].every(key=>behavior[key]===action.behaviorSnapshot[key]))));
  project.versions.push(version); event(project, `Saved handbook v${version.number}`); return version;
}
export function searchEvidence(project, query, versionId = '', audience='Everyone') {
  const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(w => w.length > 2) ?? [];
  if (!words.length) return [];
  const sections = versionId ? project.versions.find(v => v.id === versionId)?.sections ?? [] : project.sections.filter(s => s.status === 'approved' && !s.archived);
  return sections.filter(s=>audience==='Everyone'||s.role==='Everyone'||s.role===audience).map(section => ({section, score: words.reduce((score, w) => score + (section.title + ' ' + section.body).toLowerCase().split(w).length - 1, 0)})).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0,8);
}
export function exportProject(project) { return JSON.stringify({format: 'product-relay', schemaVersion: 4, exportedAt: now(), project}, null, 2); }
export function importProject(text) {
  if (text.length > 10000000) throw new Error('Project bundle exceeds the 10 MB import limit.');
  const bundle = JSON.parse(text);
  if (bundle.format !== 'product-relay' || ![1,2,3,4].includes(bundle.schemaVersion)) throw new Error('Unsupported project bundle.');
  const p = bundle.project;
  if(bundle.schemaVersion<4&&(p?.sharing||p?.reconciliations?.length||p?.mergeArchives?.length))throw new Error('Schema 4 is required for sharing rounds and walkthrough reviews.');
  if(bundle.schemaVersion===1&&p&&['behaviors','behaviorChanges','decisions','aiRuns'].some(key=>p[key]?.length))throw new Error('Schema 1 cannot contain newer product rule records. Export this project with schema 2.');
  if(bundle.schemaVersion<3&&(p&&['impactReviews','actions','actionChanges','actionDecisions','acknowledgments','verifications'].some(key=>p[key]?.length)||p?.versions?.some(version=>version.actions?.length)))throw new Error('Schema 1 or 2 cannot contain newer team work records. Export this project with schema 3.');
  const string = v => typeof v === 'string';
  const identifier=v=>string(v)&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  const timestamp=v=>string(v)&&Number.isFinite(Date.parse(v));
  const archived=v=>v===undefined||typeof v==='boolean';
  const unique=(list,label)=>{const ids=new Set();for(const item of list){if(!identifier(item?.id)||ids.has(item.id))throw new Error(`Invalid or duplicate ${label} ID.`);ids.add(item.id);}};
  if (!p || !string(p.id) || !string(p.name) || !string(p.description) || !string(p.createdAt) || !['sources','sections','changes','versions','events'].every(k => Array.isArray(p[k]))) throw new Error('Invalid project structure.');
  if(!identifier(p.id)||!p.name.trim()||!timestamp(p.createdAt))throw new Error('Invalid project identity.');
  if (p.sources.length > 500 || p.sections.length > 1000 || p.changes.length > 2000 || p.versions.length > 1000 || p.events.length>10000) throw new Error('Project exceeds supported limits.');
  for(const key of ['sources','sections','changes','versions','events'])unique(p[key],key);
  const sources = new Map(); const revisions = new Map();
  for (const s of p.sources) {
    if (!string(s.title) || !s.title.trim() || !string(s.kind) || !archived(s.archived) || !Array.isArray(s.revisions) || !s.revisions.length || s.revisions.length>1000) throw new Error('Invalid source record.');
    sources.set(s.id, s);
    for (const r of s.revisions) {
      if (!identifier(r.id) || revisions.has(r.id) || !string(r.content) || !r.content.trim() || r.content.length > 200000 || !timestamp(r.at)) throw new Error('Invalid source revision.');
      const document=normalizeDocumentMetadata(r.content,r.document);
      revisions.set(r.id, {sourceId:s.id, content:r.content,document});
    }
  }
  function validateEvidence(items) {
    if(!Array.isArray(items)||items.length>100)throw new Error('Invalid evidence list.');
    for (const e of items) {
      const revision = revisions.get(e?.revisionId);
      if (!revision || revision.sourceId !== e.sourceId || !string(e.quote) || !e.quote.trim() || !revision.content.includes(e.quote)) throw new Error('Invalid evidence reference.');
      if(e.locations!==undefined){
        if(!Array.isArray(e.locations)||e.locations.length>100||!revision.document)throw new Error('Invalid evidence location.');
        const start=revision.content.indexOf(e.quote);
        if(revision.content.indexOf(e.quote,start+1)!==-1)throw new Error('Ambiguous evidence cannot claim an original document location.');
        const used=new Set();
        for(const location of e.locations){
          const block=revision.document.blocks.find(block=>block.id===location?.blockId);
          if(!block||used.has(block.id)||!(block.start<start+e.quote.length&&block.end>start)||location.label!==block.location.label||location.page!==block.location.page||location.paragraph!==block.location.paragraph)throw new Error('Invalid evidence location.');
          used.add(block.id);
        }
      }
    }
  }
  function validateSection(s) {
    if (!s || !identifier(s.id) || !string(s.title) || !s.title.trim() || !string(s.body) || !s.body.trim() || !ROLES.includes(s.role) || !['draft','approved'].includes(s.status) || !string(s.ownerNote) || !timestamp(s.updatedAt) || !archived(s.archived)) throw new Error('Invalid section record.');
    validateEvidence(s.evidence);
    if (s.status === 'approved' && !s.evidence.length && !s.ownerNote.trim()) throw new Error('Approved content needs evidence or an owner decision.');
  }
  const sectionIds = new Set();
  for (const s of p.sections) { validateSection(s); if (sectionIds.has(s.id)) throw new Error('Duplicate section ID.'); sectionIds.add(s.id); }
  for (const c of p.changes) {
    if (!sectionIds.has(c.sectionId) || c.base?.id!==c.sectionId || !string(c.body) || !c.body.trim() || !string(c.reason) || !c.reason.trim() || !['pending','accepted','rejected'].includes(c.status) || !timestamp(c.at)) throw new Error('Invalid change record.');
    validateSection(c.base); validateSection({...c.base, status:'draft', evidence:c.evidence});
    if((c.title!==undefined&&(!string(c.title)||!c.title.trim()))||(c.role!==undefined&&!ROLES.includes(c.role)))throw new Error('Invalid proposed title or audience.');
  }
  for (const v of p.versions) {
    if (!Number.isInteger(v.number) || v.number!==p.versions.indexOf(v)+1 || !string(v.label) || !timestamp(v.at) || !Array.isArray(v.sections) || (!v.sections.length&&!(v.behaviors?.length)) || v.sections.length>1000) throw new Error('Invalid handbook version.');
    unique(v.sections,'snapshot section');
    if(v.sections.some(s=>s.status!=='approved'||s.archived||!sectionIds.has(s.id)))throw new Error('A baseline must contain approved sections from this project.');
    v.sections.forEach(validateSection);
  }
  const aiRuns=p.aiRuns??[];
  if(!Array.isArray(aiRuns)||aiRuns.length>2000)throw new Error('Invalid AI run history.');
  unique(aiRuns,'AI run');
  const cleanAIRuns=aiRuns.map(run=>normalizeAIRun(p,run));
  const aiRunIds=new Set(aiRuns.map(run=>run.id));
  validateBehaviorCollections(p,{identifier,timestamp,archived,unique,validateEvidence,aiRunIds});
  for (const e of p.events) if (!string(e.text) || !timestamp(e.at)) throw new Error('Invalid history event.');
  const members=p.members??[];const questions=p.questions??[];
  if(!Array.isArray(members)||members.length>200||!Array.isArray(questions)||questions.length>1000)throw new Error('Invalid team or question list.');
  unique(members,'member');unique(questions,'question');
  for(const m of members)if(!string(m.name)||!m.name.trim()||!ROLES.includes(m.role))throw new Error('Invalid team member.');
  validateActionCollections(p,{identifier,timestamp,unique,validateEvidence});
  function validateQuestions(items){
    if(!Array.isArray(items)||items.length>1000)throw new Error('Invalid questions.');unique(items,'question');
    for(const q of items)if(!string(q.title)||!q.title.trim()||!ROLES.includes(q.role)||!string(q.owner)||!['open','resolved'].includes(q.status)||!string(q.resolution)||!timestamp(q.at)||(q.status==='resolved'&&!q.resolution.trim()))throw new Error('Invalid walkthrough question.');
  }
  validateQuestions(questions);p.versions.forEach(v=>validateQuestions(v.questions??[]));
  const reconciliations=validateReconciliations({...p,questions},{identifier,timestamp,unique,validateEvidence});
  if(p.reviewOf!==undefined&&!identifier(p.reviewOf))throw new Error('Invalid review-copy origin.');
  let sharing;
  if(p.sharing!==undefined){
    const a=p.sharing;if(!a||!identifier(a.id)||!timestamp(a.at)||typeof a.hash!=='string'||!/^[a-f0-9]{64}$/.test(a.hash)||!a.base||a.base.sharing!==undefined||a.base.id!==p.id||a.base.createdAt!==p.createdAt)throw new Error('Invalid shared-file ancestry.');
    const base=importProject(JSON.stringify({format:'product-relay',schemaVersion:4,project:a.base}));sharing={id:a.id,at:a.at,hash:a.hash,base};
  }
  const mergeArchives=p.mergeArchives??[];
  if(!Array.isArray(mergeArchives)||mergeArchives.length>10)throw new Error('Invalid merge archives.');unique(mergeArchives,'merge archive');
  const cleanMergeArchives=mergeArchives.map(a=>{
    if(!identifier(a.anchorId)||!timestamp(a.at)||!members.some(m=>m.id===a.reviewerId)||typeof a.note!=='string'||!a.note.trim()||a.note.length>20000||!a.current||!a.incoming||[a.current,a.incoming].some(parent=>(parent.id!==p.id&&parent.id!==p.reviewOf)||parent.createdAt!==p.createdAt||parent.sharing!==undefined||parent.mergeArchives!==undefined))throw new Error('Invalid preserved merge parents.');
    const clean=parent=>{const result=importProject(JSON.stringify({format:'product-relay',schemaVersion:4,project:parent}));delete result.mergeArchives;delete result.sharing;return result;};return {id:a.id,anchorId:a.anchorId,at:a.at,reviewerId:a.reviewerId,note:a.note,current:clean(a.current),incoming:clean(a.incoming)};
  });
  const pick=(object,keys)=>Object.fromEntries(keys.filter(k=>object[k]!==undefined).map(k=>[k,object[k]]));
  const cleanEvidence=list=>list.map(e=>({...pick(e,['sourceId','revisionId','quote']),...(e.locations?{locations:e.locations.map(location=>pick(location,['blockId','label','page','paragraph']))}:{})}));
  const behaviorCollections=cleanBehaviorCollections(p,cleanEvidence,pick);
  const actionCollections=cleanActionCollections(p,behaviorCollections.cleanBehavior,pick);
  const cleanSection=s=>({...pick(s,['id','title','body','role','status','ownerNote','updatedAt','archived']),evidence:cleanEvidence(s.evidence)});
  const cleanQuestion=q=>pick(q,['id','title','role','owner','status','resolution','at']);
  return clone({id:p.id,name:p.name,description:p.description,createdAt:p.createdAt,...(p.reviewOf?{reviewOf:p.reviewOf}:{}),reconciliations,mergeArchives:cleanMergeArchives,...(sharing?{sharing}:{}),
    sources:p.sources.map(s=>({...pick(s,['id','title','kind','archived']),revisions:s.revisions.map(r=>({...pick(r,['id','content','at']),...(r.document?{document:normalizeDocumentMetadata(r.content,r.document)}:{})}))})),
    sections:p.sections.map(cleanSection),changes:p.changes.map(c=>({...pick(c,['id','sectionId','title','role','body','reason','status','at']),base:cleanSection(c.base),evidence:cleanEvidence(c.evidence)})),
    versions:p.versions.map(v=>({...pick(v,['id','number','label','at']),sections:v.sections.map(cleanSection),...(v.questions?{questions:v.questions.map(cleanQuestion)}:{}),behaviors:(v.behaviors??[]).map(behaviorCollections.cleanBehavior),...(v.actions?{actions:v.actions.map(actionCollections.cleanAction)}:{})})),
    events:p.events.map(e=>pick(e,['id','text','at'])),members:members.map(m=>pick(m,['id','name','role'])),questions:questions.map(cleanQuestion),behaviors:behaviorCollections.behaviors,behaviorChanges:behaviorCollections.behaviorChanges,decisions:behaviorCollections.decisions,aiRuns:cleanAIRuns,...Object.fromEntries(Object.entries(actionCollections).filter(([key])=>key!=='cleanAction'))});
}
export function toMarkdown(project, versionId = '') {
  const version = project.versions.find(v => v.id === versionId);
  const sections = version ? version.sections : project.sections.filter(s => s.status === 'approved' && !s.archived);
  const handbook=`# ${project.name}\n\n${project.description}\n\n${version ? `Version ${version.number}: ${version.label}` : 'Current approved sections'}\n\n` + sections.map(s => `## ${s.title}\n\nAudience: ${s.role}\n\n${s.body}\n\n` + s.evidence.map(e => {
    const source = project.sources.find(x => x.id === e.sourceId); const revision = source?.revisions.find(r => r.id === e.revisionId);
    return `Source: ${source?.title} (${revision?.at})\n\n> ${e.quote.replaceAll('\n','\n> ')}\n`;
  }).join('\n') + (s.ownerNote ? `\nOwner decision: ${s.ownerNote}\n` : '') + (!version && isStale(project,s) ? '\nWARNING: Supporting source has changed; section needs review.\n' : '')).join('\n');
  const behaviors=version?version.behaviors??[]:(project.behaviors??[]).filter(b=>b.status==='approved'&&!b.archived);
  return handbook+(behaviors.length?'\n\n# Agreed product rules\n\n'+behaviors.map(b=>`## ${b.title}\n\nActor: ${b.actor}\n\nWhen: ${b.condition}\n\nOutcome: ${b.outcome}\n\nApplies to: ${b.applicability}\n\nOwner: ${b.owner} · Perspectives: ${b.audiences.join(', ')} · Rule revision: ${b.revision}\n\n`+b.evidence.map(e=>{const source=project.sources.find(s=>s.id===e.sourceId);return `Source: ${source?.title} (revision ${e.revisionId})\n\n> ${e.quote.replaceAll('\n','\n> ')}\n`;}).join('\n')+(b.ownerNote?`\nOwner decision: ${b.ownerNote}\n`:'')+(!version&&isStale(project,b)?'\nWARNING: Supporting source has changed; rule needs review.\n':'')).join('\n'):'');
}
export function demoProject() {
  const p = createProject('Orbit subscriptions', 'A fictional subscription product. Learn the product, capture a walkthrough, and follow a decision through a change.');
  const brief = addSource(p, 'Product brief · approved baseline', 'Orbit helps small teams manage recurring subscriptions.\nWorkspace owners manage billing. Members can use the product but cannot change billing settings.\nCancellation keeps access active until the current billing period ends.\nDiscounts apply to the next invoice only.');
  const ops = addSource(p, 'Delivery notes', 'Cancellation is controlled by the cancel_v2 feature flag.\nQA has checked cancellation for new subscriptions. Migrated subscriptions have not been tested.\nThe migration owner and rollback instructions are not yet documented.');
  const walk = addSource(p, 'Walkthrough · questions and answers', 'Product owner clarification: cancelled accounts cannot renew unless the owner explicitly resumes the subscription.\nSupport asks whether partial refunds affect access. Product has not decided this yet.', 'Walkthrough');
  const policy=addSource(p,'PRD · qualified cancellation policy','For ordinary cancellations, workspace owners keep access until the current paid billing period ends.\nFraud-triggered cancellations revoke access immediately, but the target release is not yet confirmed.');
  const ordinary=addBehavior(p,{title:'Ordinary cancellation',actor:'Workspace owner',condition:'The subscription is cancelled for an ordinary reason, not fraud',outcome:'Access continues until the current paid billing period ends',applicability:'Release 1 onward · ordinary cancellations only',owner:'Maya',audiences:['Everyone'],sourceId:policy.id,quote:'For ordinary cancellations, workspace owners keep access until the current paid billing period ends.'});
  approveBehavior(p,ordinary.id);
  addBehavior(p,{title:'Fraud cancellation exception',actor:'Fraud operations',condition:'Cancellation is triggered by confirmed fraud',outcome:'Revoke access immediately',applicability:'Proposed fraud exception · target release not confirmed',owner:'Maya',audiences:['Product','QA','Development','Operations','Support'],sourceId:policy.id,quote:'Fraud-triggered cancellations revoke access immediately, but the target release is not yet confirmed.'});
  addQuestion(p,'Which release introduces immediate access revocation for fraud?','Product','Maya');
  addMember(p,'Maya','Product');addMember(p,'Alex','QA');addMember(p,'Sam','Development');addMember(p,'Jordan','Support');
  addQuestion(p,'Do partial refunds affect remaining access?','Support','Maya');
  addQuestion(p,'Who owns migration and rollback instructions?','Operations','Sam');
  const sections = [
    {title:'Start here: the product', body:'Orbit manages recurring subscriptions for small teams. Start with workspace ownership, then understand billing and cancellation.', role:'Everyone', sourceId:brief.id, quote:'Orbit helps small teams manage recurring subscriptions.'},
    {title:'Who can change billing?', body:'Workspace owners manage billing. Members cannot change billing settings.', role:'Everyone', sourceId:brief.id, quote:'Workspace owners manage billing. Members can use the product but cannot change billing settings.'},
    {title:'Cancellation and access', body:'Cancelling prevents future renewal. Access continues until the current billing period ends.', role:'Everyone', sourceId:brief.id, quote:'Cancellation keeps access active until the current billing period ends.'},
    {title:'Testing boundaries', body:'Cancellation has been checked for new subscriptions. The migrated-subscription path still needs testing; do not describe it as covered.', role:'QA', sourceId:ops.id, quote:'QA has checked cancellation for new subscriptions. Migrated subscriptions have not been tested.'},
    {title:'Release prerequisites', body:'Use cancel_v2 to control the rollout. Establish a migration owner and rollback instructions before preparing the operations handoff.', role:'Operations', sourceId:ops.id, quote:'The migration owner and rollback instructions are not yet documented.'}
  ];
  for (const draft of sections) { const s=addSection(p,draft); approveSection(p,s.id); }
  saveVersion(p,'Before the first walkthrough');
  const cancellation = p.sections.find(s=>s.title==='Cancellation and access');
  proposeChange(p,cancellation.id,'Cancelling prevents automatic renewal. Access continues until the billing period ends. An owner must explicitly resume the subscription to renew it.','Clarification supplied during the walkthrough.',walk.id,'Product owner clarification: cancelled accounts cannot renew unless the owner explicitly resumes the subscription.');
  return p;
}
