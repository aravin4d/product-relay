# Product Relay — Phase 2 validation and usefulness gates

**4 October 2026. Phase 2 code checkpoint built; every new gate remains not run. Functional testing was explicitly deferred to the next session.**

Read with [the product plan](PHASE_2_PLAN.md), [all 138 feedback entries](PHASE_2_FEEDBACK_COVERAGE.md) and [the expanded 91-item backlog](PHASE_2_BACKLOG.csv). V01–V18 below are referenced by backlog and feedback rows. The 150 Node, 13 storage-browser and 6 document-worker checks reported for 0.4.0 are historical coverage. The later authored lifecycle failed despite them; Phase 2 must add that combined journey rather than merely repeat the old suite.

## How we will record results

For every applicable case record: build commit, project/schema/envelope version, fixture identity, browser/device or backend/provider configuration, actor/scope, preconditions, action, expected outcome, actual outcome, evidence and unresolved limitations. Remove secrets and real customer content from public artifacts.

Use explicit outcomes: **passed**, **failed**, **blocked by external access**, **fixture-tested only**, or **not run**. A fixture result is not a live-provider result. A simulated role exercise is not a real participant interview. A download command is not proof that the file was retained on disk.

Use focused tests for the changed invariants, then the relevant lifecycle at package boundaries. Repeat broad checks when a migration, persistence/permission change, or failure justifies it. Avoid writing tests that merely restate visual implementation.

## V01 — authored history, normalization and tamper rejection

**Covers:** REL-001; W01 and every later persistence/history change.

1. Create a fresh project rather than loading the prepared demo. Add a source, a qualified rule, a baseline, role actions and a walkthrough comparison linked to the original rule.
2. Record an owner interpretation, create a proposal, approve a qualified change and retain the earlier baseline. Confirm affected work enters review and an independent scope remains applicable.
3. Export/import repeatedly, with reordered object properties in otherwise identical supported records. Compare exact structured values and stable identities; array order remains significant where the domain defines an ordered sequence.
4. Exercise encrypted recovery reload, exported-file opening, sharing-round preparation, returned-file merge, both parent inspections and the merged file reopening. Repeat at least three complete save/reopen cycles and two sharing cycles.
5. Mutate one linked source revision, evidence quote, original rule identity, action revision, ancestry hash or referenced approval. Each malformed linked history must reject before committing state. A valid reordered object must pass.
6. Run normalization twice; compare normalized structured values and validate all linked references after each pass. Preserve diagnostics identifying the actual invalid path rather than exposing document bodies.

**Gate:** valid authored journeys pass; normalization is idempotent; all invalid cases reject atomically. No repair bypasses history checks or silently drops a record. Reopening the reviewed encrypted regression is a mandatory repair case.

## V02 — migration, recovery and portable coordination

**Covers:** REL-001, REL-005, REL-013.

- Keep schema 1–4 fixtures and new schema 5 fixtures; open/migrate/save/reopen/share each supported input. Preserve baselines, source locations, original approvals, historical role labels and full logical parent ancestry. Unsupported future versions reject clearly.
- Include all new record families in the cycle: roles/scope/edges, native work, cases/runs/defects, releases/deployments, guidance/incidents and asset references. Compare branches with linked revisions/results; inconsistent selections reject atomically instead of dropping new collections or choosing last-write-wins.
- Preserve the original file before upgrade/recovery. Simulate wrong passphrase, corrupted ciphertext, invalid plaintext history, disk/write denial, stale linked-file fingerprint and browser-cache conflict. None may destroy the last valid file/recovery entry.
- A save success requires serialization/reopen validation. Native writing and download fallback have separate expected results; verify a retained disk file when claiming that outcome.
- Share to two reviewers. Accept one return, detect its duplicate, keep another outstanding, preview a new round, and handle an older return using preserved validated ancestry or an explicit proposal review. No blind guessed merge.
- Two master copies with divergent edits must surface conflict. An offline reader sees **latest known**, not an assertion of absolute freshness.
- Compaction preserves logical parent IDs/hashes and every referenced revision. Missing deduplicated objects, changed hashes and orphaned archive links reject.
- Rotate a known passphrase with backup and compare content/history before and after. Old saved copies remain readable with the old secret. Drill owner departure with an authorized alternate custodian. If the optional recovery-key format is implemented, test legacy migration, separately retained recovery, missing key, tampered wrapping material and incorrect recovery key; losing all keys must never produce a fictional reset.
- Last-view comparison is pinned to the reader's actual known revision, persists encrypted, and identifies changes accurately after returned-file merge. An offline copy must not claim a live latest revision.

