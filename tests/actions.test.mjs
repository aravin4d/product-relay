import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/domain.js';
import {createHandoffFixture,recordWalkthrough} from '../examples/fixtures/orbit-handoff.mjs';
function fixture(){const f=createHandoffFixture();recordWalkthrough(f);const p=f.project;return {...f,p,ordinary:p.behaviors[0],fraud:p.behaviors[1],reviewer:p.members.find(item=>item.role==='Product').id,qa:p.members.find(item=>item.role==='QA').id,dev:p.members.find(item=>item.role==='Development').id};}
function work(f,behavior=f.fraud,roles=['QA']){const review=D.confirmBehaviorImpact(f.p,behavior.id,{reviewerId:f.reviewer,roles,rationale:'Review the fraud-only release boundary manually.'});const actions=D.proposeRoleActions(f.p,review.id,{ownerIds:Object.fromEntries(roles.map(role=>[role,f.qa]))});return {review,actions,action:actions[0]};}
function pass(f,behavior=f.fraud,extra={}){return D.recordVerification(f.p,behavior.id,{behaviorRevision:behavior.revision,memberId:f.qa,environment:'Staging',release:'Release 2',result:'pass',artifactUrl:'https://example.com/checks/42',note:'Checked the applicable behavior.',...extra});}
function scopeChange(f,behavior=f.fraud,input={outcome:'Revoke access immediately and suppress renewal'}){const proposal=D.proposeBehaviorChange(f.p,behavior.id,input,'Owner reviewed the revised applicable behavior.');D.acceptBehaviorChange(f.p,proposal.id,'Maya confirms the scoped change.');return proposal;}
const reopen = p => D.importProject(D.exportProject(p));

