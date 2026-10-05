# Phase 2 continued implementation checkpoint

**0.5.0-phase2.2 · implementation history and current validation.**

The [5 October findings report](docs/validation/2026-10-05/REPORT.md) records 223/223 Node tests, 17/17 storage-browser checks, 8/8 document/media-browser checks, 15/15 lexical assertions, five product repairs and current limitations. [All 91 results](docs/validation/2026-10-05/BACKLOG_RESULTS.csv) and [138 feedback outcomes](docs/validation/2026-10-05/FEEDBACK_RESULTS.csv) supersede earlier unrun dispositions. The implementation narrative below describes the preceding build-only session; it is not the current test status.

This continuation adds implementation paths for all 14 previously partial engineering items and the separately listed OAuth, document/media and evaluation gaps. It does not establish acceptance, model quality, security, recovery performance or live integration behavior. The published GitHub Pages site remains 0.4.0; this checkpoint is on `codex/phase2-delivery-build`.

## Additional implementation repairs in phase2.2

This source review found and repaired concrete gaps after the phase2.1 implementation:

- **Current-view recovery:** a server-accepted or outcome-uncertain change stays visible when its local encrypted save fails. A persistent warning blocks stale cache/file exports and key changes; a separate current-view encrypted snapshot retains the pending command. Separate review copies remove the original master's pending command. Closing a stale view requires an explicit discard acknowledgment.
- **Returned context:** comparison ignores copied decisions/receipts, retains known scope/evidence/links and records unresolved qualifiers. Glossary, releases, environments and risk drafts are supported. Retrieved originals receive separate human correction sources; metadata-only/archived source returns become new context. Archived legacy content becomes new drafts; unknown legacy perspectives require explicit master-role setup.
- **Source and archive integrity:** service origin checks bind actual retrieved text and metadata to the receipt and preserve earlier revisions. Human corrections cannot impersonate provider retrieval. History files must match the full manifest and valid merge-parent contracts; continuity/study/verification metadata has bounded schemas. Rehearsal proposals are limited to editable content; immutable observations remain obligations.
- **Background authority and outcomes:** editors can enqueue/import media through the API, SQL and worker. External writes mark the send boundary after validation. Confirmed outbox/delivery receipts survive later local errors. Delivery leases bind completion; late job output is retained as uncertain context without a resend. Expired cancellation after a send remains uncertain. Paid/read retries stay distinct.
- **Operations and consent:** in-app receipts and observed-outcome reconciliation retain authenticated reviewer evidence separately from actual provider output. Health aggregates all retained jobs and delivery uncertainty; billing/outcome observations acknowledge uncertainty without rewriting provider truth. Delivery settings preserve existing relevance filters. Retention preserves referenced jobs, outbox receipts and original offline drafts.
- **Intake and backups:** strict JUnit parsing is shared across file/connector paths. Scanned page ranges are checked before enqueue; cancellation stops future media uploads and downloadable batch receipts preserve confirmed/uncertain command IDs. Restore extraction requires a fresh destination, handles empty final entries and validates byte/frame limits. Scheduled backups query the earliest interval across all controls and honor changed intervals.

The later validation run exercises many of these scenarios and records precise remaining checks in the dated report. Earlier source construction alone did not establish acceptance.

## Added implementation