**Gate:** every supported portable lifecycle remains recoverable; incompatible input leaves current state unchanged; every expected return has an accountable state.

## V03 — review queues and decisions

**Covers:** REL-002, REL-003, REL-004, REL-010.

Create a pending requirement proposal, handbook proposal, action update, unresolved question, stale action and stale derived guidance. Under each matching project/person/role/release filter, compare item IDs and counts in Overview, inbox, navigation and detailed views. Reproduce the original case of five stale actions with no handbook proposals.

Check bulk preview, per-item rejection, deferral/rationale, partial approval and a base revision changing during review. Repeated submission must not duplicate decisions. My work and Team view must show explicit different ownership scopes. Opening an item must reach its actual next action.

Require a current-scope receipt where configured; change its owner and applicable scope. Preserve the earlier receipt as history while exposing the new acknowledgment gap. A prior owner's receipt, old-scope receipt or task completion cannot clear that gap. Cases without a configured receipt obligation do not generate artificial blockers.

**Gate:** no pending requirement is omitted, counts agree for the same scope, and partial or narrow empty states do not imply the whole project is caught up.

## V04 — roles, requirements and applicability

**Covers:** REL-004, REL-010, REL-012; BA/Product capabilities.

Test behavior, constraint and NFR types; goals and acceptance measures; exclusions and decision-table combinations; evidence and approval history. Conflicting conditions become visible questions. Role renaming/removal must not orphan owned work or change past receipts. BA has a distinct seeded role.

Test requirement parents/groups and linked exceptions, rejecting hierarchy cycles. Inheritance is explicit and reviewed; child creation does not inherit approval automatically. Link requirements to reviewed component/service/API/code references, compatibility constraints, flags and migrations, preserving owners and unknown impact. NFR templates retain measurable units/thresholds or an explicit unknown rather than a made-up acceptance value.

Migrate legacy free-text scope without inventing release identities. Test unknown, general, release-specific, environment-specific and audience-limited applicability. An approved future rule is not a deployed rule. Choose an explicit scope or expose ambiguity before using it.

Conflicting overlapping approved scopes require a decision; recency or apparent specificity is not automatic authority. Requirements, retrieval, impact, evidence and guidance must use the same scope-matching contract.

**Gate:** identities/history survive migration; required qualifiers remain intact; unknown scope remains unknown.

## V05 — retrieval and scoped answers

**Covers:** REL-007, REL-012, REL-014.

Maintain a labeled development set and frozen holdout covering:

| Case | Expected answer behavior |
| --- | --- |
| “Is it safe to reset a handoff?” | Retrieve reviewed sharing-round context or ask the relevant clarification. |
| Ordinary versus fraud cancellation | Preserve the distinct condition and exclusion. |
| “Does ordinary cancellation immediately revoke access?” | Do not accept the fraud-only rule as a general answer. |
| Historical R1 versus agreed future R2 | Use only the selected applicable baseline/release, with exact citations. |
| Production versus staging / partial customer rollout | Do not transfer deployment assumptions between scopes. |
| New transcript conflicts with approved PRD | Expose the pending disagreement; no newest-source-wins rule. |
| Raw document exploration | Label source statements as source content, not approved agreement. |
| Unsupported rollback or missing deployment | State missing evidence; do not infer a safe procedure. |
| Another project / inaccessible source | Exclude it from retrieval, counts and explanation. |
| Source or agreement changes after retrieval | Invalidate affected answer/candidate cache before acceptance. |

Initial evaluation target: at least **90% useful applicable retrieval** on the labeled holdout, **all critical scope/exclusion cases correct**, and **zero observed cross-project/access leaks or unsupported assertions presented as approved facts** in the critical suite. Report numerator/denominator and missed cases. A finite zero-failure test is not a guarantee of perfect future behavior.

