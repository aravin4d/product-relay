// Fictional executable PRD/SOP/walkthrough/change evidence. No AI output is simulated.
import * as D from '../../src/domain.js';
export const documents = {
  prd:'Orbit PRD, release 1. Workspace owners may cancel ordinary subscriptions. For ordinary cancellations, access remains active until the current paid period ends. Fraud-triggered cancellations are excluded from this ordinary cancellation rule.',
  sop:'Fraud SOP. Fraud operations must revoke access immediately for fraud-triggered cancellations. The intended product release for this behavior has not been confirmed.',
  walkthrough:'Walkthrough decision by Maya, Product owner: the fraud-triggered cancellation exception is proposed for release 2. Ordinary cancellations continue access until the paid period ends. Rollback ownership remains unresolved.',
  revisedPrd:'Orbit PRD, release 2. For confirmed fraud-triggered cancellations only, fraud operations revoke access immediately and suppress the next renewal. Ordinary cancellations retain access until the current paid period ends.'
};
export function createHandoffFixture() {
  const project=D.createProject('Orbit qualified handoff','Fictional product evidence and scope-preserving review scenario.');
  for(const [name,role] of [['Maya','Product'],['Alex','QA'],['Sam','Development'],['Priya','Operations'],['Jordan','Support']])D.addMember(project,name,role);
  const prd=D.addSource(project,'Orbit PRD · release 1',documents.prd),sop=D.addSource(project,'Fraud SOP',documents.sop,'SOP');
  const ordinary=D.addBehavior(project,{title:'Ordinary cancellation',actor:'Workspace owner',condition:'Cancellation is ordinary and is not triggered by fraud',outcome:'Access remains active until the current paid period ends',applicability:'Release 1 onward · ordinary cancellations only',owner:'Maya',audiences:['Everyone'],sourceId:prd.id,quote:'For ordinary cancellations, access remains active until the current paid period ends.'});
  D.approveBehavior(project,ordinary.id);
  const fraud=D.addBehavior(project,{title:'Fraud cancellation',actor:'Fraud operations',condition:'Cancellation is triggered by confirmed fraud',outcome:'Revoke access immediately',applicability:'Proposed fraud exception · target release not confirmed',owner:'Maya',audiences:['Product','Development','QA','Operations','Support'],sourceId:sop.id,quote:'Fraud operations must revoke access immediately for fraud-triggered cancellations.'});
  const releaseQuestion=D.addQuestion(project,'Which release includes the fraud exception?','Product','Maya');
  const rollbackQuestion=D.addQuestion(project,'Who owns rollback for the fraud exception?','Operations','Priya');
  const baseline=D.saveVersion(project,'Release 1 ordinary cancellation');
  return {project,refs:{prd:prd.id,sop:sop.id,ordinary:ordinary.id,fraud:fraud.id,releaseQuestion:releaseQuestion.id,rollbackQuestion:rollbackQuestion.id,baseline:baseline.id},expected:{initialApprovedRules:1,ordinaryOutcome:ordinary.outcome,fraudTargetRelease:'Release 2',unresolvedQuestion:rollbackQuestion.title}};
}
export function recordWalkthrough(fixture) {
  const {project,refs}=fixture;
  const source=D.addSource(project,'First walkthrough',documents.walkthrough,'Walkthrough');
  D.editBehavior(project,refs.fraud,{applicability:'Release 2 · confirmed fraud-triggered cancellations only',sourceId:source.id,quote:'the fraud-triggered cancellation exception is proposed for release 2.'});
  D.approveBehavior(project,refs.fraud,'Maya approved the fraud-only scope for release 2 after reviewing both the PRD and SOP.');
  D.resolveQuestion(project,refs.releaseQuestion,'Maya confirmed release 2 for the fraud-only exception.');
  D.saveVersion(project,'Walkthrough agreement · release 2');
  return source;
}
export function proposeRelease2Change(fixture) {
  const {project,refs}=fixture;
  D.reviseSource(project,refs.prd,documents.revisedPrd);
  return D.proposeBehaviorChange(project,refs.fraud,{outcome:'Revoke access immediately and suppress the next renewal',sourceId:refs.prd,quote:'For confirmed fraud-triggered cancellations only, fraud operations revoke access immediately and suppress the next renewal.'},'Release 2 PRD adds renewal suppression for the fraud exception.');
}