| Need | Added path | Important boundary |
| --- | --- | --- |
| Contradictory product context | Local timing/threshold/obligation scan; reviewed exact-revision conclusions/questions; optional AI comparison | Candidate detection can miss contradictions or misread exceptions; humans resolve meaning. |
| Change consequences | Isolated dependency simulation, draft wording, before/after obligations, selected downstream proposals | Recorded links only; no actual tests, deployment or exhaustive impact guarantee. |
| Old and offline edits | Selected content converted into current-base proposals; server rebase retains original input and prevents applying an already committed command again | Imported approvals, identities and execution claims do not become new authority. |
| Growing history | Encrypted parent-history offload, hashed manifest, verification, inspection and reattachment | Active parents remain bounded to 10 at once; archive file and secret must be retained. Source/approval histories stay in the master. |
| Recovery continuity | Optional vault v2 with two wrapped data-key paths; both normal password and separate recovery secret open future saves | Earlier apps cannot open v2. All secrets lost is unrecoverable. Rotation cannot revoke old downloaded files. |
| Shared administration | Organization groups, account/member mappings, owner grants and reversible group membership | Existing Auth accounts; no external directory provisioning or SSO administration. A project/account has one managed group grant at a time. |
| Actual test artifacts | GitHub ZIP retrieval, bounded decompression and digest/CRC checks, actual JUnit/JSON parsing | Explicit case/requirement/scope mapping remains required; workflow green alone is not test proof. |
| Provider accounts | Exact-return OAuth consent, account selection, encrypted credentials, refresh locking and explicit reconnect | Administrator registers applications and selected tenant scopes. Ambiguous rotating-token refresh requires reconnection. The pinned XML dependency is included in the packaged Deno lock. |
| Notifications | Consent-based scheduled email/Slack/Teams/webhook batches and dedup receipts; access checks before send | Destinations and worker required. Ambiguous sends are retained for reconciliation, not blindly repeated. |
| Backups/operations | Scheduled encrypted database snapshot/private-original backup, integrity extraction, isolated restore command, backup/queue/failure health and backed operational retention | Fair bounded polling avoids first-page starvation; settings/group overrides are transactional. Packaging excludes private local secrets. Requires compatible PostgreSQL tools and an isolated compatible target. Only an executed drill produces recovery measurements. |
| Scanned documents/recordings | Local PDF page rasterization, bounded audio decoding/chunking, optional diarized provider output with source page/clip labels | 50 PDF pages per batch; recording 60 MB/30 min; browser codecs vary; speakers are clip-local estimates. No exact image coordinates or proprietary layout reproduction. |
| Evidence and evaluation | Frozen authored fixtures for every AI task, paired runner/scorer, browser performance fixture, real-role/competitor observation forms | Retrieval and synthetic local performance now run; semantic/provider quality, independent labels and real participants/tools still required. |

## Construction and later verification

During the preceding build-only session, functional execution was deferred. The later 5 October run is documented above; actual providers, notifications, dispatch and a full database/object restore remain unrun. Construction completed: `npm run check:static` (50 JavaScript modules linked without executing the application), syntax parsing of all 11 backend JavaScript modules, `npm run build`, `npm run package:backend` (50 public package files), packaged backend static linking (19 modules), and clean `git diff --check`. These are syntax/import/assembly checks only. New test fixtures exist for authored histories/tamper, old-return proposals, archive integrity, future-save recovery and actual report handling. The performance page runs only when explicitly started.

See [the next-session handoff](docs/PHASE_2_NEXT_SESSION.md), [deployment](deploy/README.md) and [evaluation](docs/evaluation/README.md). External account registration, actual team/competitor evidence and V01–V18 execution are verification/setup work, not silently completed by source code.

## Retained architecture boundaries

Portable files are manually exchanged copies, with self-reported perspective filters and no per-user access enforcement or live sync. Shared services enforce authenticated project permissions and process authorized plaintext; they are not end-to-end encrypted or certified immutable audit storage. Resource bounds remain intentional. AI outputs are drafts. Production deployment/rollback and unrecorded dependency discovery are outside automatic approval.

## All engineering items

All 91 original acceptance/dependency contracts and 138 individual feedback mappings remain unchanged. The original CSV implementation statuses describe the preceding build session; dated verification fields are current. No completion percentage substitutes for each remaining obligation.

