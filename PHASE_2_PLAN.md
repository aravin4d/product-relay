# Product Relay — Phase 2 product and engineering plan

**Planning baseline: 4 October 2026. Phase 2 implementation checkpoint now built; functional validation remains deferred.**

This document remains the full intended architecture and acceptance direction. Read [PHASE_2_BUILD.md](PHASE_2_BUILD.md) for actual code coverage and explicit unfinished capabilities. The 91-item backlog and 138-point register now contain checkpoint status and remaining work for every item. Planned behavior below is not automatically implemented or verified merely because it appears in this plan.

The live site remains the earlier 0.4.0 deployment. New code is saved on `codex/phase2-delivery-build`; the user explicitly deferred testing to the next session. Preserve original files and begin validation with the authored-history failure before deploying this checkpoint.

**Completeness revision:** [every earlier feedback point and response](PHASE_2_FEEDBACK_COVERAGE.md) now lists 138 entries, including the six-role review and earlier section-review/architecture suggestions. The backlog has expanded from 69 to **91 engineering items**, with **22 newly explicit items**. Multiple related points may share a fix; these counts do not mean 138 unique features. Read the coverage register first when checking whether a particular suggestion was retained.

Execution detail: [Phase 2 backlog](PHASE_2_BACKLOG.csv). Filterable feedback mapping: [coverage CSV](PHASE_2_FEEDBACK_COVERAGE.csv). Verification and pilot gates: [Phase 2 validation](PHASE_2_VALIDATION.md). Original evidence: [archived six-role review](docs/reviews/2026-10-04/TEAM_REVIEW.md). Current implementation: [build status](BUILD_STATUS.md).

## 1. The decision in one page

Build **one delivery context system**, from original product material to production learning. Every team should be able to answer:

1. What was agreed, for whom, and for which release/environment?
2. What changed, why, and which other things might be affected?
3. What work does my team actually need to do?
4. What evidence shows that the applicable behavior was checked?
5. What was really deployed, and what should Support and Operations say or do?
6. What did production teach us that needs a new product decision?

Keep the GitHub Pages website and account-free encrypted project file. Add an optional shared service using the existing Supabase direction when teams need authenticated access, collaboration, connectors, and background jobs. Both modes use the same domain records and review rules.

The product will include lightweight native work planning, test cases/manual runs, release obligations, support guidance, incidents, and team views. External tools enrich those modules; a team should not need Jira, Qase, or Confluence just to complete the basic journey. Teams already using those tools can keep them as the owner of their work/results and link their context into Relay.

The proposed advantage is **an explainable connection between agreement, change, role obligations, evidence, and actual release behavior**. This is a product hypothesis to prove, not an assertion that competitors lack traceability or AI.

### Three delivery checkpoints

| Checkpoint | Outcome | Included packages |
| --- | --- | --- |
| Reliable foundation | Valid existing projects reopen/share safely; every actionable review appears consistently. | W01–W02 |
| Complete portable journey | A team can start from documents, agree scope, plan work, check it, review a change, release, and learn from an incident using a portable file. | W03–W09 |
| Connected team product | Evaluated AI, authenticated collaboration, verified integrations, and permission-aware portfolio views extend the same journey. | W10–W14 |

No paid service is required for the first two checkpoints. Connected-mode and live AI acceptance require real configured accounts; fixture-tested adapters will be labeled accordingly.

## 2. Evidence behind the plan

The review exercised the deployed app using Product Relay itself as an internal pilot: actual public product documents, authored rules/actions, a walkthrough, an approved simulated future change, and a sharing/recovery attempt. Six perspectives were simulated: Product lead, QA lead, Development lead, BA, Support, and Operations. These are observations and role assessments, not customer interviews or evidence of company-wide savings.

Three defects were confirmed:

- **REL-001:** newly authored walkthrough history passed an initial import but failed repeated import, sharing preparation, and encrypted recovery reopening with “Invalid original rule comparison.” Structured values were equal while JSON property order differed.
- **REL-002:** a pending rule proposal existed, but Change review said there were no proposals because it covered handbook proposals only.
- **REL-003:** Overview said the review queue was empty while five delivery actions needed review.

The remaining twelve findings cover maintenance burden, file coordination, identity/access limits, retrieval, evidence links, indirect impact, roles, generic work, release scope, capacity, unverified live AI, and form/accessibility checks. All fifteen are mapped below and in the backlog. An observed limitation is not automatically a reproducible defect; the validation plan distinguishes them.

## 3. A complete example journey

Use a subscription product with ordinary cancellation and a fraud exception. The following is an acceptance story, not a claim about a customer's system.

| Stage | What a person supplies | What Relay does | Human decision / retained context |
| --- | --- | --- | --- |
| Before walkthrough | PRD, SOP, product goal, initial release, team members. | Previews extraction; suggests requirements, exceptions, NFRs, questions and glossary terms; builds a draft coverage view. Manual entry also works. | Source authority, scope, and approval remain explicit. Unsupported interpretations remain questions. |
| First walkthrough | Transcript/notes and owner clarifications. | Compares statements with exact original revisions; surfaces disagreements; creates decision candidates. | Owner resolves ambiguity; approval creates a new revision, not a rewritten history. |
| Delivery planning | Relevant roles, work owners, dependencies, acceptance criteria. | Creates linked work, test scenarios, support/runbook obligations from the same agreement. | Each affected team reviews its obligations; unknown impact stays visible. |
| Implementation / testing | Work updates, PR/build links, manual or imported test runs. | Associates evidence with exact requirement, test, release and environment revisions. | A URL is a reference; a retrieved run has separate provenance. Completion does not create a pass. |
| Mid-project change | Fraud cancellation now needs an operator review step. | Rehearses impact before approval, following recorded dependency paths. Shows proposed work and which checks might need repeating. | Owner approves the decision and relevant teams confirm the impact. Ordinary cancellation evidence is not automatically discarded. |
| Release | Candidate build, environment, deployment and outstanding obligations. | Shows unresolved blockers, exceptions and current proof; builds role handoffs. | Named release decision is separate from actual deployment. Portable decisions are self-reported. |
| Support / Operations | A ticket or incident reports behavior inconsistent with the deployed agreement. | Links the observation to deployed scope, proposes a clarification/defect, and prepares corresponding regression/runbook work. | A team investigates cause; observations do not automatically become product truth. |
| Next project cycle | Another release, returned project file, or shared update. | Preserves earlier baselines; identifies changed context; validates ancestry or shared version before applying edits. | No stale approval is silently reused. |