## V06 — graph impact and change rehearsal

**Covers:** REL-004, REL-009.

Create scoped paths from the fraud rule to a service/work item, test case, Support article and Operations runbook. Include a cycle, an unrelated ordinary path, a low-confidence suggested edge, a missing link, and a deleted/inaccessible endpoint where relevant.

Rehearse a change; confirm zero mutation of approved records, work, runs and baselines. Show every impact path, edge origin and uncertainty. Approve only after base recheck. A changed base invalidates the scenario rather than silently adapting it.

Review a same-meaning wording change and a real change with similar words. Carry forward only justified applicability for unchanged scope. The original result/run stays immutable; no synthetic new pass appears. Changing audience/ownership alone must not accidentally claim the business outcome changed.

**Gate:** recorded indirect effects appear with reasons; cycles remain bounded; unknown coverage is explicit; unaffected scope is preserved only with justified review.

For regression selection, show included and excluded cases/charters, their dependency paths/risk basis, reviewer and scope. Excluding an unknown path must remain a reviewed risk, not a claim of verified safety. Cross-project paths use only authorized known endpoints; hidden project details and counts cannot leak through a graph edge.

## V07 — work, cases, results and evidence

**Covers:** REL-008, REL-011; QA/Development.

Create relevant-role work, concrete case conditions/exceptions, NFR measures, exploratory charters, manual runs and a defect. Check exact case/requirement revision references and release/environment/build context. Unassigned, not-run, blocked, failed, passed and stale-applicability states remain separate.

Try a completion with no run, a URL-only artifact, a self-reported pass, an imported report and an independently retrieved run. The origin and supported coverage must differ. An unrelated successful CI job cannot imply all requirements were verified.

Import bounded report fixtures twice; recognize duplicates. Include unknown cases, ambiguous case names, incomplete/skipped results, malformed/oversized markup and stale builds. Do not execute imported code or resolve untrusted external entities/network locations. Mapping choices are reviewed and retained.

Compare the evidence matrix with its underlying requirement/case/run records for each release/environment. All missing/blocked/failed/stale/current/exception states must explain their basis. Reusing a reviewed edge-case/NFR template preserves concrete expected outcomes and qualifiers, without selecting every role by default.

For connected execution, select a configured test-only workflow and preview the exact permitted ref/inputs/case selection. Check denied authority, wrong build, cancellation, provider outage, dispatch timeout/ambiguous acceptance, duplicate command and actual retrieved result. Reconcile a potentially accepted remote request before retrying; dispatch acknowledgment never implies test success. No deploy/production-control workflow is silently invoked by this feature.

**Gate:** each coverage claim traces to actual supporting case/result/scope and evidence origin. Historical failures are never rewritten; retries create new results. Unmapped results cannot inflate coverage.

## V08 — release, Support, Operations and learning loop

**Covers:** REL-008, REL-009, REL-012 and whole-lifecycle additions.

Build a candidate release with one failed critical check, one stale run, missing Support guidance, a missing rollback check and an accepted non-critical exception. Check that each remains visible with owner/reason despite unrelated successful work.

Approve release intent; verify it does not create a deployment record. Add a reported or retrieved deployment with build/environment/flag/audience; origin remains visible. Support answers use the actual selected scope, and Operations runbooks identify missing evidence rather than asserting execution.

Record an incident against that deployment. Triage an observation into a hypothesis/question/defect and proposed requirement change. Review resulting regression and runbook work. Preserve the observation, investigation, owner decisions and earlier agreement separately.

Add a supplied deployment manifest, intended flag configuration and observed rollout state that disagree. The view must expose that discrepancy. Monitoring links, actual observations, rollback thresholds and executed validation remain distinct. Check a known issue/workaround against the customer's scope, expiration/review date and escalation owner; stale/unapproved advice cannot become a customer-safe answer.

**Gate:** one complete agreement → work → evidence → deployment → incident → reviewed improvement chain is inspectable. A production symptom alone does not establish root cause or approve a new rule.

