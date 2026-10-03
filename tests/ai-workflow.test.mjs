import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/domain.js';
import {candidateRule,resultIsStale} from '../src/ai-ui.js';
import {createAIRequest,validateAIResult,aiInputHash} from '../src/ai.js';

async function fixture() {
  const p=D.createProject('Fictional review workflow');
  const source=D.addSource(p,'Release 2 policy','For confirmed fraud only, revoke access immediately. Ordinary cancellation keeps access until the paid period ends.');
  const revision=source.revisions[0];
  const sources=[{sourceId:source.id,revisionId:revision.id,title:source.title,content:revision.content}];
  const request=createAIRequest({projectTitle:p.name,sources,consent:true});
  const output=validateAIResult({behaviors:[{title:'Fraud exception',actor:'Fraud operations',condition:'Confirmed fraud only',outcome:'Revoke access immediately',scope:'Release 2',exclusions:'Ordinary cancellation is excluded',roles:['QA','Development'],evidence:[{sourceId:source.id,revisionId:revision.id,quote:'For confirmed fraud only, revoke access immediately.'}]}],questions:[],warnings:[]},request);
  const run=D.recordAIRun(p,{task:'extract_handbook',provider:'fixture',model:'credential-free-test',promptVersion:'test-1',schemaVersion:1,inputHash:await aiInputHash(request),at:new Date().toISOString(),sourceRefs:sources.map(({sourceId,revisionId})=>({sourceId,revisionId}))});
  return {p,source,output,run,result:{projectId:p.id,sources}};
}

test('AI review produces an unapproved qualified draft with preserved evidence and provenance',async()=>{
  const {p,output,run}=await fixture();
  const draft=D.addBehavior(p,candidateRule(output.behaviors[0],'Maya'));
  D.linkRunDraft(p,run.id,draft.id);
  const reopened=D.importProject(D.exportProject(p));
  assert.equal(reopened.behaviors[0].status,'draft');
  assert.equal(reopened.decisions.length,0);
  assert.equal(reopened.behaviors[0].condition,'Confirmed fraud only');
  assert.match(reopened.behaviors[0].applicability,/Ordinary cancellation is excluded/);
  assert.equal(reopened.behaviors[0].originRunId,run.id);
  assert.deepEqual(reopened.aiRuns[0].draftIds,[draft.id]);
  assert.deepEqual(reopened.behaviors[0].evidence,output.behaviors[0].evidence);
});

test('old AI candidates become stale after revisions, archive, or switching project copies',async()=>{
  const {p,source,result,output}=await fixture();
  assert.equal(resultIsStale(p,result),false);
  const copy=D.clone(p);copy.id=D.uid();assert.equal(resultIsStale(copy,result),true);
  D.archiveSource(p,source.id);assert.equal(resultIsStale(p,result),true);
  D.restoreSource(p,source.id);D.reviseSource(p,source.id,'Revised fraud scope.');
  assert.equal(resultIsStale(p,result),true);
  assert.throws(()=>D.addBehavior(p,candidateRule(output.behaviors[0],'Maya')),/exact|changed/);
  assert.equal(p.behaviors.length,0);
});

test('discarded or unsupported output cannot become approved context through AI review',async()=>{
  const {p,source,output}=await fixture();
  const before=D.clone(p),candidate=structuredClone(output.behaviors[0]);
  candidate.evidence[0].quote='All cancellations immediately revoke access.';
  assert.throws(()=>D.addBehavior(p,candidateRule(candidate,'Maya')),/exact/);
  assert.deepEqual(p,before);
  assert.equal(source.revisions.length,1);
});
