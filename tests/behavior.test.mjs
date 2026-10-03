import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/domain.js';
import {createHandoffFixture,recordWalkthrough,proposeRelease2Change} from '../examples/fixtures/orbit-handoff.mjs';
function ruleFixture() {const fixture=createHandoffFixture();return {...fixture,p:fixture.project,ordinary:fixture.project.behaviors[0],fraud:fixture.project.behaviors[1]};}
function documentMetadata(content) {return {fileName:'policy.pdf',mediaType:'application/pdf',byteLength:99,sha256:'a'.repeat(64),parser:'pdfjs',parserVersion:'test',pageCount:1,warnings:[],blocks:[{id:'page-1-block-1',start:0,end:content.length,location:{label:'Page 1',page:1}}]};}
test('ordinary and fraud-only rules remain separate across all perspectives',()=>{
 const f=ruleFixture();recordWalkthrough(f);
 for(const audience of D.ROLES){const rules=D.listBehaviors(f.p,{audience,includeDrafts:false});assert.equal(rules.length,2);assert.equal(rules[0].outcome,f.expected.ordinaryOutcome);assert.match(rules[1].condition,/fraud/);assert.match(rules[1].applicability,/Release 2/);}
 assert.equal(D.listBehaviors(f.p,{versionId:f.refs.baseline}).length,1);
});
test('a draft requires an owner and source evidence or an explicit owner decision',()=>{
 const p=D.createProject('Product'),b=D.addBehavior(p,{title:'Rule',actor:'Owner',condition:'When enabled',outcome:'Allow access',applicability:'Release 1 only',owner:''});
 assert.throws(()=>D.approveBehavior(p,b.id),/owner/);D.editBehavior(p,b.id,{owner:'Maya'});assert.throws(()=>D.approveBehavior(p,b.id),/evidence/);
 D.approveBehavior(p,b.id,'Maya confirmed the rule.');assert.equal(b.status,'approved');assert.equal(p.decisions[0].before.status,'draft');assert.equal(p.decisions[0].after.status,'approved');
 assert.throws(()=>D.approveBehavior(p,b.id),/draft/);assert.equal(p.decisions.length,1);
});
test('approved rules cannot be edited directly and invalid proposals do not mutate the project',()=>{
 const {p,ordinary}=ruleFixture(),before=D.clone(p);
 assert.throws(()=>D.editBehavior(p,ordinary.id,{outcome:'Immediate removal'}),/proposal/);
 assert.throws(()=>D.proposeBehaviorChange(p,ordinary.id,{condition:''},'Change'),/condition/);
 assert.deepEqual(p,before);
});
test('reviewed changes preserve before/after decisions and historical baselines',()=>{
 const f=ruleFixture();recordWalkthrough(f);const previous=D.clone(f.fraud),proposal=proposeRelease2Change(f);
 assert.equal(f.fraud.outcome,previous.outcome);D.acceptBehaviorChange(f.p,proposal.id,'Maya reviewed renewal suppression.');
 const change=f.p.decisions.at(-1);assert.deepEqual(change.before,previous);assert.equal(change.after.outcome,'Revoke access immediately and suppress the next renewal');assert.equal(change.after.revision,previous.revision+1);
 assert.equal(f.p.versions[1].behaviors[1].outcome,previous.outcome);assert.equal(f.ordinary.outcome,f.expected.ordinaryOutcome);
 assert.deepEqual(D.importProject(D.exportProject(f.p)),f.p);
});
test('another accepted proposal blocks an older competing proposal',()=>{
 const {p,ordinary}=ruleFixture();
 const first=D.proposeBehaviorChange(p,ordinary.id,{owner:'Product owner A'},'Assign A'),second=D.proposeBehaviorChange(p,ordinary.id,{owner:'Product owner B'},'Assign B');
 D.acceptBehaviorChange(p,first.id);assert.throws(()=>D.acceptBehaviorChange(p,second.id),/changed after/);assert.equal(ordinary.owner,'Product owner A');assert.equal(second.status,'pending');
 D.rejectBehaviorChange(p,second.id);assert.throws(()=>D.acceptBehaviorChange(p,second.id),/pending/);assert.equal(p.decisions.at(-1).action,'rejected');assert.equal(p.decisions.at(-1).after,null);
 assert.deepEqual(D.importProject(D.exportProject(p)),p);
});
test('changed evidence blocks approval and proposal acceptance without overwriting rules',()=>{
 const {p,refs,fraud,ordinary}=ruleFixture();const before=D.clone(ordinary);
 const proposal=D.proposeBehaviorChange(p,ordinary.id,{owner:'Other owner'},'Assign owner');
 D.reviseSource(p,refs.prd,'A new ordinary-cancellation policy.');
 assert.ok(D.behaviorProposalBlocker(p,proposal));assert.throws(()=>D.acceptBehaviorChange(p,proposal.id),/evidence changed/);assert.deepEqual(ordinary,before);
 D.reviseSource(p,refs.sop,'An updated fraud SOP.');assert.throws(()=>D.approveBehavior(p,fraud.id),/source changed/);assert.equal(fraud.status,'draft');assert.throws(()=>D.saveVersion(p,'Unsafe'),/changed evidence/);
});
test('active rules and pending rule proposals protect original sources from archival',()=>{
 const {p,refs,ordinary}=ruleFixture();assert.throws(()=>D.archiveSource(p,refs.prd),/supports active/);
 const proposal=D.proposeBehaviorChange(p,ordinary.id,{outcome:'Reviewed policy'},'Review');assert.throws(()=>D.archiveBehavior(p,ordinary.id),/pending/);
 D.rejectBehaviorChange(p,proposal.id);D.archiveBehavior(p,ordinary.id);D.archiveSource(p,refs.prd);assert.equal(D.listBehaviors(p,{includeDrafts:false}).length,0);assert.equal(p.versions[0].behaviors[0].evidence[0].sourceId,refs.prd);
 D.restoreBehavior(p,ordinary.id);assert.equal(D.isStale(p,ordinary),true);D.restoreSource(p,refs.prd);assert.equal(D.isStale(p,ordinary),false);
});
test('schema1 upgrades safely while newer schemas and mislabelled schema1 rule data are refused',()=>{
 const p=D.createProject('Legacy');D.addSource(p,'PRD','An original source.');const bundle=JSON.parse(D.exportProject(p));bundle.schemaVersion=1;for(const key of ['behaviors','behaviorChanges','decisions'])delete bundle.project[key];
 const upgraded=D.importProject(JSON.stringify(bundle));assert.equal(upgraded.sources[0].revisions[0].content,'An original source.');assert.deepEqual(upgraded.behaviors,[]);assert.equal(JSON.parse(D.exportProject(upgraded)).schemaVersion,2);
 bundle.schemaVersion=3;assert.throws(()=>D.importProject(JSON.stringify(bundle)),/Unsupported/);
 const f=ruleFixture(),wrong=JSON.parse(D.exportProject(f.p));wrong.schemaVersion=1;assert.throws(()=>D.importProject(JSON.stringify(wrong)),/Schema 1/);
});
test('imports reject duplicate rule IDs, invalid scope, missing decisions, and tampered history',()=>{
 const f=ruleFixture();const duplicate=D.clone(f.p);duplicate.behaviors.push(D.clone(duplicate.behaviors[0]));assert.throws(()=>D.importProject(D.exportProject(duplicate)),/duplicate behavior/);
 const scope=D.clone(f.p);scope.behaviors[0].condition='';assert.throws(()=>D.importProject(D.exportProject(scope)),/qualified/);
 const missing=D.clone(f.p);missing.decisions=[];assert.throws(()=>D.importProject(D.exportProject(missing)),/decision history/);
 const forged=D.clone(f.p);forged.decisions[0].after.revision=10;assert.throws(()=>D.importProject(D.exportProject(forged)),/snapshot/);
 const baseline=D.clone(f.p);baseline.versions[0].behaviors[0].status='draft';assert.throws(()=>D.importProject(D.exportProject(baseline)),/baseline/);
});
test('a behavior-only baseline exports a complete qualified handbook',()=>{
 const {p,ordinary,refs}=ruleFixture();assert.equal(p.versions[0].sections.length,0);assert.match(D.toMarkdown(p,refs.baseline),/Actor: Workspace owner/);assert.match(D.toMarkdown(p),/Applies to: Release 1/);assert.doesNotMatch(D.toMarkdown(p),/## Fraud cancellation/);
 D.reviseSource(p,refs.prd,'Changed policy');assert.match(D.toMarkdown(p),/WARNING/);assert.doesNotMatch(D.toMarkdown(p,refs.baseline),/WARNING/);assert.equal(ordinary.condition,'Cancellation is ordinary and is not triggered by fraud');
});
test('document citation locations survive encrypted-project domain round trips and are validated',()=>{
 const p=D.createProject('Imported policy'),content='Owners keep access until the paid period ends.',source=D.addSource(p,'Imported PDF',content,'PRD',documentMetadata(content));
 const section=D.addSection(p,{title:'Access',body:content,sourceId:source.id,quote:'keep access'});D.approveSection(p,section.id);
 const behavior=D.addBehavior(p,{title:'Access rule',actor:'Owner',condition:'Ordinary cancellation',outcome:content,applicability:'Release 1',owner:'Maya',sourceId:source.id,quote:content});D.approveBehavior(p,behavior.id);
 assert.deepEqual(behavior.evidence[0].locations,[{blockId:'page-1-block-1',label:'Page 1',page:1}]);assert.deepEqual(D.importProject(D.exportProject(p)),p);
 const changed=D.clone(p);changed.behaviors[0].evidence[0].locations[0].page=8;assert.throws(()=>D.importProject(D.exportProject(changed)),/location/);
 const badMetadata=documentMetadata(content);badMetadata.blocks[0].end=content.length+1;assert.throws(()=>D.addSource(p,'Broken',content,'PRD',badMetadata),/location/);assert.equal(p.sources.length,1);
});
test('repeated evidence and revised plain text cannot falsely claim original document locations',()=>{
 const p=D.createProject('Repeated'),content='Same quote. Same quote.',source=D.addSource(p,'PDF',content,'Document',documentMetadata(content));
 assert.equal(D.makeEvidence(p,source.id,'Same quote.').locations,undefined);
 D.reviseSource(p,source.id,'Reviewed and different text.');assert.equal(source.revisions.at(-1).document,undefined);assert.equal(source.revisions[0].document.fileName,'policy.pdf');
});
test('AI provenance keeps original input revisions and cannot reference unrelated drafts',()=>{
 const {p,fraud,refs}=ruleFixture();const source=p.sources.find(source=>source.id===refs.sop);
 const run=D.recordAIRun(p,{task:'extract_handbook',provider:'fixture',model:'fixture-only',promptVersion:'1',schemaVersion:1,inputHash:'b'.repeat(64),at:new Date().toISOString(),sourceRefs:[{sourceId:source.id,revisionId:source.revisions[0].id}]});
 D.linkRunDraft(p,run.id,fraud.id);assert.equal(fraud.originRunId,run.id);assert.deepEqual(D.importProject(D.exportProject(p)),p);
 D.reviseSource(p,source.id,'Updated source.');assert.equal(run.sourceRefs[0].revisionId,source.revisions[0].id);assert.deepEqual(D.importProject(D.exportProject(p)),p);
 const bad=D.clone(p);bad.aiRuns[0].draftIds=[D.uid()];assert.throws(()=>D.importProject(D.exportProject(bad)),/metadata/);
 const badOrigin=D.clone(p);badOrigin.behaviors[1].originRunId=D.uid();assert.throws(()=>D.importProject(D.exportProject(badOrigin)),/originating/);
});