## V09 — sanitized exports and identity truth

**Covers:** REL-006.

Construct a project with internal-only source text, a sensitive earlier revision, private incident details, hidden fields, attachments and quotes that contain confidential neighboring text. Export a permitted reading pack/customer artifact and inspect the entire artifact, including metadata, encoded payloads, embedded archives, attachments and citation excerpts.

Try opening that derivative as a full merge parent; reject or route to its explicit supported proposal workflow. Full portable file approvals remain labeled self-reported. Revocation messages describe future server access accurately and make no claim to erase earlier exports.

**Gate:** excluded data is physically absent; no hidden complete project accompanies a filtered UI; derivative lineage/type is explicit.

## V10 — accessibility, ownership views and interaction

**Covers:** REL-010, REL-015.

Use keyboard-only navigation and an actual screen-reader session for create/open, intake preview, proposal review, My work, run recording, conflict review and save/lock. Verify visible focus, sensible order, dialog focus containment/return, control labels after population, referenced hints/errors, status announcements and preservation of unsaved edits on updates.

Check narrow/mobile layouts, zoom, empty/error states, long source passages and expanded evidence. Stable selectors assist automation but do not substitute for usable names. Record supported browsers/assistive configurations and known gaps; do not claim certification from selector tests.

**Gate:** all critical lifecycle actions are operable without a pointer, current focus and edits survive supported updates, and displayed ownership mode is unambiguous.

## V11 — intake, original material and reduced repetition

**Covers:** REL-004, REL-011, REL-013.

Use ordinary PDF/DOCX/text plus representative table, CSV and timestamped transcript fixtures. Test duplicate/revised documents, incomplete extraction, malicious markup, external resource references, cancellation, oversized inputs and original-retention choices. Exact location claims are removed or qualified when a human edits extraction or a parser cannot preserve them.

Where OCR/audio is implemented, use bounded scanned/recorded material and visible uncertainty; assess actual output and selected processing path. Do not silently send content remotely. Originals retained by choice must reopen byte-identically; excluded originals must not be described as embedded.

Count repeated entries from intake to rule, work and brief. One reviewed condition should be referenced by the derived records rather than retyped. Bulk review remains evidence-led; selecting all candidates is not automatic approval.

Use the multi-source picker to cite two exact revisions with conflicting authority; add/replace/remove a passage and preserve the earlier approved evidence. Roundtrip structured handbook blocks and editable overrides. Test sanitized pasted markup, malicious links and formatting focus preservation; rich authoring must not introduce executable HTML or hide a fact's original basis.

**Gate:** source fidelity limits are visible, old citations stay resolvable, failed import preserves current state, and the same fact is not maintained independently across role narratives.

## V12 — actual AI behavior and evaluation

**Covers:** REL-014 and AI-assisted use of REL-007/009/011/012.

First run contract/runtime fixtures. Separately configure a real protected gateway/provider and exercise valid, missing/expired authentication, denied allowance, timeout, malformed output, cancellation, changed input and provider outage. Inspect the built frontend and public artifacts for secrets. Confirm real allowance accounting and backend auth enforcement.

Begin with at least **60 labeled cases** divided into development and frozen holdout sets, with at least 30 holdout cases spanning conditions/exclusions, NFRs, conflicting authority, historical scope, unsupported facts and prompt-injection content. Expand when a failure reveals a new class. Keep task-specific metrics; do not combine unrelated failures into a flattering single accuracy score.

Required critical-suite outcomes: no silently lost exception/negation that changes agreement meaning, no wrong-project/baseline citation, no unsupported claim accepted as an approved fact, and no imported instruction changing authority/access/tool behavior. Quality gates apply to the resulting reviewed workflow as well as raw candidates; rejected/corrected outputs and reviewer effort are retained in the report.

Measure useful candidate rate, correction effort, no-answer correctness, latency and usage cost for actual configured models. Embeddings/provider alternatives are enabled only when they justify their added complexity on the same tasks. Human approval remains required even after good scores.

The second-provider adapter runs the same task/privacy/revision contract and holdout under its explicit configured choice. Report provider-specific results and blocked access separately. No error silently routes company content to an unselected provider.