test('role suggestions preserve the exact actor, condition, outcome, applicability, and evidence without mutating the project',()=>{
 const f=fixture(),before=D.clone(f.p),suggestions=D.getActionSuggestions(f.p,f.fraud.id);assert.equal(suggestions.length,5);assert.deepEqual(f.p,before);
 for(const suggestion of suggestions){for(const key of ['actor','condition','outcome','applicability'])assert.ok(suggestion.acceptanceCriteria.includes(f.fraud[key]));assert.deepEqual(suggestion.behaviorSnapshot,D.getBehaviorRevision(f.p,f.fraud.id,f.fraud.revision));assert.equal(suggestion.behaviorRevision,f.fraud.revision);}
 assert.throws(()=>D.getActionSuggestions(f.p,D.uid()),/approved/);
});
test('manual impact review is required and only selected perspectives receive proposed work',()=>{
 const f=fixture();assert.throws(()=>D.addAction(f.p,{role:'QA',title:'Check',acceptanceCriteria:'Criteria',rationale:'Manual review'}),/Confirm/);
 const {review,actions}=work(f,f.fraud,['QA','Support']);assert.equal(review.selfReported,true);assert.deepEqual(actions.map(item=>item.role),['QA','Support']);assert.ok(actions.every(item=>item.status==='proposed'));
 assert.throws(()=>D.addAction(f.p,{impactReviewId:review.id,role:'Operations',title:'Rollout',acceptanceCriteria:'Scope',rationale:'Ops'}),/perspective/);
 assert.deepEqual(reopen(f.p),f.p);
});
test('invalid owner batch does not leave partially proposed actions',()=>{
 const f=fixture(),review=D.confirmBehaviorImpact(f.p,f.fraud.id,{reviewerId:f.reviewer,roles:['Product','QA'],rationale:'Both roles apply.'}),before=D.clone(f.p);
 assert.throws(()=>D.proposeRoleActions(f.p,review.id,{ownerIds:{Product:f.reviewer,QA:D.uid()}}),/teammate/);assert.deepEqual(f.p,before);
 assert.throws(()=>D.confirmBehaviorImpact(f.p,f.fraud.id,{reviewerId:f.reviewer,roles:['QA','QA'],rationale:'Duplicate'}),/perspectives/);
});
test('reviewer accepts action scope before progress and named owner IDs survive member renaming',()=>{
 const f=fixture(),{action}=work(f);assert.equal(D.actionReviewState(f.p,action).needsReview,false);assert.throws(()=>D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Done'}),/Accept/);
 D.acceptAction(f.p,action.id,{reviewerId:f.reviewer,note:'Review of scope and criteria.'});D.updateMember(f.p,f.qa,'Alex renamed','QA');assert.equal(action.ownerId,f.qa);assert.equal(f.p.actionDecisions[0].memberId,f.reviewer);assert.equal(action.status,'accepted');
 assert.throws(()=>D.editAction(f.p,action.id,{title:'Silent new scope'}),/action change/);assert.deepEqual(reopen(f.p),f.p);
});
test('acknowledgment and completed actions never create passing test evidence',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});const receipt=D.acknowledgeAction(f.p,action.id,{memberId:f.qa,note:'Read the applicable rule.'});assert.equal(receipt.actionRevision,action.revision);assert.equal(action.status,'accepted');assert.equal(f.p.verifications.length,0);
 D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Implementation reported complete; tests are separate.'});assert.equal(f.p.verifications.length,0);assert.ok(D.reviewSummary(f.p,{behaviorId:f.fraud.id}).missingWork.some(item=>item.kind==='verification'));assert.deepEqual(reopen(f.p),f.p);
});
test('blocked and not-applicable statuses require reasons and preserve those reports',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});assert.throws(()=>D.updateActionStatus(f.p,action.id,'not-applicable',{memberId:f.qa}),/reason/);
 D.updateActionStatus(f.p,action.id,'blocked',{memberId:f.qa,note:'Release environment not available.'});assert.ok(D.reviewSummary(f.p).missingWork.some(item=>item.reason.includes('Release environment')));
 D.updateActionStatus(f.p,action.id,'not-applicable',{memberId:f.qa,note:'This release excludes the scoped environment.'});assert.equal(f.p.actionDecisions.at(-1).note,'This release excludes the scoped environment.');assert.deepEqual(reopen(f.p),f.p);
});
test('a fraud meaning change selectively stales its work while retaining completed status and ordinary verification',()=>{
 const f=fixture(),fraudWork=work(f),ordinaryWork=work(f,f.ordinary);for(const action of [fraudWork.action,ordinaryWork.action]){D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Recorded completion for this scope.'});}
 const fraudPass=pass(f),ordinaryPass=pass(f,f.ordinary);scopeChange(f);
 assert.equal(fraudWork.action.status,'completed');assert.equal(D.actionReviewState(f.p,fraudWork.action).rulesStale,true);assert.equal(D.actionReviewState(f.p,ordinaryWork.action).needsReview,false);
 assert.equal(D.verificationState(f.p,fraudPass).state,'stale');assert.equal(D.verificationState(f.p,ordinaryPass).state,'applicable');assert.equal(f.p.verifications.length,2);assert.deepEqual(reopen(f.p),f.p);
});
test('rule title, owner, and audience metadata revisions retain existing verification and action applicability',()=>{
 const f=fixture(),{action}=work(f),record=pass(f);scopeChange(f,f.fraud,{title:'Fraud-only cancellation policy',owner:'New product owner',audiences:['QA','Product']});
 assert.equal(D.verificationState(f.p,record).state,'applicable');assert.equal(D.actionReviewState(f.p,action).needsReview,false);assert.ok(record.behaviorRevision<f.fraud.revision);assert.deepEqual(reopen(f.p),f.p);
});
test('whole source staleness is separate from agreed rule meaning, and blocks a new current pass',()=>{
 const f=fixture(),{action}=work(f),record=pass(f),source=f.p.sources.find(item=>item.id===f.fraud.evidence[0].sourceId);D.reviseSource(f.p,source.id,'New interpretation is awaiting a product decision.');
 assert.equal(D.verificationState(f.p,record).state,'applicable');assert.equal(D.verificationState(f.p,record).sourceNeedsReview,true);assert.equal(D.actionReviewState(f.p,action).rulesStale,false);assert.equal(D.actionReviewState(f.p,action).sourceNeedsReview,true);
 assert.throws(()=>pass(f),/sources changed/);D.recordVerification(f.p,f.fraud.id,{behaviorRevision:f.fraud.revision,memberId:f.qa,environment:'Staging',release:'Release 2',result:'inconclusive',note:'Source review is still pending.'});assert.deepEqual(reopen(f.p),f.p);
});
test('reviewing new source evidence clears the current warning while preserving unchanged rule verification',()=>{
 const f=fixture(),{action}=work(f),record=pass(f),source=f.p.sources.find(item=>item.id===f.fraud.evidence[0].sourceId),content='Maya reconfirmed fraud-only immediate access revocation for release 2.';
 D.reviseSource(f.p,source.id,content);assert.equal(D.verificationState(f.p,record).sourceNeedsReview,true);scopeChange(f,f.fraud,{sourceId:source.id,quote:content});
 assert.equal(D.verificationState(f.p,record).state,'applicable');assert.equal(D.verificationState(f.p,record).sourceNeedsReview,false);assert.equal(D.actionReviewState(f.p,action).sourceNeedsReview,false);assert.equal(D.actionReviewState(f.p,action).needsReview,false);assert.deepEqual(reopen(f.p),f.p);
});
test('old or archived rule verification requires explicit historical context and cannot supply current passing coverage',()=>{
 const f=fixture(),oldRevision=f.fraud.revision;scopeChange(f);assert.throws(()=>pass(f,f.fraud,{behaviorRevision:oldRevision}),/historical/);
 const historical=pass(f,f.fraud,{behaviorRevision:oldRevision,context:'historical'});assert.equal(D.verificationState(f.p,historical).state,'historical');assert.ok(D.reviewSummary(f.p,{behaviorId:f.fraud.id}).missingWork.some(item=>item.kind==='verification'));
 D.archiveBehavior(f.p,f.fraud.id);assert.throws(()=>pass(f),/active approved/);const archived=pass(f,f.fraud,{context:'historical'});assert.equal(D.verificationState(f.p,archived).state,'historical');assert.deepEqual(reopen(f.p),f.p);
});
test('accepting a rescope retains completed status but requires a fresh completion report for the revised criteria',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Original checks complete.'});scopeChange(f);
 const review=D.confirmBehaviorImpact(f.p,f.fraud.id,{reviewerId:f.reviewer,roles:['QA'],rationale:'Recheck the new fraud-only outcome.'});const proposal=D.proposeActionChange(f.p,action.id,{impactReviewId:review.id,acceptanceCriteria:'Check immediate revocation and renewal suppression.'},'Rule outcome changed.');
 assert.equal(action.revision,1);D.acceptActionChange(f.p,proposal.id,{reviewerId:f.reviewer,note:'Reviewed new scope.'});assert.equal(action.status,'completed');assert.equal(action.revision,2);assert.equal(D.actionReviewState(f.p,action).needsReview,true);
 D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Rechecked the revised scope.'});assert.equal(D.actionReviewState(f.p,action).needsReview,false);assert.equal(f.p.verifications.length,0);assert.deepEqual(reopen(f.p),f.p);
});
test('owner reassignment requires review and retains completion for unchanged scope',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Completed the agreed criteria.'});const proposal=D.proposeActionChange(f.p,action.id,{ownerId:f.dev},'Sam maintains this work.');assert.equal(action.ownerId,f.qa);
 D.acceptActionChange(f.p,proposal.id,{reviewerId:f.reviewer});assert.equal(action.ownerId,f.dev);assert.equal(action.status,'completed');assert.equal(D.actionReviewState(f.p,action).needsReview,false);assert.deepEqual(reopen(f.p),f.p);
});
test('owner-only reassignment cannot make an earlier stale completion applicable again',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Completed original criteria.'});
 const rescope=D.proposeActionChange(f.p,action.id,{acceptanceCriteria:'Recheck fraud and renewal suppression.'},'Expanded checks.');D.acceptActionChange(f.p,rescope.id,{reviewerId:f.reviewer});assert.equal(D.actionReviewState(f.p,action).needsReview,true);
 const owner=D.proposeActionChange(f.p,action.id,{ownerId:f.dev},'Reassign the stale work.');D.acceptActionChange(f.p,owner.id,{reviewerId:f.reviewer});assert.equal(action.status,'completed');assert.equal(action.statusRevision,1);assert.equal(D.actionReviewState(f.p,action).needsReview,true);assert.deepEqual(reopen(f.p),f.p);
});
test('competing accepted action proposals and changed impact reviews cannot overwrite later work',()=>{
 const f=fixture(),{action,review}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});const first=D.proposeActionChange(f.p,action.id,{ownerId:f.dev},'Owner reassignment.'),second=D.proposeActionChange(f.p,action.id,{title:'Another title'},'Retitle.');
 D.acceptActionChange(f.p,first.id,{reviewerId:f.reviewer});assert.throws(()=>D.acceptActionChange(f.p,second.id,{reviewerId:f.reviewer}),/changed after/);D.rejectActionChange(f.p,second.id,{reviewerId:f.reviewer,note:'Recreate with current owner.'});scopeChange(f);assert.throws(()=>D.proposeRoleActions(f.p,review.id),/scope changed/);assert.deepEqual(reopen(f.p),f.p);
});
test('acknowledgments retain exact proposed action revisions and accepted change revisions',()=>{
 const f=fixture(),{action}=work(f),first=D.acknowledgeAction(f.p,action.id,{memberId:f.qa});D.editAction(f.p,action.id,{title:'Explicitly edited proposal'});const second=D.acknowledgeAction(f.p,action.id,{memberId:f.qa});assert.equal(first.actionRevision,1);assert.equal(second.actionRevision,2);
 const proposal=scopeChange(f),receipt=D.acknowledgeBehaviorChange(f.p,proposal.id,{memberId:f.qa,note:'Reviewed the accepted change.'});assert.equal(receipt.behaviorRevision,f.fraud.revision);assert.deepEqual(reopen(f.p),f.p);
});
test('verification requires explicit environment and release, supports fail/inconclusive, and rejects active content URLs',()=>{
 const f=fixture();assert.throws(()=>pass(f,f.fraud,{release:''}),/environment, release/);assert.throws(()=>pass(f,f.fraud,{artifactUrl:'javascript:alert(1)'}),/safe artifact/);assert.throws(()=>pass(f,f.fraud,{artifactUrl:'https://user:secret@example.com'}),/safe artifact/);
 const failed=pass(f,f.fraud,{result:'fail',artifactUrl:'',note:'Renewal was not suppressed.'}),unclear=pass(f,f.fraud,{result:'inconclusive',artifactUrl:'',note:'Environment not ready.'});assert.equal(failed.selfReported,true);assert.equal(unclear.result,'inconclusive');assert.ok(D.reviewSummary(f.p).missingWork.some(item=>item.reason.includes('fail result')));assert.deepEqual(reopen(f.p),f.p);
});
test('review summary explains missing selected work and evidence without a readiness score',()=>{
 const f=fixture();D.confirmBehaviorImpact(f.p,f.fraud.id,{reviewerId:f.reviewer,roles:['QA'],rationale:'Only QA needs new work at this time.'});const summary=D.reviewSummary(f.p,{behaviorId:f.fraud.id});assert.ok(summary.missingWork.some(item=>item.kind==='suggested-action'&&item.reason.includes('QA')));assert.ok(summary.missingWork.some(item=>item.kind==='verification'));assert.equal(summary.score,undefined);assert.equal(summary.readiness,undefined);
});
test('action snapshots in baselines are optional and cannot replace baseline behavior agreement',()=>{
 const f=fixture(),{action}=work(f);const noActions=D.saveVersion(f.p,'Agreement without task snapshot');assert.equal(noActions.actions,undefined);const withActions=D.saveVersion(f.p,'Agreement and proposed follow-through',{includeActions:true});assert.equal(withActions.actions[0].id,action.id);D.editAction(f.p,action.id,{title:'Later proposal'});assert.notEqual(withActions.actions[0].title,action.title);assert.deepEqual(reopen(f.p),f.p);
 const forged=D.clone(f.p);forged.versions.at(-1).behaviors=forged.versions.at(-1).behaviors.filter(item=>item.id!==f.fraud.id);assert.throws(()=>reopen(forged),/Baseline action/);
});
test('schema 1 and 2 upgrade without dropping original content and reject mislabeled team work or future schemas',()=>{
 const f=fixture(),legacy=JSON.parse(D.exportProject(f.p));legacy.schemaVersion=2;for(const key of ['impactReviews','actions','actionChanges','actionDecisions','acknowledgments','verifications'])delete legacy.project[key];const upgraded=D.importProject(JSON.stringify(legacy));assert.equal(upgraded.sources[0].revisions[0].content,f.p.sources[0].revisions[0].content);assert.deepEqual(upgraded.behaviors,f.p.behaviors);assert.deepEqual(upgraded.actions,[]);
 work(f);for(const schemaVersion of [1,2]){const wrong=JSON.parse(D.exportProject(f.p));wrong.schemaVersion=schemaVersion;assert.throws(()=>D.importProject(JSON.stringify(wrong)),/Schema/);}legacy.schemaVersion=5;assert.throws(()=>D.importProject(JSON.stringify(legacy)),/Unsupported/);
});
test('imports reject forged snapshots, unknown owners, duplicate IDs, stale receipt scopes, and unsupported artifact schemes',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.acknowledgeAction(f.p,action.id,{memberId:f.qa});pass(f);
 const mutate=(operation,pattern)=>{const bad=D.clone(f.p);operation(bad);assert.throws(()=>reopen(bad),pattern);};
 mutate(p=>p.actions.push(D.clone(p.actions[0])),/duplicate actions/);mutate(p=>p.actions[0].ownerId=D.uid(),/scope or owner/);mutate(p=>p.actions[0].behaviorSnapshot.outcome='All cancellations revoke access',/exact agreed/);
 mutate(p=>p.verifications[0].behaviorSnapshot.evidence[0].sourceId=D.uid(),/evidence reference/);mutate(p=>p.verifications[0].artifactUrl='data:text/html,unsafe',/verification/);mutate(p=>p.acknowledgments[0].actionRevision=999,/acknowledgment revision/);mutate(p=>p.actions[0].status='completed',/recorded history/);mutate(p=>p.actionDecisions=[],/scope review history/);
});
test('imports cannot change reviewed criteria through status history or omit prior scope acceptance',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Agreed checks complete.'});
 const hidden=D.clone(f.p);hidden.actions[0].acceptanceCriteria='Completely different unchecked behavior.';hidden.actionDecisions.at(-1).after.acceptanceCriteria=hidden.actions[0].acceptanceCriteria;assert.throws(()=>reopen(hidden),/progress report/);
 const missing=D.clone(f.p);missing.actionDecisions.shift();assert.throws(()=>reopen(missing),/history is missing/);
 const acceptance=D.clone(f.p);acceptance.actionDecisions[0].after.acceptanceCriteria='Unreviewed changed scope.';assert.throws(()=>reopen(acceptance),/scope acceptance/);
});
test('imports reject invented proposal bases and acknowledgment revisions with no recorded scope',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.proposeActionChange(f.p,action.id,{ownerId:f.dev},'Reassignment.');const bad=D.clone(f.p);bad.actionChanges[0].base.revision=999;bad.actionChanges[0].base.statusRevision=999;
 bad.acknowledgments.push({id:D.uid(),targetType:'action',actionId:action.id,actionRevision:999,behaviorId:action.behaviorId,behaviorRevision:action.behaviorRevision,memberId:f.qa,note:'Invented prior scope.',at:new Date().toISOString(),selfReported:true});assert.throws(()=>reopen(bad),/proposal base/);
 const proposed=fixture(),{action:draft}=work(proposed);draft.revision=999;draft.statusRevision=999;assert.throws(()=>reopen(proposed.p),/recorded history/);
});
test('imports reject fabricated baseline progress and clearing a stale completion through scope history',()=>{
 const f=fixture(),{action}=work(f);D.acceptAction(f.p,action.id,{reviewerId:f.reviewer});D.saveVersion(f.p,'Tasks included',{includeActions:true});const baseline=D.clone(f.p);Object.assign(baseline.versions.at(-1).actions[0],{status:'completed',revision:999,statusRevision:999});assert.throws(()=>reopen(baseline),/recorded action revision/);
 D.updateActionStatus(f.p,action.id,'completed',{memberId:f.qa,note:'Original criteria complete.'});const change=D.proposeActionChange(f.p,action.id,{acceptanceCriteria:'New checks for this scope.'},'Expanded checks.');D.acceptActionChange(f.p,change.id,{reviewerId:f.reviewer});const forged=D.clone(f.p);forged.actions[0].statusRevision=2;forged.actionDecisions.at(-1).after.statusRevision=2;assert.throws(()=>reopen(forged),/scope revision/);
 const mismatch=D.clone(f.p);mismatch.actionChanges[0].proposed.acceptanceCriteria='Different from accepted decision.';assert.throws(()=>reopen(mismatch),/reviewed proposal/);
});
