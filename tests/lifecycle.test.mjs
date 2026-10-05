import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/domain.js';
import * as L from '../src/lifecycle.js';
import * as K from '../src/knowledge.js';
import * as T from '../src/project-tools.js';
import {attentionItems} from '../src/attention.js';
import {createVault,openVault} from '../src/vault.js';
import * as F from '../src/sharing.js';
import {createAIRequest} from '../src/ai.js';
function fixture(){const p=D.createProject('Independent authored delivery'),pm=D.addMember(p,'Fixture PM','Product'),qa=D.addMember(p,'Fixture QA','QA'),source=D.addSource(p,'Authored PRD','Ordinary cancellation retains paid access until period end. Confirmed fraud immediately suspends access.');const release=L.addRecord(p,'releases',{title:'R1'},pm.id),environment=L.addRecord(p,'environments',{title:'Production'},pm.id),scope={state:'specific',releaseIds:[release.id],environmentIds:[environment.id]},context={releaseId:release.id,environmentId:environment.id,build:'fixture-build'};const req=L.addRecord(p,'requirements',{title:'Paid cancellation',scope,evidence:[D.makeEvidence(p,source.id,'Ordinary cancellation retains paid access until period end.')],data:{type:'behavior',description:'Ordinary cancellation retains paid access until period end; confirmed fraud is excluded.'}},pm.id);L.approveRecord(p,'requirements',req.id,pm.id,'Reviewed authored PRD');return {p,pm,qa,source,release,environment,scope,context,req};}
function approvedCase(f){const c=L.addRecord(f.p,'cases',{title:'Paid period boundary',role:'QA',scope:f.scope,refs:[L.reference(f.p,'requirements',f.req.id)],data:{steps:'Cancel ordinary subscription before period end.',expected:'Access remains until the paid boundary.'}},f.qa.id);L.approveRecord(f.p,'cases',c.id,f.qa.id,'Concrete authored check');return c;}
test('independent authored delivery survives three encrypted save/reopen and two sharing cycles',async()=>{
 const f=fixture(),c=approvedCase(f);L.recordRun(f.p,{title:'Authored manual run',results:[{caseId:c.id,result:'pass'}],...f.context},f.qa.id);let p=f.p;
 for(let i=0;i<3;i++){const {envelope}=await createVault(JSON.parse(D.exportProject(p)),'fictional authored passphrase');p=D.importProject(JSON.stringify((await openVault(envelope,'fictional authored passphrase')).data));assert.deepEqual(p,D.importProject(D.exportProject(f.p)));}
 for(let i=0;i<2;i++){p=await F.startSharingRound(p);const returned=D.clone(p);D.updateProject(returned,'Authored iteration '+i,'Reviewed return');const comparison=await F.compareProjectCopies(p,returned);p=await F.mergeProjectCopies(p,comparison,Object.fromEntries(comparison.differences.map(d=>[d.id,'incoming'])),{reviewerId:f.pm.id,note:'Fictional authored return '+i});p=D.importProject(D.exportProject(p));assert.equal(p.name,'Authored iteration '+i);assert.equal(L.list(p,'runs').length,1);assert.equal(p.mergeArchives.length,i+1);}
});
test('native import rejects source, immutable history, approval and linked revision tampering',()=>{
 const f=fixture();approvedCase(f);const tamper=[p=>p.sources[0].revisions[0].content='Redefined original',p=>p.delivery.requirements[0].history[0].snapshot.id=D.uid(),p=>p.delivery.requirements[0].approval.memberId=D.uid(),p=>p.delivery.cases[0].refs[0].revision=99];
 for(const change of tamper){const p=D.clone(f.p);change(p);assert.throws(()=>D.importProject(D.exportProject(p)));}
 const once=D.importProject(D.exportProject(f.p));assert.deepEqual(D.importProject(D.exportProject(once)),once);
});
test('requirement approval rejects unknown scope and NFRs without measurable thresholds',()=>{
 const f=fixture(),r=L.addRecord(f.p,'requirements',{title:'Unknown requirement',data:{type:'NFR'}},f.pm.id);assert.throws(()=>L.approveRecord(f.p,'requirements',r.id,f.pm.id,'Review'),/NFR approval/);
 L.editRecord(f.p,'requirements',r.id,{data:{acceptanceMeasures:[{name:'p95',unit:'ms',operator:'lte',target:200}]}},f.pm.id,'Set measure');assert.throws(()=>L.approveRecord(f.p,'requirements',r.id,f.pm.id,'Review'),/scope/);
 L.editRecord(f.p,'requirements',r.id,{scope:f.scope},f.pm.id,'Declare scope');L.approveRecord(f.p,'requirements',r.id,f.pm.id,'Measured contract');assert.equal(r.status,'approved');
});
test('receipt tracks current owner, scope and criteria without treating completion as acknowledgment',()=>{
 const f=fixture(),w=L.addRecord(f.p,'work',{title:'Implement boundary',ownerId:f.qa.id,role:'QA',scope:f.scope,data:{criteria:'Verify ordinary boundary.'}},f.pm.id);L.editRecord(f.p,'work',w.id,{status:'accepted'},f.qa.id,'Owned check');assert.equal(L.currentReceipt(w),undefined);assert.throws(()=>L.acknowledge(f.p,w.id,f.pm.id,'Wrong owner'),/owner/);L.acknowledge(f.p,w.id,f.qa.id,'Reviewed');assert.ok(L.currentReceipt(w));L.editRecord(f.p,'work',w.id,{data:{criteria:'Verify boundary and expiry.'}},f.qa.id,'More precise');assert.equal(L.currentReceipt(w),undefined);assert.equal(w.data.acknowledgments.length,1);
});
test('review inbox respects ownership and includes drafts, proposals and missing evidence',()=>{
 const f=fixture(),proposal=L.proposeRecord(f.p,'requirements',f.req.id,{title:'Paid cancellation revised'},f.pm.id,'Clarify');const all=attentionItems(f.p,{...f.context}),mine=attentionItems(f.p,{...f.context,ownership:'mine',person:f.qa.id});assert.ok(all.some(i=>i.recordId===proposal.id));assert.ok(all.some(i=>i.kind==='evidence gap'));assert.equal(mine.some(i=>i.recordId===proposal.id),false);
});
test('approved change keeps original case result immutable and invalidates applicability',()=>{
 const f=fixture(),c=approvedCase(f),run=L.recordRun(f.p,{title:'Actual fixture run',results:[{caseId:c.id,result:'pass'}],...f.context},f.qa.id),original=D.clone(run);assert.equal(L.evidenceMatrix(f.p,f.context)[0].state,'has current evidence');const q=L.proposeRecord(f.p,'requirements',f.req.id,{data:{description:'Revised boundary contract'}},f.pm.id,'Change');L.decideProposal(f.p,q.id,'accepted',f.pm.id,'Review revised boundary');assert.deepEqual(run,original);assert.notEqual(L.evidenceMatrix(f.p,f.context)[0].state,'has current evidence');assert.throws(()=>L.editRecord(f.p,'runs',run.id,{status:'completed'},f.qa.id,'Forged'),/immutable/);D.importProject(D.exportProject(f.p));
});
test('different build and equal-time failure cannot be presented as current passing evidence',()=>{
 const f=fixture(),c=approvedCase(f),at=new Date(Date.now()+1000).toISOString();L.recordRun(f.p,{title:'Pass',results:[{caseId:c.id,result:'pass'}],...f.context,executedAt:at},f.qa.id);L.recordRun(f.p,{title:'Fail',results:[{caseId:c.id,result:'fail'}],...f.context,executedAt:at},f.qa.id);assert.equal(L.evidenceMatrix(f.p,f.context)[0].state,'failed');assert.ok(L.evidenceMatrix(f.p,{...f.context,build:'other'})[0].results.every(r=>r.applicability==='other build'));
});
test('NFR reported pass without measurements or outside threshold remains an evidence gap',()=>{
 const f=fixture();const measures=[{name:'p95',unit:'ms',operator:'lte',target:200}],r=L.addRecord(f.p,'requirements',{title:'Response latency',scope:f.scope,data:{type:'NFR',acceptanceMeasures:measures}},f.pm.id);L.approveRecord(f.p,'requirements',r.id,f.pm.id,'Declared threshold');const c=L.addRecord(f.p,'cases',{title:'Measured latency',scope:f.scope,refs:[L.reference(f.p,'requirements',r.id)],data:{steps:'Load fixture at stated rate.',expected:'p95 <= 200 ms.',acceptanceMeasures:measures}},f.qa.id);L.approveRecord(f.p,'cases',c.id,f.qa.id,'Check');for(const measurements of [[],[{name:'p95',unit:'ms',value:500}]])L.recordRun(f.p,{title:'Untrusted reported pass',results:[{caseId:c.id,result:'pass',measurements}],...f.context},f.qa.id);const row=L.evidenceMatrix(f.p,f.context).find(x=>x.requirement.id===r.id);assert.deepEqual(row.results.map(x=>x.applicability),['measurements missing','recorded outcome conflicts with measures']);assert.notEqual(row.state,'has current evidence');
});
test('rehearsal preserves approved agreement and changed base invalidates acceptance',async()=>{
 const f=fixture(),before=L.snapshot(f.req),s=await L.rehearse(f.p,{kind:'requirements',id:f.req.id},{title:'Alternative'},f.pm.id,'Consider');assert.deepEqual(L.snapshot(f.req),before);const q=L.proposeRecord(f.p,'requirements',f.req.id,{title:'Actual change'},f.pm.id,'Change');L.decideProposal(f.p,q.id,'accepted',f.pm.id,'Review');await assert.rejects(()=>L.acceptScenario(f.p,s.id,f.pm.id,'Accept'),/base changed/);
});
test('safe reading pack excludes drafts, internal context and superseded scope',()=>{
 const f=fixture(),g=L.derivedGuidance(f.p,f.req.id,'Support',f.pm.id);L.editRecord(f.p,'guidance',g.id,{data:{customerSafe:true}},f.pm.id,'Reviewed wording');L.approveRecord(f.p,'guidance',g.id,f.pm.id,'Safe summary');const pack=L.readingPack(f.p,{role:'Support',context:f.context,ids:[g.id]});assert.equal(pack.items.length,1);assert.equal(Object.hasOwn(pack,'sources'),false);assert.throws(()=>L.readingPack(f.p,{role:'Support',context:{...f.context,environmentId:D.uid()},ids:[g.id]}),/known applicable/);D.reviseSource(f.p,f.source.id,'Changed original source.');assert.throws(()=>L.readingPack(f.p,{role:'Support',context:f.context,ids:[g.id]}),/approved customer-safe/);
});
test('retrieval rejects weak body overlap while preserving specific titles and single-term queries',()=>{
 const f=fixture();assert.equal(K.retrieveKnowledge(f.p,'fraud suspension',f.context).matches.length,0);assert.equal(K.retrieveKnowledge(f.p,'paid cancellation',f.context).matches[0].id,f.req.id);assert.equal(K.retrieveKnowledge(f.p,'ordinary',f.context).matches[0].id,f.req.id);assert.equal(K.retrieveKnowledge(f.p,'paid cancellation',{...f.context,environmentId:D.uid()}).matches.length,0);
});
test('grounded answer refuses changed project, restricted source and unsupported citations',()=>{
 const f=fixture(),context=K.retrieveKnowledge(f.p,'paid cancellation',f.context);assert.ok(K.answerPayload(f.p,context).sources.length);assert.throws(()=>K.validateGroundedAnswer(f.p,context,{evidence:[{sourceId:f.source.id,revisionId:f.source.revisions[0].id,quote:'Confirmed fraud immediately suspends access.'}]}),/outside/);f.source.origin={access:'lost'};assert.equal(K.knowledgeIsStale(f.p,context),true);assert.throws(()=>K.answerPayload(f.p,context),/changed/);
});
test('feature flag selection is preserved through retrieval, staleness and the AI request contract',()=>{
 const f=fixture(),p=L.proposeRecord(f.p,'requirements',f.req.id,{scope:{...f.scope,flags:['cancel-v2']}},f.pm.id,'Flag rollout');L.decideProposal(f.p,p.id,'accepted',f.pm.id,'Reviewed rollout');
 const context=K.retrieveKnowledge(f.p,'paid cancellation',{...f.context,flag:'cancel-v2'});assert.equal(context.matches[0].applicability,true);assert.equal(context.flag,'cancel-v2');
 assert.equal(K.retrieveKnowledge(f.p,'paid cancellation',{...f.context,flag:'different'}).matches.length,0);assert.equal(K.retrieveKnowledge(f.p,'paid cancellation',f.context).matches[0].applicability,null);
 assert.throws(()=>K.answerPayload(f.p,K.retrieveKnowledge(f.p,'paid cancellation',f.context)),/No current/);
 const input=createAIRequest({task:'answer_question',consent:true,...K.answerPayload(f.p,context)});assert.equal(input.answerContext.selection.flag,'cancel-v2');assert.equal(K.knowledgeIsStale(f.p,context),false);
});
test('all 26 native record families persist together with linked revision validation',async()=>{
 const f=fixture(),c=approvedCase(f),run=L.recordRun(f.p,{title:'Family fixture run',results:[{caseId:c.id,result:'pass'}],...f.context},f.qa.id);
 for(const kind of L.FAMILIES.filter(k=>!L.list(f.p,k).length&&!['edges','scenarios','carryForwards','assets','proposals'].includes(k)))L.addRecord(f.p,kind,{title:'Authored '+kind,scope:{state:'general'},data:kind==='roles'||kind==='glossary'?{aliases:[]}:{}},f.pm.id);
 L.addEdge(f.p,{from:L.reference(f.p,'cases',c.id),to:L.reference(f.p,'requirements',f.req.id),type:'verifies',scope:f.scope,reason:'Exact case dependency'},f.qa.id);
 await L.rehearse(f.p,{kind:'requirements',id:f.req.id},{title:'Rehearsed alternative'},f.pm.id,'Consider');L.proposeRecord(f.p,'requirements',f.req.id,{title:'Proposed alternative'},f.pm.id,'Review');L.carryForward(f.p,{runId:run.id,caseId:c.id,requirementId:f.req.id,reason:'Recorded review only',context:f.context},f.qa.id);
 await L.retainAsset(f.p,{size:3,name:'fixture.txt',type:'text/plain',arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer},f.pm.id);
 const reopened=D.importProject(D.exportProject(f.p));assert.deepEqual(reopened.delivery,f.p.delivery);assert.ok(L.FAMILIES.every(kind=>L.list(reopened,kind).length));
});
test('recorded graph cycles stay bounded, unrelated scope is excluded and hierarchy cycles reject',()=>{
 const f=fixture(),component=L.addRecord(f.p,'components',{title:'Billing service',scope:f.scope},f.pm.id),second=L.addRecord(f.p,'components',{title:'Access service',scope:f.scope},f.pm.id);
 for(const [from,to] of [[L.reference(f.p,'requirements',f.req.id),L.reference(f.p,'components',component.id)],[L.reference(f.p,'components',component.id),L.reference(f.p,'components',second.id)],[L.reference(f.p,'components',second.id),L.reference(f.p,'requirements',f.req.id)]])L.addEdge(f.p,{from,to,type:'related',scope:f.scope,reason:'Reviewed dependency'},f.pm.id);
 const graph=L.impact(f.p,{kind:'requirements',id:f.req.id},f.context);assert.equal(graph.items.length,2);assert.equal(L.impact(f.p,{kind:'requirements',id:f.req.id},{...f.context,environmentId:D.uid()}).items.length,0);
 const child=L.addRecord(f.p,'requirements',{title:'Child',scope:f.scope},f.pm.id);L.addEdge(f.p,{from:L.reference(f.p,'requirements',child.id),to:L.reference(f.p,'requirements',f.req.id),type:'child-of',scope:f.scope,reason:'Reviewed parent'},f.pm.id);assert.throws(()=>L.addEdge(f.p,{from:L.reference(f.p,'requirements',f.req.id),to:L.reference(f.p,'requirements',child.id),type:'child-of',scope:f.scope,reason:'Bad cycle'},f.pm.id),/cycle/);
});
