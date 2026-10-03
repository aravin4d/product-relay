import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/domain.js';
function fixture(){const p=D.createProject('Billing');const s=D.addSource(p,'Policy','Access continues until renewal.');const section=D.addSection(p,{title:'Cancellation',body:'Access continues until renewal.',sourceId:s.id,quote:'Access continues until renewal.'});D.approveSection(p,section.id);return {p,s,section};}
test('a proposal cannot change approved content before acceptance',()=>{
 const {p,section}=fixture();D.proposeChange(p,section.id,'Access ends immediately.','Proposed new behavior.');assert.equal(section.body,'Access continues until renewal.');assert.equal(p.changes[0].status,'pending');
});
test('acceptance preserves immutable historical baselines',()=>{
 const {p,s,section}=fixture();const v=D.saveVersion(p,'Initial');D.reviseSource(p,s.id,'Access ends immediately.');const c=D.proposeChange(p,section.id,'Access ends immediately.','Approved policy update',s.id,'Access ends immediately.');D.acceptChange(p,c.id);assert.equal(section.body,'Access ends immediately.');assert.equal(v.sections[0].body,'Access continues until renewal.');assert.notEqual(v.sections[0].evidence[0].revisionId,section.evidence[0].revisionId);
});
test('source revision marks linked section stale without changing approved wording',()=>{
 const {p,s,section}=fixture();D.reviseSource(p,s.id,'Access ends immediately.');assert.equal(D.isStale(p,section),true);assert.equal(section.body,'Access continues until renewal.');assert.throws(()=>D.saveVersion(p,'New'),/changed evidence/);
});
test('source revision during review blocks acceptance',()=>{
 const {p,s,section}=fixture();const c=D.proposeChange(p,section.id,'Clarified access.','Clarification');D.reviseSource(p,s.id,'A different rule.');assert.throws(()=>D.acceptChange(p,c.id),/outdated/);assert.equal(c.status,'pending');
});
test('concurrent proposals cannot overwrite each other silently',()=>{
 const {p,section}=fixture();const a=D.proposeChange(p,section.id,'Wording A','A');const b=D.proposeChange(p,section.id,'Wording B','B');D.acceptChange(p,a.id);assert.throws(()=>D.acceptChange(p,b.id),/changed after/);assert.equal(section.body,'Wording A');
});
test('source-free approval requires an explicit owner decision',()=>{
 const p=D.createProject('Product');const s=D.addSection(p,{title:'Rule',body:'Owner-defined rule'});assert.throws(()=>D.approveSection(p,s.id),/owner decision/);D.approveSection(p,s.id,'Product owner confirmed in walkthrough.');assert.equal(s.status,'approved');
});
test('citations must be exact source passages',()=>{
 const {p,s}=fixture();assert.throws(()=>D.addSection(p,{title:'False',body:'Invented',sourceId:s.id,quote:'Invented quote'}),/exact passage/);
});
test('a project round trip preserves sources, proposals, and versions',()=>{
 const p=D.demoProject();assert.deepEqual(D.importProject(D.exportProject(p)),p);
});
test('malformed imports and missing source references are rejected',()=>{
 assert.throws(()=>D.importProject('{"format":"product-relay","schemaVersion":1,"project":{}}'),/Invalid project/);
 const {p}=fixture();const b=JSON.parse(D.exportProject(p));b.project.sections[0].evidence[0].sourceId='missing';assert.throws(()=>D.importProject(JSON.stringify(b)),/evidence/);
});
test('future schemas do not silently migrate',()=>{
 const b=JSON.parse(D.exportProject(D.demoProject()));b.schemaVersion=3;assert.throws(()=>D.importProject(JSON.stringify(b)),/Unsupported/);
});
test('historical search uses the selected approved snapshot, excluding proposals',()=>{
 const {p,s,section}=fixture();const v=D.saveVersion(p,'Initial');D.reviseSource(p,s.id,'Access ends immediately.');const c=D.proposeChange(p,section.id,'Access ends immediately.','Change',s.id,'Access ends immediately.');assert.equal(D.searchEvidence(p,'immediately').length,0);D.acceptChange(p,c.id);assert.equal(D.searchEvidence(p,'immediately').length,1);assert.equal(D.searchEvidence(p,'immediately',v.id).length,0);assert.equal(D.searchEvidence(p,'renewal',v.id).length,1);
});
test('rejection leaves current behavior unchanged and cannot later be accepted',()=>{
 const {p,section}=fixture();const c=D.proposeChange(p,section.id,'Different','Reason');D.rejectChange(p,c.id);assert.throws(()=>D.acceptChange(p,c.id),/no longer/);assert.equal(section.body,'Access continues until renewal.');
});
test('Markdown export discloses changed evidence',()=>{
 const {p,s}=fixture();D.reviseSource(p,s.id,'Changed');assert.match(D.toMarkdown(p),/WARNING/);
});
test('drafts can be edited while approved sections require proposals',()=>{
 const p=D.createProject('Product');const s=D.addSection(p,{title:'Draft',body:'Earlier wording'});
 D.editDraft(p,s.id,{title:'Revised draft',body:'New wording',role:'QA'});assert.equal(s.role,'QA');assert.equal(p.sections.length,1);
 D.approveSection(p,s.id,'Owner reviewed');assert.throws(()=>D.editDraft(p,s.id,{title:'Overwrite',body:'Oops'}),/Only active drafts/);
});
test('source evidence can be explicitly replaced by an owner decision',()=>{
 const {p,section}=fixture();const c=D.proposeChange(p,section.id,'Owner-defined rule','New decision','__none');
 assert.equal(c.evidence.length,0);assert.throws(()=>D.acceptChange(p,c.id),/owner decision/);D.acceptChange(p,c.id,'PM confirmed');assert.equal(section.ownerNote,'PM confirmed');
});
test('title and audience changes go through review and preserve baselines',()=>{
 const {p,section}=fixture();const version=D.saveVersion(p,'Original');
 const c=D.proposeChange(p,section.id,section.body,'Move to QA','','',{title:'QA cancellation coverage',role:'QA'});D.acceptChange(p,c.id);
 assert.equal(section.role,'QA');assert.equal(version.sections[0].role,'Everyone');assert.equal(version.sections[0].title,'Cancellation');
});
test('unchanged proposals are rejected',()=>{
 const {p,section}=fixture();assert.throws(()=>D.proposeChange(p,section.id,section.body,'Nothing changed'),/Change the wording/);
});
test('archiving a section preserves historical evidence and is reversible',()=>{
 const {p,section}=fixture();const v=D.saveVersion(p,'Original');D.archiveSection(p,section.id);
 assert.equal(D.searchEvidence(p,'renewal').length,0);assert.equal(D.searchEvidence(p,'renewal',v.id).length,1);
 D.restoreSection(p,section.id);assert.equal(D.searchEvidence(p,'renewal').length,1);
});
test('a linked source and a section with pending proposals cannot be archived',()=>{
 const {p,s,section}=fixture();assert.throws(()=>D.archiveSource(p,s.id),/supports active/);D.proposeChange(p,section.id,'A new rule','Reason');
 assert.throws(()=>D.archiveSection(p,section.id),/Resolve pending/);
});
test('a source can be archived once active references are archived',()=>{
 const {p,s,section}=fixture();D.saveVersion(p,'Original');D.archiveSection(p,section.id);D.archiveSource(p,s.id);
 assert.equal(p.versions[0].sections[0].evidence[0].sourceId,s.id);assert.throws(()=>D.reviseSource(p,s.id,'New'),/active source/);D.restoreSource(p,s.id);assert.equal(s.archived,false);
});
test('questions and decisions are preserved with each baseline',()=>{
 const {p}=fixture();const q=D.addQuestion(p,'How do refunds work?','Support','PM');const v=D.saveVersion(p,'Before decision');
 assert.throws(()=>D.resolveQuestion(p,q.id,''),/Record an answer/);D.resolveQuestion(p,q.id,'Refunds do not change access.');assert.equal(v.questions[0].status,'open');assert.equal(p.questions[0].status,'resolved');
 assert.deepEqual(D.importProject(D.exportProject(p)),p);
});
test('member names cannot be duplicated with different casing',()=>{
 const p=D.createProject('Product');D.addMember(p,'Alex','QA');assert.throws(()=>D.addMember(p,'alex','Development'),/already exists/);
});
test('search applies the perspective before taking the result limit',()=>{
 const p=D.createProject('Product');for(let i=0;i<12;i++){const s=D.addSection(p,{title:'Cancellation '+i,body:'Cancellation rule',role:i===11?'QA':'Development'});D.approveSection(p,s.id,'Reviewed');}
 assert.equal(D.searchEvidence(p,'cancellation','','QA').length,1);
});
test('import rejects duplicate proposal IDs and mismatched base identity',()=>{
 const p=D.demoProject();p.changes.push(D.clone(p.changes[0]));assert.throws(()=>D.importProject(D.exportProject(p)),/duplicate changes/);
 p.changes.pop();p.changes[0].base.id=D.uid();assert.throws(()=>D.importProject(D.exportProject(p)),/change record/);
});
test('import rejects non-approved snapshots and invalid version numbering',()=>{
 const p=D.demoProject();p.versions[0].sections[0].status='draft';assert.throws(()=>D.importProject(D.exportProject(p)),/baseline/);
 p.versions[0].sections[0].status='approved';p.versions[0].number=7;assert.throws(()=>D.importProject(D.exportProject(p)),/version/);
});
test('import drops unexpected nested configuration',()=>{
 const p=D.demoProject();p.remoteEndpoint='https://invalid.example';p.sources[0].credentials='unexpected';p.sections[0].script='unexpected';const restored=D.importProject(D.exportProject(p));
 assert.equal(restored.remoteEndpoint,undefined);assert.equal(restored.sources[0].credentials,undefined);assert.equal(restored.sections[0].script,undefined);
});