PRD, SOP, transcript, and change notes are inputs, not four competing sources of truth. Reviewed requirement revisions and their decisions are the agreement. Work, evidence, deployment observations, and guidance have their own states and links to it.

## 4. What each role gets

| Role | Daily value | Native capabilities to add | How we avoid moving work onto the PM |
| --- | --- | --- | --- |
| Product lead | See unclear scope, unresolved decisions, delivery consequences and business goals together. | Objectives/success measures, unified decisions, intake review, change rehearsal, release decisions. | Enter a fact once; derived handoffs reference it. Owners review their own work. |
| QA lead / manager | See what needs testing, what evidence applies, and what changed without restarting all coverage. | Test registry, conditions/exceptions, exploratory charters, manual runs, imported results, defects, NFR obligations. | Bulk selection with per-item scope; existing test tools can own execution. No second manual status register. |
| Development lead | Understand the reason and scope behind implementation and linked dependencies. | Lightweight work board, service/API/flag/migration links, PR/build references, affected work and acceptance criteria. | External issue status remains owned externally when configured; internal work is available otherwise. |
| BA | Preserve vocabulary, decisions, exceptions and cross-requirement consistency. | Actual BA role, configurable roles, NFR/constraint types, decision tables, glossary and dependency review. | Reusable structures and one approval path replace repeated narrative copying. |
| Support | Answer for the customer's deployed release with safe, cited guidance. | Release/audience filters, approved FAQs, incident links and physically sanitized customer exports. | Guidance derives from agreement references; stale guidance enters a review inbox. |
| Operations | Know rollout assumptions, verification, rollback obligations and deployed scope. | Environment/release registry, deployment records, runbook obligations, incidents and recovery checks. | CI/deployment imports reduce duplicate evidence entry; exceptions have owners. |
| Delivery / company leadership | Understand unresolved delivery risk and whether the tool reduces overall effort. | Permission-aware portfolio, evidence gaps, ownership/backup policies and pilot metrics. | Count unresolved reasons and total team effort; do not manufacture a readiness score. |

Individual views explicitly distinguish **My work** from **Team view**. Selecting a person is not authentication in portable mode.

## 5. How we compare and what must be better

Official product documentation reviewed on 4 October 2026 supports the capabilities below. This is a feature/workflow comparison, not a hands-on benchmark of licensed competitors. It excludes unverified pricing and claims of missing features.

| Existing tool family | Established strength | What Relay should borrow | Our proposed advantage to demonstrate | Current Relay disadvantage |
| --- | --- | --- | --- | --- |
| Jama Connect | Requirement relationships, downstream change impact and requirements-to-test traceability; AI assists requirement work. | Reviewed relationships, suspect links, baselines and requirement quality. | A low-setup journey that also produces coherent Support/Operations handoffs and production feedback. | Much less mature requirements/review/governance depth; current save/reopen defect. |
| Qase | Test management and a requirements traceability matrix connecting requirements, cases and results. | First-class test/run identities and coverage states. | Explain why a particular changed agreement invalidates particular evidence across roles. | No mature test execution platform, broad runner ecosystem, or proven test operations. |
| Jira / Confluence / Rovo | Team work, documentation, search and agent-assisted actions across a large ecosystem. | Linked work/doc ownership, permissions and reviewed automation. | One explicitly versioned agreement shared by all role handoffs, with an inspectable impact/evidence chain. | No comparable connector ecosystem, collaborative maturity, or enterprise administration yet. |
| Azure DevOps | End-to-end work/code/build/test/deployment traceability. | Build-specific proof and actual deployment linkage. | Explain product meaning and team obligations before and after that technical delivery chain. | Not a replacement for CI, repositories, or mature test/build management. |
| ClickUp / Brain / Super Agents | Broad work management and agents with contextual tools/actions. | Useful intake and automation of repetitive coordination. | Require evidence, applicable scope and approval history for each proposed change/action. | Far fewer scheduling, collaborative, automation and management features. |
| Google's source-grounded notebook tools | Understanding and answering from supplied sources. | Clear citations and simple source-based exploration. | Move from understanding to reviewed agreement, scoped work, real evidence and production learning. | Narrower input support and an unvalidated live AI experience. |
| Slite | Knowledge verification, source-based answers and reviewed maintenance of knowledge. | Content owners, review dates and stale-knowledge handling. | Connect knowledge freshness to exact delivery/test/deployment obligations and production learning. | Far less mature collaborative knowledge maintenance and adoption tooling. |