**Gate:** real inference meets the labeled critical checks and failures preserve the manual workflow. Model identity, dataset size, rejected output and provider limits are reported. No universal model-superiority claim.

## V13 — capacity and performance

**Covers:** REL-013.

Define a small representative project, a medium long-running project and a near-supported-limit project, including historical revisions, graph edges, bases, parent archives and selected assets. Choose actual supported tier sizes after baseline measurement; do not pretend all devices have the same capacity.

Measure encrypted save/reopen, retrieval, graph impact, merge preview, UI responsiveness and memory on declared devices/browsers. Set published budgets from those measurements before expanding limits. Preflight oversize operations and keep the previous usable state. Lossless deduplication must measurably reduce duplicate storage while preserving hashes/parents/references; archive/restore includes a recovery drill.

**Gate:** supported tiers meet the published budgets, unsupported tiers warn safely, and no storage reduction comes from undisclosed history loss.

## V14 — shared authorization, concurrency and offline replay

**Covers:** REL-005, REL-006 and shared-mode architecture.

Use at least two organizations/projects and multiple authenticated actors with different capabilities. Test every path: direct record read/write, relationships, source/assets, search/retrieval, counts, AI/job input/output, exports and portfolio summaries. Include ID guessing, cross-project references, revoked membership and stale tokens. Browser filters are not the enforcement layer.

Execute genuinely concurrent transactions from separate sessions. Competing same-record writes require expected-version conflict handling; independent valid writes survive; record+journal changes are atomic. Replay a command ID and retry after a client timeout without duplicate approvals/results.

Queue an offline draft, change its server base, revoke its author and reconnect. Stale approvals must enter review; denied writes fail closed. A crashed/retried job must recheck current input/access and produce at most one accepted effect. Inspect service credentials only in secret configuration, never the client.

Validate authenticated receipts/decisions against capability and exact current revision; ordinary users cannot edit earlier journal entries. The UI must distinguish them from portable self-reported receipts. Test in-app subscriptions/digests for deduplication, scope/ownership, quiet settings, access revocation and permission-safe summaries. A notification event refreshes context; it does not silently resolve conflicting edits.

**Gate:** the denial matrix and multi-session contention tests pass on the actual backend. PGlite/fixture success is not enough to claim production shared-mode concurrency.

## V15 — operations, retention and company administration

**Covers:** REL-006, REL-013, REL-014.

Name project and backup owners. Test ownership transfer, organization/project membership change, retention/export choices, provider/job spending caps, cancellation and operational error reporting. Restore a backup into an isolated environment and verify identities, evidence and ancestry before publishing restoration guidance.

Check logs for plaintext source bodies, customer text, passphrases, provider keys and unnecessary identity data. Record retained diagnostics and their expiry/access. Confirm that archival/deletion affects current references and indexes as designed. Document infrastructure/job/storage responsibility and account-dependent costs without promising a free unlimited service.

Crash a leased worker after a checkpoint and after an uncertain provider effect. Reclaim/resume safely; expired/cancelled/revoked work must not publish. Domain idempotency is tested separately from external execution/billing uncertainty. Health/job/connector/backup signals must reach their responsible operator without leaking confidential content.

For self-host packaging, configure a fresh isolated environment using the pinned supported stack and non-default secrets. Exercise HTTPS/Auth callback setup, policies/assets/jobs, encrypted export, backup restore, upgrade and rollback. Publish supported components and measured recovery objectives; self-host operation is not automatically equal to every managed-service feature.

**Gate:** recovery is demonstrated, responsible owners and limits are explicit, access changes work, and confidential payloads are absent from routine diagnostics.

## V16 — connector truth, ownership and safe writes

**Covers:** REL-004, REL-008, REL-013.

Each adapter passes contract fixtures for stable IDs, pagination, rate limits, retries, changed revision, permission denial, deletion/inaccessibility, duplicate events and unavailable artifacts. Then run a representative real tenant/repository journey and label that provider separately. No tenant access means **fixture-tested only**, not a shipped verified integration.