| ID | Capability | Current validation | Remaining acceptance |
| --- | --- | --- | --- |
| P2-001 | Canonical structured comparison | Partial: local checks passed | Exhaustive scalar/array permutation coverage across every snapshot call site was not performed. |
| P2-002 | Idempotent linked-history normalization | Partial: local checks passed | Precise earlier failing review file was not available; authored replacements and the retained schema-4 sample were checked. |
| P2-003 | Affected-file recovery and save confirmation | Partial: local checks passed | Native retained-file save/open blocked by locked Mac and no captured download path; exact earlier failing file unavailable. |
| P2-004 | Authored lifecycle and tamper regression | Partial: local checks passed | Full browser walkthrough/change/share/returned-file/reopen journey and all legacy combinations remain incomplete. |
| P2-005 | Shared attention selector | Partial: local checks passed | Full item/count matrix for every actor/role/release and all stale guidance varieties not exercised. |
| P2-006 | Unified decision inbox | Partial: local checks passed | Not every inbox row was opened through its exact browser decision action. |
| P2-007 | Consistent overview and navigation | Partial: local checks passed | Original five-stale-action empty-state reproduction under every matching filter not completed. |
| P2-008 | Portable identity and privacy labels | Partial: local checks passed | Every export/dialog label was not independently inspected. |
| P2-009 | Form labels and focus foundation | Partial: local checks passed | Complete keyboard-only core journey, live update edit retention and screen-reader announcements unverified. |
| P2-010 | Typed requirements and objectives | Partial: local checks passed | Every constraint/objective/decision-table combination and conflict resolution UI not exercised. |
| P2-011 | Structured applicability | Partial: local checks passed | All overlapping audience/exclusion/release scope combinations require wider coverage. |
| P2-012 | Configurable roles and membership | Partial: local checks passed | Custom role rename/removal across all histories and UI permissions not exhaustively tested. |
| P2-013 | Typed relationship contract | Partial: local checks passed | Every directed edge type and cross-project closed/revoked endpoint variation not exercised. |
| P2-014 | Versioned schema migration | Partial: local checks passed | All supported schemas with every native family, old vault and branch variant not combined; native file roundtrip blocked. |
| P2-015 | Guided source-to-agreement intake | Partial: local checks passed | Complete guided intake-to-approved-requirements bulk workflow and duplicate entry count not measured. |
| P2-016 | Safe batch review | Partial: local checks passed | Native batch approval, partial rejection/deferral and all selected UI candidate failures not fully exercised. |
| P2-017 | Derived role guidance | Partial: local checks passed | All six briefs and manual override staleness/update behavior not exercised. |
| P2-018 | Native work planning | Partial: local checks passed | Complete native work UI creation/edit/ownership lifecycle not exercised. |
| P2-019 | My work versus Team view | Partial: local checks passed | Browser filtering across all six roles and all record kinds not completed. |
| P2-020 | Reviewed glossary aliases | Partial: local checks passed | Corpus is authored and one former holdout used for repair; independent usefulness review absent. |
| P2-021 | Agreed answers versus source exploration | Fixture-tested only: live acceptance pending | No actual model interpretation or full source-mode browser journey. |
| P2-022 | Release/baseline/deployment answer scope | Partial: local checks passed | Real deployed context/provider evidence and every baseline/rollout combination remain unverified. |
| P2-023 | Retrieval evaluation set | Partial: local checks passed | No semantic scoring; repair-contaminated holdout; 47 combined authored AI cases fall short of the original 60-case gate. |
| P2-024 | Native test registry | Partial: local checks passed | Suite/parameters/exploratory charter reuse and all UI forms not exercised. |
| P2-025 | Manual runs and results | Partial: local checks passed | Every actual-result import/duplicate/out-of-order history combination not exhausted. |
| P2-026 | Evidence provenance and applicability | Partial: local checks passed | Full native same-meaning/carry-forward review and live provider proof unverified. |
| P2-027 | Bounded test-report file import | Partial: local checks passed | Browser report duplicate import, ZIP bomb variants and complete explicit mapping journey not exercised. |
| P2-028 | Native defects and observations | Partial: local checks passed | Full defect triage/link/closure UI and inference prevention not independently exercised. |
| P2-029 | Reviewed graph traversal | Partial: local checks passed | Unreviewed/missing-edge paths and every indirect guidance/test path require broader fixtures. |
| P2-030 | Change rehearsal | Partial: local checks passed | Full downstream proposal selection and browser rehearsal stale-reference matrix not exercised. |
| P2-031 | Reviewed same-meaning and carry-forward | Partial: local checks passed | Native carry-forward applicability decision and every fraud/ordinary branch not fully exercised. |
| P2-032 | Reviewed change package and handoffs | Partial: local checks passed | Full six-role native package with partial/rejected decisions and actual users not exercised. |
| P2-033 | Master lineage and expected returns | Partial: local checks passed | Expected-return manifest duplicate/outstanding/withdrawal UI lifecycle not completely exercised. |
| P2-034 | Safe round replacement and return review | Partial: local checks passed | All legacy/archived source and unresolved-return conversion variants remain untested. |
| P2-035 | Capacity and responsiveness budgets | Partial: local checks passed | Synthetic requirements only; graph/merge/UI/memory/storage-pressure workloads unmeasured. |
| P2-036 | Lossless snapshot deduplication | Partial: local checks passed | No before/after compaction size benefit measurement or native archive reattachment recovery drill. |
| P2-037 | Table and transcript fidelity | Partial: local checks passed | Representative complex tables/cells and all timestamp formats not independently browser-reviewed. |
| P2-038 | Bounded original attachments and archives | Partial: local checks passed | Large-budget originals, missing remote assets and complete archive-original recovery drill not exercised. |
| P2-039 | Release obligations and exceptions | Partial: local checks passed | Critical blocker plus accepted exception/rationale full release decision journey not exercised. |
| P2-040 | Build/deployment and rollout scope | Partial: local checks passed | Real deployment/partial customer rollout and recorded observation update workflow not exercised. |
| P2-041 | Applicable Support guidance | Partial: local checks passed | Complete actual deployment-to-Support known-issue/customer answer journey not exercised. |
| P2-042 | Operational obligations and runbooks | Partial: local checks passed | Monitor/rollback proof and runbook execution full journey not performed. |
| P2-043 | Production-to-product learning | Partial: local checks passed | Complete observation-hypothesis-investigation-reviewed-product-change chain not authored through UI. |
| P2-044 | Sanitized role/customer reading exports | Partial: local checks passed | Physical browser download inspection for hidden data and derivative-as-merge rejection remains incomplete. |
| P2-045 | Live protected AI deployment | Blocked: external runtime/account/participant evidence | No real protected gateway, valid/expired/denied live account or paid inference setup. |
| P2-046 | Versioned bounded AI tasks | Fixture-tested only: live acceptance pending | Real candidate qualifier preservation and semantic usefulness unmeasured. |
| P2-047 | Labeled model/holdout evaluation | Blocked: external runtime/account/participant evidence | Need independently reviewed 60+ labels/frozen holdout, real model outputs, correction effort and actual participants. |
| P2-048 | AI cost latency and routing controls | Fixture-tested only: live acceptance pending | Real provider billing/latency/log audit and routing failure scenarios not executed. |
| P2-049 | Shared repository and asset model | Fixture-tested only: live acceptance pending | Actual Supabase Auth/PostgREST/object storage and shared UI lifecycle unverified. |
| P2-050 | Authenticated project policies | Fixture-tested only: live acceptance pending | Not a complete live path matrix; real tokens, indirect portfolio/search and real storage policies require service test. |
| P2-051 | Transactional commands and conflicts | Fixture-tested only: live acceptance pending | PGlite serializes operations; no independent concurrent PostgreSQL sessions or network timeout race proof. |
| P2-052 | Offline draft reconnect | Fixture-tested only: live acceptance pending | Actual shared offline browser reconnect, token expiry, concurrent rebase/revocation and UI private clearing unverified. |
| P2-053 | Durable bounded jobs | Fixture-tested only: live acceptance pending | Actual worker crash/transport faults, multiple runtimes and external effect idempotency unverified. |
| P2-054 | Shared export restore and retention | Fixture-tested only: live acceptance pending | No complete database/object restore, live scoped export or full restore authority test. |
| P2-055 | GitHub read adapter and stable references | Fixture-tested only: live acceptance pending | Actual approved pilot repository and tenant revoked/private access unavailable. |
| P2-056 | Retrieved run/build/deployment evidence | Fixture-tested only: live acceptance pending | Real linked workflow artifact retrieval with reviewed mapping not run. |
| P2-057 | External field/status ownership | Fixture-tested only: live acceptance pending | Full external-owned status refresh UI and native independence proof not exercised with a real tenant. |
| P2-058 | Reviewed write-back framework | Fixture-tested only: live acceptance pending | Real reviewed write-back permission, provider idempotency and crash after send not verified. |
| P2-059 | Confluence selected-source adapter | Fixture-tested only: live acceptance pending | Real tenant revision, consent/cloud selection, pagination and revoked access journey unavailable. |
| P2-060 | Drive selected-file adapter | Fixture-tested only: live acceptance pending | Real selected Drive file, token refresh and permission loss not run. |
| P2-061 | Azure work/test reference adapter | Fixture-tested only: live acceptance pending | Real tenant work item/test/run and limited tenant permission journey unavailable. |
| P2-062 | ClickUp work reference adapter | Fixture-tested only: live acceptance pending | Real nested page/task response compatibility and tenant permission/status lifecycle unverified. |
| P2-063 | Bounded OCR/audio processing | Partial: local checks passed | No real OCR/transcription accuracy/cost, unsupported codec device matrix or partly queued/cancelled browser batch. |
| P2-064 | Permission-aware portfolio | Fixture-tested only: live acceptance pending | Actual portfolio aggregate denial matrix, inactive target revocation and closed-project UI not exercised. |
| P2-065 | Ownership retention and restore controls | Fixture-tested only: live acceptance pending | Full restore/owner-departure drill and actual administration lifecycle unverified. |
| P2-066 | Onboarding and reusable templates | Blocked: external runtime/account/participant evidence | No actual new participant onboarding observation or PM correction-time measurement. |
| P2-067 | Performance access and browser hardening | Partial: local checks passed | Only in-app Chromium; full keyboard/screen reader, Safari/Firefox, physical device, UI/memory/merge budgets unverified. |
| P2-068 | Real-team usefulness pilot | Blocked: external runtime/account/participant evidence | Actual PM/BA/Development/QA/Support/Operations participants and matched baseline measurement unavailable. |
| P2-069 | Comparable workflow benchmark | Blocked: external runtime/account/participant evidence | Licensed competitor access and real matched-task observations unavailable. |
| P2-070 | Missing current-owner acknowledgments | Partial: local checks passed | All actor/scope UI counter combinations not exercised. |
| P2-071 | Requirement hierarchy and linked exceptions | Partial: local checks passed | Parent/exception competing scope review and full merge/hierarchy mutation matrix not exercised. |
| P2-072 | Multi-source evidence picker | Partial: local checks passed | Actual multi-source picker add/replace/remove with conflicting authorities and browser approval/history not exercised. |
| P2-073 | Structured handbook authoring | Partial: local checks passed | Rich handbook toolbar/links/formatting roundtrip and focus preservation not exercised. |
| P2-074 | Component API compatibility and migration register | Partial: local checks passed | Compatibility/API/migration obligation change and reviewed downstream UI path not fully exercised. |
| P2-075 | Current evidence matrix | Partial: local checks passed | Every obligation/result filter and retained review reason combination not exhaustive. |
| P2-076 | Reviewed risk-based regression selection | Partial: local checks passed | Risk selection/exclusion rationale browser journey and real AI regression proposals not run. |
| P2-077 | Execution through an existing test pipeline | Fixture-tested only: live acceptance pending | Actual authorized test pipeline run/artifact correlation requires a real repository and worker. |
| P2-078 | Change contract from the existing work item | Fixture-tested only: live acceptance pending | Actual developer opens applicable reviewed change from their work system; participant time savings unmeasured. |
| P2-079 | Changed-since-last-view briefing | Partial: local checks passed | Persistent actual last-view briefing after returned merge and unopened offline copy full UI exercise not completed. |
| P2-080 | Connected change notifications | Fixture-tested only: live acceptance pending | No actual email/Slack/Teams/webhook delivery, multiple-worker fair polling or DNS rebinding audit. |
| P2-081 | Known issues and escalation paths | Partial: local checks passed | Actual known-issue search/responsible escalation and archived workaround UI not fully exercised. |
| P2-082 | Operational manifest monitoring and rollback criteria | Partial: local checks passed | Full operational monitored release/rollback proof chain not independently executed. |
| P2-083 | Passphrase continuity rotation and recovery option | Partial: local checks passed | Native retained old/new files and actual alternate-custodian owner-departure drill unverified. |
| P2-084 | Explicit cross-project dependencies | Fixture-tested only: live acceptance pending | Explicit cross-product path and inaccessible target count leak matrix not independently exercised. |
| P2-085 | Self-host packaging of the same backend | Blocked: external runtime/account/participant evidence | Deno/Docker/PostgreSQL CLI absent; no actual fresh stack, restore, upgrade, TLS/Auth setup or rollback. |
| P2-086 | Leased resumable jobs expiry and cost semantics | Fixture-tested only: live acceptance pending | Actual worker crash/multi-session lease race/provider billing and rotating-token uncertainty unverified. |
| P2-087 | Connector feedback-loop and access-loss safeguards | Fixture-tested only: live acceptance pending | Actual revoked tenant access cache clearing and all generated-output types not independently tested. |
| P2-088 | Reusable edge-case and NFR templates | Partial: local checks passed | Full reusable edge-case/NFR template UI and unknown-threshold reduction in actual review burden unmeasured. |
| P2-089 | Second-provider adapter and explicit comparison | Blocked: external runtime/account/participant evidence | No live OpenAI/Anthropic paired comparison, semantic quality, failure cost or latency measurement. |
| P2-090 | Authenticated receipts and approval authority | Fixture-tested only: live acceptance pending | Real Auth token journal and every approved-receipt browser path not tested on deployed service. |
| P2-091 | Shared-service health and recovery observability | Fixture-tested only: live acceptance pending | Actual alerts, full backup/restore recovery time/data loss, polling contention and confidential-log audit remain unverified. |