Sources: [Jama features](https://www.jamasoftware.com/platform/jama-connect/features/), [Jama traceability](https://help.jamasoftware.com/ah/en/getting-to-know-jama-connect-features/traceability-from-requirements-to-test.html), [Qase traceability matrix](https://docs.qase.io/en/articles/9123660-requirements-traceability-matrix), [Rovo agents](https://support.atlassian.com/rovo/docs/agents/), [Azure end-to-end traceability](https://learn.microsoft.com/en-us/azure/devops/cross-service/end-to-end-traceability?view=azure-devops), [ClickUp Super Agents](https://help.clickup.com/hc/en-us/articles/31010910371991-What-are-Super-Agents), [Google source-based notebook guidance](https://support.google.com/gemininotebook/answer/16215270?hl=en), [Slite verification guidance](https://slite.com/help/F9erHftuXmOHY0), [Slite knowledge workflow](https://slite.com/solutions/knowledge-base).

### Six advantages worth building

1. **Change rehearsal.** Compare alternatives before approving them. Show affected records, roles, tests, guidance and release obligations with the dependency path and assumptions. An absence of recorded links means unknown impact, not “safe.”
2. **Agreement linked to proof.** A requirement leads to scoped cases/runs/builds/deployments, with evidence origin and staleness explained. No AI or checkbox converts an unverified claim into proof.
3. **One decision, consistent team handoffs.** Product, QA, Development, BA, Support and Operations receive different views of the same approved facts. Proposed derived changes are reviewed together; independent edits cannot silently contradict their basis.
4. **Product context as actually deployed.** Ask about a particular release/environment/customer audience, preserving planned, agreed, released and deployed states separately.
5. **Production learning closes the loop.** A support report or incident can generate a reviewed clarification, defect, regression scenario and runbook update linked back to the affected agreement.
6. **Explainable delivery obligations.** Show what still needs deciding, implementing, checking or accepting for a release, including NFRs, documentation, rollout and rollback. Every exception has an owner and rationale.

A seventh expansion, portfolio views, summarizes this same information across authorized projects. It is useful after project-level semantics and permission boundaries work; it must not turn incomparable projects into a misleading league table.

The benchmark is the entire example journey: accurate scope, fewer repeated entries, fewer unnecessary checks, faster role-specific understanding and recoverable history. “Has AI” or “has more screens” is not an advantage.

## 6. Fix and improvement for every review finding

### REL-001 — preserve valid history through every save/reopen/share cycle (P0)

**Cause and location.** `src/reconciliation.js` compares rule snapshots using `JSON.stringify`. `src/behaviors.js` normalizes behavior records with a different object property order. A newly authored reconciliation can therefore contain equivalent original snapshots that compare unequal after repeated normalization. Encrypted storage and sharing pass through those paths.

**Implementation.** Introduce one canonical structured-value comparison for supported project data: object key order is irrelevant; array order, exact values and identities remain significant. Reject unsupported values rather than silently coercing them. Audit snapshot/branch comparisons in reconciliation, behaviors, actions, domain and knowledge. Normalize both active and referenced snapshots through compatible cleaners. Require normalization to be idempotent and linked history to remain valid after normalization. Validate incoming data before cleaning and validate the cleaned result; do not drop malformed history to obtain a pass.

**Recovery.** Preserve the affected encrypted original. Attempt normal decryption followed by the corrected validation/migration path; show an actionable error if it still fails. Keep a downloadable backup before overwriting and offer a separate recovery copy. This repair must never guess missing identities, evidence, approvals or ancestry. Before a successful-save message, validate the serialized result through reopening; distinguish browser recovery from an exported disk file. Direct writing remains subject to browser capabilities and existing stale-file guards.

**Exit.** The authored regression plus repeated decrypt/import/share/merge/reopen journeys pass. Altered rule identities, quotes, revisions and incompatible histories still reject without damaging the current project. Existing schema 1–4 examples remain readable. No envelope change is needed for this repair.

### REL-002 / REL-003 — one review truth everywhere (P1)

Create a pure `attention` selector used by Overview, Change review, Delivery review and navigation counts. Every item has a stable ID, kind, affected record/revision, reason, responsible role/person, release scope and next action. Include requirement/handbook/task proposals, unresolved decisions/questions, stale work/evidence, and source/guidance review reasons. Keep proposed edits separate from approved records needing attention.

Counts are calculated from the same filtered item list as the detail screen. “Nothing pending in this view” must state the scope. Selecting a name, role, release or historical baseline must not change the meaning of the counters silently. Add grouped bulk decisions with a per-item preview, explicit decision authority and revision checks. New changes during review invalidate only affected selections. Record dismissals/deferments with reasons rather than treating them as resolved approvals.

**Exit.** A pending rule appears in Change review; the five stale actions appear in Overview; shared scope yields identical counts and item IDs. Each item opens its actual actionable record.

### REL-004 — reduce total team entry and review effort (P1)

Provide one guided intake: source preview → scope and vocabulary → candidate requirements/questions → owner review → relevant work/guidance. Use native templates without AI and reviewed AI suggestions when connected. Support batch acceptance only after per-item evidence, qualifiers and differences are available.

Store facts once in requirements/decisions. Derived handbook sections and role briefings reference approved revisions; narrative overrides retain their basis and enter review if that basis changes. Native work records and external references have explicit ownership. An imported external issue status is not manually maintained a second time. A change package groups the decision, affected work/tests/guidance and owners, while preserving separate approvals.

**Exit.** No repeated manual entry of the same condition/release outcome across rule, task and briefing. A real pilot measures all participants' effort, including the PM's structuring and file coordination.

### REL-005 — accountable portable coordination (P1)

Show project identity, master owner, sharing-round ID, base revision/content fingerprint, file creation time and last known master revision. Add an expected-return manifest with assignments and outstanding/received/merged/withdrawn states. Mark “latest known to this copy”; an offline file cannot know that a newer master exists.

Starting a new round shows outstanding returns and proposed carry-forward/archive decisions. Preserve earlier round context and accept an older return only when its recorded ancestry can be validated; otherwise offer a separate proposal review with original evidence, not a guessed merge. Duplicate returns are recognized by identity/content. Two PM copies do not become simultaneous masters merely because they have the same label.

**Exit.** PM can account for every requested return. Readers can see their base and changed-since-last-view context. No return is silently lost during round replacement. No distributed-lock or automatic-freshness claim is made.

### REL-006 — truthful identity and actual access control (P1)

Immediately label portable identities/approvals as self-reported and role views as filters. Add physically sanitized exports: allowlisted fields/records, no hidden full-project payload, citation excerpts reviewed for disclosure, excluded attachments and historical sensitive text checked too. Such exports are separate reading artifacts; they are not automatically merge-compatible full project files.

Shared mode adds authenticated users, organization/project membership, role capabilities and server authorization. Source visibility and answer retrieval follow the same policies as record access. Public provider/service keys never ship to the browser. Revocation blocks future server access; it cannot erase a recipient's earlier downloads. Portable signatures/authenticated sign-offs are a separate feature, not implied by selecting a name.

**Exit.** Unauthorized queries, mutations, searches, exports and storage access fail on the server. Sanitized exports cannot recover excluded data. Portable mode never displays an authenticated approval claim.

### REL-007 / REL-012 — answer in the right vocabulary and scope (P1/P2)

Create reviewed glossary aliases with project and optional release scope, starting with deterministic local retrieval. Add structured release, environment and audience filters. Historical baseline, currently agreed context and actual deployed scope are explicit choices. Migration keeps unknown legacy scope unknown; it does not invent releases from arbitrary prose.

Offer two clearly separate modes: **Agreed product answer** over approved applicable context and **Explore source material** over unapproved/raw passages. Both cite exact revisions. Source exploration never asserts that a source statement was approved. Conflicts, exclusions, unknown deployment and missing scope are shown or clarified before answering. Cache/index keys include project, revision, baseline, filters and access scope.

Evaluate synonyms, abbreviations, negative conditions, future releases, conflicting source authority and no-answer cases. Add semantic retrieval only if deterministic retrieval fails measured cases; in shared mode use access-filtered server indexes. Optional AI explains retrieved evidence rather than searching unrestricted project content. It must not silently fall back to another release.

Define scope matching once for requirements, queries, impact, tests and guidance. Start with explicit release/environment/audience identities and reviewed exclusions; represent general, unknown and not-applicable separately. When approved scopes overlap with conflicting outcomes, open a decision rather than inventing precedence from recency or apparent specificity. A record being visible is not proof that it applies to the selected customer or deployment.

**Exit.** The handoff-reset question retrieves the reviewed sharing concept or asks a useful clarification. A release-specific question never uses an inapplicable future rule. Answers cannot leak another project's or user's context.

### REL-008 / REL-011 — first-class work, tests and evidence (P1/P2)

Add lightweight native work items with owner, relevant roles, requirement references, dependencies, acceptance criteria, release and explicit state. Default role selection is empty or a clearly explained suggested selection requiring review; unselected roles do not prove no impact.

Add test cases and revisions, parameters/conditions, exceptions, expected outcomes, exploratory charters, suites, manual runs, per-case results and defects. Link results to exact case/requirement revisions, run/build, environment and timestamp. NFRs can have their own acceptance measures and test evidence. Defects connect an observed failure to affected behavior without presuming root cause.

Evidence states distinguish reference-only, self-reported, imported run, independently retrieved run and reviewer-accepted applicability. Imported artifacts retain source identity/hash and mapping choices; retrieved success does not establish requirement coverage unless linked cases and applicable conditions support it. Native actions remain separate from test results. Keep incompatible or old results as history; never edit a past failure into a pass.

Start with manual runs and bounded JUnit-style report import; show unmapped/ambiguous results explicitly. GitHub linking follows later. No arbitrary automation code executes inside the static website. Existing external work/test systems can own their status, while Relay owns contextual links and applicability decisions.

**Exit.** A lead can trace a requirement to the exact case, result, build and applicable release. No generic role task or linked URL alone appears as verified coverage. Duplicate imports do not create duplicate runs.

### REL-009 — indirect impact and change rehearsal (P1)

Introduce reviewed typed edges such as depends-on, constrains, implements, verifies, documents, affects-service, deploys and observed-against. Edges store direction, scope, origin, author/reviewer and revisions. Graph traversal is cycle-safe and bounded; no dedicated graph database is required.

Before approval, create an isolated change scenario referencing its exact base. Compute direct changed scope and downstream candidates. Show the path and classify impact as confirmed, likely or unknown according to recorded links and human review. A proposed scenario cannot mutate the agreement, tasks or verification. Approval rechecks the base and creates an explicit change package.

Provide a reviewed same-meaning decision for wording-only changes, with field-level rationale and applicability. It can preserve an applicability assessment where justified; it never forges a run for the new revision or rewrites the old run. If only some test scopes are unchanged, only those receive the reviewed carry-forward relationship. Unknown dependencies are explicit coverage gaps.

**Exit.** The fraud-only change finds indirect Support/runbook/test dependencies with explainable paths, leaves the ordinary scope applicable where reviewed, and does not claim completeness for unrecorded links.

### REL-010 — real roles and individual ownership (P2)

Add configurable roles with stable IDs; seed Product, QA, Development, BA, Support and Operations. Separate role membership from approval permissions and named action ownership. Preserve earlier role labels/receipts in history; migrate existing roles without changing past decisions. Update AI contracts to refer to validated role IDs, with an adapter for older proposals.

**Exit.** BA needs no Product workaround. My work shows owned items; Team view shows the role's items and says so. Role renaming does not orphan tasks, records or baselines.

### REL-013 — capacity, fidelity and long-lived history (P2)

Show active records, extracted text, common bases, parent archives and optional attachment contributions to capacity. Warn before a change exceeds supported limits and preserve the previous usable file. Measure reopening, save, graph/query and merge costs using representative data.

Use content-addressed immutable snapshots to deduplicate identical parent content while preserving logical parents, hashes, revision IDs and audit paths. Compaction is lossless, versioned, previewable and recoverable. Separate intentional archival from compaction; an archived project's content remains obtainable through its archive, and current references cannot silently point to removed material. Existing files are backed up before migration; future formats fail clearly.

Add original attachments only with explicit per-file/total budgets and retention choice. The current envelope can remain initially; a chunked format requires a measured need and a separate migration gate. Improve table/CSV and transcript-location support before heavier OCR/audio. OCR/transcription output is uncertain source extraction requiring preview, not an approved requirement. Offer bounded local processing or an explicitly selected processing service after assessing device/provider limits. Large connected-mode assets belong in private object storage.

**Exit.** The same history remains inspectable after deduplication and reopen. Oversize/corrupt inputs cannot overwrite valid state. Hard limits are documented, not replaced by an “unlimited” promise.

### REL-014 — prove AI quality and failure behavior (P1)

Retain manual operation for all essential decisions. Reuse the protected gateway and provider interface; deploy/configure it only when a real backend/provider is available. Keep credentials in backend secrets. Select actual available API model/settings at configuration time and evaluate them; a Codex subscription/model label does not provide inference for the website.

Candidate extraction, explanation, change suggestions and role suggestions are separate bounded tasks. Hash selected inputs, record prompt/schema/model versions, validate citations/identities, reject stale output and treat document instructions as untrusted content. Cited quotations can still be misinterpreted, so evaluation checks meaning, conditions, exceptions and authority as well as JSON shape.

Maintain representative gold cases with review labels, plus a frozen holdout. Measure qualifier preservation, unsupported claims, scope leakage, unknown handling, useful retrieval, human correction effort, latency and usage cost. Alternative providers use the same contract and benchmark, with explicit configuration; no silent data routing. Queue long shared-mode jobs with cancellation, idempotency and current-input recheck.

**Exit.** Actual authenticated provider requests and failure/allowance checks pass, and the labeled evaluation meets the validation gates. Real inference and mock/runtime checks are reported separately. We do not promise that the product's reasoning exceeds any frontier model; the advantage must come from better context and workflow evidence.

### REL-015 — dependable forms and usable journeys (P2)

Audit labels with explicit `for`/`id`, stable control names and hints referenced separately. Add keyboard navigation, visible focus, focus return after dialogs, meaningful status announcements and mobile layouts. Preserve form edits and focus during partial updates instead of unnecessary whole-screen rerenders. Test with actual keyboard/screen-reader usage as well as DOM selectors; automation friction alone was not proof of an accessibility violation.

**Exit.** A user can complete intake, review, run recording, save/reopen and conflict resolution without a pointer. Accessible names stay useful after fields are populated. Publish the tested browser/device list and outstanding limitations.

### Additional individual feedback that must not be buried in the broad REL groups

The full row-by-row mapping is in [the coverage register](PHASE_2_FEEDBACK_COVERAGE.md). The following additions close requests that were previously implied, grouped too broadly or insufficiently specified.

**Requirement structure and developer context — P2-071 / P2-074.** Add stable parent/group hierarchies and linked exceptions; prevent parent cycles and implicit approval/scope inheritance. A requirement can reference reviewed service/API/component/code locations, feature-flag constraints, compatibility obligations and data migrations. Each affected area has an owner and a reason. Source-backed AI suggestions remain candidates; no link recorded means unknown impact. These structures participate in schema migration, baseline snapshots and merges from W03.

**Evidence-led authoring — P2-072 / P2-073 / P2-088.** Let reviewers select exact passages from several source revisions and see evidence added, replaced or removed before approving. Conflicting passages retain separate authority decisions. Add safe handbook blocks for headings/lists/tables/callouts/code, with plain-text/Markdown fallback and no arbitrary executable HTML. Derived facts stay linked; narrative overrides remain reviewed. Reusable work/test/NFR templates cover conditions, exceptions and measurable performance/accessibility/security/retention/operational criteria. Unknown thresholds stay questions rather than invented acceptance numbers.

**QA's working view and execution — P2-075 / P2-076 / P2-077.** Build the current evidence matrix by requirement, case, release and environment, retaining result origin and applicability. Propose risk-based regression suites/charters from reviewed graph paths; QA reviews both inclusion and exclusion reasons. Native manual runs remain available without a server. Connected automated execution invokes a specifically configured existing test workflow after a human reviews allowed ref/inputs and checks authority; track the actual run/build/artifacts. GitHub supports [workflow dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event), requiring a dispatch-enabled workflow and appropriate access. A timeout is an ambiguous request, not permission to blindly launch another run. Reconcile provider run identity before retrying; dispatch success never creates a test pass. Production deployment workflows are excluded from this test-execution capability.

**Current receipts, personal context and useful alerts — P2-070 / P2-078 / P2-079 / P2-080.** Missing required current-owner acknowledgment becomes an attention reason, separate from completion/result. Create a concise before/after/why/scope/unknowns/evidence change contract accessible from a linked external work item or portable summary. Retain an encrypted local last-view cursor and show relevant changes since that actual revision. Connected mode adds a permission-filtered in-app feed and configurable subscriptions/digests; avoid duplicate/noisy alerts. Optional external delivery channels require user configuration and authorization. Static portable mode shows a briefing when the user opens the updated copy, not fictional background push notifications.

**Support and Operations detail — P2-081 / P2-082.** Add approved, release-scoped known issues, workarounds and responsible escalation owners, with review/expiry dates and defect/incident links. Capture selected deployment manifests/config/flags, rollout audience, monitoring/dashboard references, measurable rollback thresholds and actual rollback validation evidence. Keep intended configuration, supplied manifest and observed deployed state distinct. A monitoring URL does not prove a threshold was checked; a runbook checkbox does not prove rollback executed. Stale workaround/runbook basis enters the same review inbox.

**Continuity and recovery — P2-083.** Record a master owner and alternate custodian; the organization retains authorized secret material separately from project files. Implement known-passphrase rotation/re-encryption with original backup and reopen validation, preserving content identities/history. Retained old files remain decryptable with their old secret. Evaluate an optional separately held recovery wrapping key behind an explicit encryption-format/migration gate; existing v1 readers/files remain supported. This option cannot be simulated by storing the passphrase in the browser. If all original/recovery keys are lost, the honest outcome is unrecoverable content. The first continuity drill uses retained authorized custody, not a claimed reset from nothing.

**Connected governance and reliable operation — P2-086 / P2-087 / P2-089 / P2-090 / P2-091.** Add job leases, checkpoints/resume, expiry/cancellation and input/access rechecks; accepted domain effects are idempotent, while provider billing/external side effects can still be uncertain. Exclude Relay-generated outputs from automatic source ingestion and treat timeouts separately from deletion. Verified source-access loss invalidates affected shared answer context. Add the second provider through the same reviewed task contract and explicit selection. Authenticated receipts/approvals record server actor, capability and exact revision; ordinary-user history is append-only, without claiming a regulatory or tamper-proof audit. Publish health/job/connector/backup signals with responsible owners and content-minimized diagnostics.

**Cross-product and self-host expansion — P2-084 / P2-085.** Add explicit scoped dependencies between accessible projects, with permission-safe unknown/unavailable handling; portable mode can only reason from authorized snapshots it has received. No whole-company crawling or inferred secret dependencies. Package the same selected backend for self-hosting, with pinned configuration, secret setup, HTTPS/Auth callbacks, database/storage/job migrations and tested backup/upgrade/rollback. [Supabase's Docker guidance](https://supabase.com/docs/guides/self-hosting/docker) supports that deployment direction; operating it remains the organization's responsibility. Verify the actual supported components rather than assuming parity with every managed-host feature.

## 7. Additional modules that make the lifecycle complete

### Requirement and delivery structure

- Goals and success measures link to requirement groups; measured production outcomes are observations, not automatically attributed to a release.
- Requirements support behavior, constraints and NFRs. Capture priority, owner, conditions/exclusions, acceptance measures, exact evidence and lifecycle state.
- Reviewed decision tables support combinations/exceptions; contradictions generate questions rather than silent resolution.
- Native work supports a simple board/list, dependencies and relevant role obligations. Do not require a new project-management methodology to enter a single item.
- External/native ownership is declared per record/field. Teams should not maintain contradictory task states in two places.

### Release, Support and Operations

- Releases and environments are stable records; deployments link release/build, target environment, time and evidence origin. Feature flags, rollout groups and customer audience can constrain applicability.
- A release obligation view separates unresolved decision, missing work, missing/failed/stale verification, missing guidance, deployment uncertainty and accepted exception. No averaged score hides a critical blocker.
- A release decision records the reviewer, context and accepted risks. It does not prove a deployment occurred.
- Support guidance references approved applicable rules. Customer-facing exports are reviewed, sanitized derivatives with version labels.
- Runbooks carry operational prerequisites, checks, rollout/rollback responsibilities and links to evidence. Relay records obligations; production execution remains in the actual operational tools.
- Incidents/tickets retain observed facts, severity, deployed scope, related records and follow-up decisions. Suggested causes are hypotheses until investigated.

### Company view

- Shared mode supports organizations/projects, membership, ownership transfer, retention/export rules and backup/restore responsibility.
- Portfolio summaries contain only authorized records. Show last update, unresolved obligations and evidence gaps per project; indicate unavailable/stale data.
- Usage/cost limits are visible to administrators. Avoid logging document bodies, prompts containing customer text, passphrases or provider secrets.
- Onboarding includes a fictional complete journey and import templates. The pilot must measure total team effort rather than shifting hidden administration onto a manager.

## 8. Definite architecture and storage path

### Keep the current frontend

Retain vanilla JavaScript modules, the locked build, browser parsing workers and GitHub Pages. Do not spend Phase 2 on a framework rewrite. Split pure selectors and domain commands from rendering as modules grow. Runtime validators and versioned contracts remain required for files, AI, imports and backend commands.

Use interfaces for repository storage, identity, external references, job execution and AI providers. A module should not infer that a selected name is an authenticated user. Domain commands receive explicit actor context and expected revisions.

### Shared data contract

| Record family | Essential fields / rules |
| --- | --- |
| Source / asset / revision | Stable IDs, hash, location metadata, extraction warnings, original retention choice and access classification. |
| Requirement / glossary / objective | Typed content, conditions/exclusions, scope, owner, source links and immutable approved revisions. |
| Decision / proposal / question | Exact base, authority, reason, lifecycle and history. |
| Member / role / ownership | Stable identities and membership; file-mode self-report distinguished from server-authenticated actor. |
| Work / case / run / defect | Applicable requirement/case revisions, owner/status, conditions, results, provenance and external ownership. |
| Release / environment / deployment | Scope IDs, build identity, lifecycle, observed deployment evidence and accepted exceptions. |
| Guidance / runbook / incident | Approved basis versus observation/hypothesis, applicable audience and follow-up links. |
| Relationship | Typed direction, scope, origin/review and endpoints/revisions; no dangling unauthorized endpoint. |
| Baseline / history / sharing | Immutable snapshots or deduplicated references, parent lineage, expected returns and format version. |
| AI / connector job | Input hashes, actor/access scope, model/adapter version, command ID, outcome, retry/cancellation state and minimized diagnostics. |

Keep immutable revisions/journals and derive current projections. Do not rebuild the entire application as a new event-sourcing platform. Scope, attention, evidence applicability and relationship traversal become shared pure functions, rather than separate guesses by each screen.

Every new record family must participate in export/import, recovery, baselines where relevant, sharing, validation and access checks from its first usable checkpoint. Extend three-way merge record groups with their linked revisions/results; preview cross-record dependencies before selecting a branch. Validate the complete proposed result atomically. Do not merge a new test/run/edge collection by last-write-wins or omit it from the portable file merely because its UI works. Queries/indexes are rebuildable projections, not additional authoritative copies.

### Portable mode

- One encrypted master file and encrypted browser recovery; existing envelope initially unchanged.
- Preserve full-history validation, common-base comparisons, stale-file checks and backup-before-migration.
- Plan the next project schema for typed roles/scope/relationships; introduce further schema versions only when contract changes require them. Maintain fixtures for all supported versions.
- No automatic multi-user synchronization, server identity, background connector polling or guaranteed knowledge of the latest file.
- Sanitized reading packs have a separate identity/type. A future limited offline proposal pack must retain origin references and return explicit proposals, not masquerade as a full three-way merge parent.

Portable mode may still opt into the protected AI gateway without adopting shared project storage. The content selected for an AI request leaves the browser only after the existing confirmation; connecting AI does not silently upload the whole project.

### Optional shared mode

Use **Supabase Auth + Postgres + private Storage + Edge Functions**, extending the backend direction already present. GitHub Pages still serves the static frontend. It cannot itself store team data, protect provider secrets or execute reliable background jobs.

Store domain records/revisions and reviewed relationships in Postgres, selected assets in private Storage, and bounded jobs in a durable job queue. Enforce organization/project membership and capabilities server-side with database policies and command validation. [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) provide the policy mechanisms; a service credential bypasses those controls and must remain backend-only.

Writes use expected revision plus unique command ID and transactionally update records/journal. Concurrent edits become conflict review; retries do not repeat approvals or external writes. Offline edits remain local drafts/proposals and are rebased/reviewed after reconnecting. No stale offline approval is applied automatically.

Shared data is server-accessible under authorization for search, jobs and selected AI processing. Transport/storage protection is not a promise of user-held end-to-end encryption. Exports can be encrypted portable snapshots. Revoking server access cannot revoke already exported copies. A fully client-encrypted collaboration service would materially change search/jobs/AI design and is not the selected Phase 2 architecture.

### Connector order and field ownership

1. **Report-file import + public GitHub reference pilot:** possible with available fixtures/repository access; distinguish a report from provider-verified evidence.
2. **Authenticated GitHub read integration:** issues/PRs, builds/runs, relevant artifacts and deployment references where the account exposes them. Link the existing repository rather than create a second work backlog. Use backend-held credentials for private repositories. [Issues API](https://docs.github.com/en/rest/issues/issues), [workflow runs API](https://docs.github.com/en/rest/actions/workflow-runs).
3. **Confluence document ingestion:** selected pages/revisions, access-aware content and reviewed refresh; this is the first documentation connector once a test tenant exists.
4. **Drive selected documents/files:** revision/content identity and access changes; an automatically refreshed source still needs agreement review.
5. **Azure DevOps and ClickUp work/test references:** map stable IDs, workflow states and external field ownership before considering write-back.

All use an adapter contract with pagination, rate/permission failure, retry, deleted/inaccessible record handling and provenance. Account-specific support is verified against a real tenant; without one, mark it fixture-tested. Start read-only. Later write-back shows an exact diff, checks the external revision, uses an outbox/idempotency key and records the result. Relay's model, AI output, or a webhook cannot silently authorize external changes.

## 9. Build order, deliverables and effort

A package is a coherent capability, not a forced new chat session. We can finish several in one uninterrupted session when dependencies and checks allow. A **build block** means one bounded implementation/verification checkpoint; its duration varies. Ranges are planning estimates, not a quota or completion guarantee. Re-estimate after W03 using actual throughput and schema findings.

| Package | Scope / reviewable result | Depends on | Estimated blocks |
| --- | --- | --- | --- |
| W01 | Canonical equality, idempotent validation, affected-file recovery and authored lifecycle regression. | Current code / public regression | 1–2 |
| W02 | Unified review inbox/counts, current-owner receipt gaps, honest empty states, labels/focus and identity labels. | W01 | 2–4 |
| W03 | Typed requirements/NFRs, hierarchy/exceptions, scope, roles, component/API constraints, graph contract and migrations. | W01–W02 | 4–6 |
| W04 | Guided intake, multi-source picker, bulk review, safe handbook blocks, native work, derived guidance and My work. | W03 | 4–6 |
| W05 | Glossary retrieval, agreed/source separation and release/baseline filters. | W03–W04 | 2–4 |
| W06 | Cases/manual runs/defects, reusable NFR/edge-case templates, evidence matrix/provenance and report import. | W03–W04 | 5–7 |
| W07 | Reviewed graph, change rehearsal, regression selection, impact reasons and evidence carry-forward. | W03–W06 | 4–7 |
| W08 | Return manifests/lineage, personal change digest, capacity/dedup, custody/rotation/recovery options and fidelity. | W01, W03, W07 | 3–5 |
| W09 | Release/deployment/exception views, known issues/escalation, monitoring/rollback obligations, incident loop and sanitized exports. | W04–W08 | 4–6 |
| W10 | Live AI setup, task contracts, holdouts, second-provider comparison, cost/latency and safe failures. | W03–W07; external providers/backend | 4–7 |
| W11 | Auth/policies/storage, authenticated approvals, transactions/conflicts, subscriptions, leased/resumable jobs and encrypted export. | W03–W09; backend access | 6–10 |
| W12 | GitHub adapter, real evidence, reviewed test-workflow execution, work-item change contract, ownership and ingestion safeguards. | W06, W11; GitHub access | 4–7 |
| W13 | Confluence → Drive → Azure/ClickUp adapters, representative tenant checks and difficult-source extensions. | W08, W11–W12; respective accounts | 6–10 |
| W14 | Portfolio/cross-project links, company controls, self-host package, service health, real-team pilot and full hardening. | W01–W13 for full connected pilot | 6–9 |

Revised estimates including the newly explicit items: **3–6 blocks** for the reliable foundation; **29–47 cumulative** for the complete portable journey; **55–90 cumulative** for the broad connected plan. This replaces the earlier 46–75 full-plan range; the additions include real functionality such as hierarchy, richer authoring, execution integration, notifications and self-host packaging. Blocks are not sessions or hours. Real account setup, permissions, provider quality, difficult documents and unexpected migration problems can extend the estimate. No current usage percentage has been read or assumed for this plan.

W10 evaluations and connector contract fixtures can proceed after their own foundations without blocking the manual journey. W14's baseline metrics and participant recruitment start early; its final acceptance waits for the relevant completed mode. W13 providers are delivered and labeled individually rather than waiting to pretend all integrations are ready.

For each package: implement the complete bounded capability → run its meaningful checks → demonstrate the journey → update status/backlog → preserve a commit. Broader lifecycle checks run at checkpoint boundaries and whenever changed invariants justify them. Users can review concrete progress without waiting for the whole connected platform.

## 10. Product design approach

Keep the calm Google-inspired interface: readable typography, strong spacing, useful search, clear hierarchy and consistent controls. Organize around the journey rather than a large list of technical modules:

- **Project:** goal, team, sources and selected release/environment.
- **Agreement:** requirements, glossary, decisions, baselines and proposed changes.
- **My work / Team work:** role obligations, owners, relevant cases and guidance.
- **Evidence:** runs, defects, builds and applicability reasons.
- **Release:** obligations, exceptions, actual deployments, Support/Operations handoff.
- **Learn:** questions, incidents and proposed improvements.

The global Review inbox is available from every area. File freshness, selected scope and mode remain visible. Technical hashes and raw journals belong in expandable evidence detail; users see plain reasons and next actions first. Do not expose backend or model implementation details in ordinary flows unless someone needs them to make a decision.

## 11. Acceptance, rollout and company usefulness

Detailed cases and thresholds are in [PHASE_2_VALIDATION.md](PHASE_2_VALIDATION.md). The non-negotiable outcomes are:

- No known corruption/reopen/share failure on supported lifecycle fixtures; invalid input preserves the current state.
- Counts and detailed queues agree, and every stale/proposed item explains why it needs action.
- No unreviewed AI/source interpretation becomes an agreement or verified result.
- Release/customer/environment filters cannot silently substitute incompatible context.
- Old evidence stays visible; applicability is assessed separately from the result that actually ran.
- Shared permission tests fail closed across records, relationships, search, exports, assets and jobs.
- Real integrations and live inference are distinguished from fixtures.

Pilot with consenting real participants across the six functions; one feature, an initial walkthrough, at least two meaningful changes, one handoff and one release/incident exercise. Start with non-sensitive material until the relevant mode's access/data protections are verified. Compare matched ordinary workflows, including PM administration and onboarding, rather than collecting only happy-path testimonials.

Measure time to understand the current agreement, repeated clarification requests, duplicate entries, reviewing-change effort, unnecessary rechecks, missing relevant work, retrieval correctness and recovery success. Record correction effort and failures. Short pilots cannot prove fewer escaped defects or company-wide return on investment.

The initial value target is a meaningful reduction in **total** repeated coordination effort without losing required checks. If gains for QA/Support require equal or greater new PM work, fix intake/ownership before adding more features.

## 12. Risks, boundaries and decisions kept explicit

| Risk / boundary | Approach | What remains limited |
| --- | --- | --- |
| Graph looks complete when links are missing | Show link coverage and unknowns; reviewed edges and impact paths. | No automatic guarantee of all real-world dependencies. |
| “All inclusive” becomes six disconnected tools | One agreement/scope model, shared selectors and linked native records. | Native modules are focused; advanced execution/monitoring remains integrated. |
| Migration/deduplication loses history | Backups, immutable identities/hashes, schema fixtures and recoverable previews. | Finite file/device capacity persists. |
| AI sounds authoritative | Approved/source separation, holdouts, review and abstention. | Model errors and provider costs remain possible. |
| Two systems own the same status | Explicit native/external field ownership; read-only connectors first. | Integration availability depends on provider permissions and limits. |
| Portable copy leaks sensitive content | Honest access labels and physically sanitized derivatives. | Full passphrase holders can read full files; copied data cannot be revoked. |
| Cloud mode silently changes privacy | Explicit opt-in and plain server/provider data flow. | It is not user-held end-to-end encrypted inference. |
| Company metrics overclaim | Paired pilot tasks, all-role effort and retained failures. | No immediate certification, guaranteed productivity or universal competitor superiority. |
| Delayed account access blocks the build | Manual/native journey and fixtures remain useful; label unverified adapters. | We cannot certify tenants/providers we cannot access. |

Phase 2 does not include an IDE, arbitrary browser test-code execution, full observability infrastructure, payroll/resource management, legal compliance certification or automatic production release. It includes the context, obligations, evidence and reviewed connections needed to use those systems coherently.

## 13. Completion rule and next implementation step

The entire Phase 2 is complete only when the applicable backlog acceptance criteria and validation gates are met, the 138 feedback entries have an honest outcome, account-dependent features are actually exercised or explicitly deferred by scope decision, and the real-team pilot is reported honestly. Writing this plan does not resolve the fifteen broad findings or their individually tracked requests. Keep stable feedback/work IDs as scope evolves.

**Start implementation with W01 / P2-001 through P2-004.** Reproduce the authored-history failure, repair structured comparison/normalization, preserve affected files, and pass repeated lifecycle and tamper-rejection checks. W02 follows immediately. This establishes the trustworthy foundation before expanding the product's reach.