Tag app-generated outputs and confirm they do not recursively become new source material. A timeout cannot archive/delete an external record. Verified access loss invalidates restricted shared retrieval/cached-answer context. Open the concise reviewed change contract from a linked work item; correct scope and evidence must be preserved without a second manually maintained task status.

Read refresh creates source revisions/observations and reviewed candidates. External-owned fields refresh from the external tool; native contextual decisions remain independent. Verify no task status needs to be manually synchronized twice.

Where write-back is implemented: preview exact diff, check the user's action permission and external revision, persist outbox command identity, retry timeout, and prove no duplicate external side effect. A changed external base returns to review. An AI proposal, background job or webhook cannot authorize a write itself.

**Gate:** actual provider evidence is distinguished from supplied links/files; ownership avoids conflicting status masters; failed refresh/write leaves approved context coherent.

## V17 — real-team value and competitive workflow comparison

**Covers:** all review themes and differentiation hypotheses.

Start baseline measurement early. Recruit consenting actual participants representing the relevant Product, QA, Development, BA, Support and Operations functions. If one function is absent, report that gap rather than replacing its human feedback with a simulation.

Run one feature through original handoff, walkthrough, at least two meaningful changes, role handoff and a release/incident exercise. Compare matched tasks against the team's ordinary method, including onboarding, PM structuring, approvals, file sharing, corrections and integration administration. Collect actual feedback individually and then discuss contradictions as a team.

| Measure | Collection / initial target |
| --- | --- |
| Total repeated coordination effort | Time across all roles, including PM; aim for at least 20% reduction on matched recurring tasks after onboarding. |
| Agreement understanding | Time and correctness for scope/exception questions; preserve original evidence. |
| Duplicate entry / clarification | Count repeated facts and clarification requests, including those created by Relay. |
| Change handling | Correctly identified required work and unnecessary rechecks; no savings from omitted obligations. |
| Evidence trust | Correct case/run/build applicability decisions and explicit unknowns. |
| Recovery / handoff | Successful retained-file reopen/merge and clarity of latest-known context. |
| Reviewer burden | Corrections, rejected candidates, blocked actions and work shifted onto the PM. |
| Role/company feedback | Pain removed, pain added, remaining gaps and willingness to use again. |

These are pilot targets, not promised outcomes. Retain sample sizes, task definitions and failures; a short pilot cannot prove reduced escaped defects or general ROI. If total savings are absent or work is merely shifted to the PM, improve intake/ownership before enlarging the feature set.

For competitor benchmarking, use the same non-sensitive scenario and outcomes when licensed access is available. Separate actual observations from official-document capability comparisons. Report where Relay loses as well as wins; do not infer absence from an undocumented feature.

**Gate:** a written real-participant report explains total benefit/cost and unresolved pain. Proposed competitive advantages are supported by the measured journey, or remain labeled hypotheses.

## V18 — end-to-end checkpoint and completion checklist

At the reliable-foundation checkpoint run V01–V03 plus changed identity/form checks. At the portable checkpoint run the complete manual journey V01–V11 and applicable V13; demonstrate every relevant role. At the connected checkpoint add actual V12 and V14–V16, portfolio boundaries, supported-device checks and the real pilot V17.

Before calling the full Phase 2 complete:

- [ ] Every REL-001 through REL-015 finding has its corresponding implementation and acceptance result, or an explicit approved scope decision.
- [ ] Every FB-001 through FB-138 entry has a recorded outcome; existing capabilities have regression results and mode boundaries have truthful labels/controls.
- [ ] Every backlog row has an honest result, with no blocked real-provider check represented as passing.
- [ ] No known critical file/history corruption, unauthorized access, fabricated proof or incompatible-scope answer remains.
- [ ] Earlier baselines, old results and source locations remain inspectable after changes/migrations/compaction.
- [ ] Manual operation works without an AI/provider account.
- [ ] Relevant external integrations and real AI have independent evidence.
- [ ] Browser/accessibility/performance limits and recovery procedures are published.
- [ ] Real team effort and company feedback are reported, including disadvantages and unproven claims.

Plan status today: **all gates pending**. Phase 2 implementation starts with W01; the deployed 0.4.0 defects have not been repaired by these documents.
