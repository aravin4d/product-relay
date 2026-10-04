# Phase 2 continued implementation checkpoint

**0.5.0-phase2.1 · build-only continuation · functional verification deferred.**

This continuation adds implementation paths for all 14 previously partial engineering items and the separately listed OAuth, document/media and evaluation gaps. It does not establish acceptance, model quality, security, recovery performance or live integration behavior. The published GitHub Pages site remains 0.4.0; this checkpoint is on `codex/phase2-delivery-build`.

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
| Evidence and evaluation | Frozen authored fixtures for every AI task, paired runner/scorer, browser performance fixture, real-role/competitor observation forms | All unrun; independent labels, real participants and comparable tools still required. |

## Construction and later verification

No functional suite, browser journey, database migration, real provider request, notification, workflow dispatch, backup or restore was run during this continuation. Construction completed: `npm run check:static` (50 JavaScript modules linked without executing the application), syntax parsing of 22 backend/test JavaScript files, `npm run build`, `npm run package:backend` (49 public package files), packaged backend static linking (19 modules), and clean `git diff --check`. These are syntax/import/assembly checks only. New test fixtures exist for authored histories/tamper, old-return proposals, archive integrity, future-save recovery and actual report handling. The performance page runs only when explicitly started.

See [the next-session handoff](docs/PHASE_2_NEXT_SESSION.md), [deployment](deploy/README.md) and [evaluation](docs/evaluation/README.md). External account registration, actual team/competitor evidence and V01–V18 execution are verification/setup work, not silently completed by source code.

## Retained architecture boundaries

Portable files are manually exchanged copies, with self-reported perspective filters and no per-user access enforcement or live sync. Shared services enforce authenticated project permissions and process authorized plaintext; they are not end-to-end encrypted or certified immutable audit storage. Resource bounds remain intentional. AI outputs are drafts. Production deployment/rollback and unrecorded dependency discovery are outside automatic approval.

## All engineering items

All 91 original acceptance/dependency contracts and 138 individual feedback mappings remain in their CSV registers. Status counts are dispositions, not completion percentages:

- **76**: Code built; validation deferred.
- **3**: Validation deferred.
- **10**: Code built; external setup required.
- **2**: Participant evidence required.

| ID | Capability | Status | Later setup / verification |
| --- | --- | --- | --- |
| P2-001 | Canonical structured comparison | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-002 | Idempotent linked-history normalization | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-003 | Affected-file recovery and save confirmation | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-004 | Authored lifecycle and tamper regression | Validation deferred | Run the new authored/holdout/browser gate and add missing fixtures discovered during validation; no passing results reported. |
| P2-005 | Shared attention selector | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-006 | Unified decision inbox | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-007 | Consistent overview and navigation | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-008 | Portable identity and privacy labels | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-009 | Form labels and focus foundation | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-010 | Typed requirements and objectives | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-011 | Structured applicability | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-012 | Configurable roles and membership | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-013 | Typed relationship contract | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-014 | Versioned schema migration | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-015 | Guided source-to-agreement intake | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-016 | Safe batch review | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-017 | Derived role guidance | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-018 | Native work planning | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-019 | My work versus Team view | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-020 | Reviewed glossary aliases | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-021 | Agreed answers versus source exploration | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-022 | Release/baseline/deployment answer scope | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-023 | Retrieval evaluation set | Validation deferred | Run the new authored/holdout/browser gate and add missing fixtures discovered during validation; no passing results reported. |
| P2-024 | Native test registry | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-025 | Manual runs and results | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-026 | Evidence provenance and applicability | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-027 | Bounded test-report file import | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-028 | Native defects and observations | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-029 | Reviewed graph traversal | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-030 | Change rehearsal | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-031 | Reviewed same-meaning and carry-forward | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-032 | Reviewed change package and handoffs | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-033 | Master lineage and expected returns | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-034 | Safe round replacement and return review | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-035 | Capacity and responsiveness budgets | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-036 | Lossless snapshot deduplication | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-037 | Table and transcript fidelity | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-038 | Bounded original attachments and archives | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-039 | Release obligations and exceptions | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-040 | Build/deployment and rollout scope | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-041 | Applicable Support guidance | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-042 | Operational obligations and runbooks | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-043 | Production-to-product learning | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-044 | Sanitized role/customer reading exports | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-045 | Live protected AI deployment | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-046 | Versioned bounded AI tasks | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-047 | Labeled model/holdout evaluation | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-048 | AI cost latency and routing controls | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-049 | Shared repository and asset model | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-050 | Authenticated project policies | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-051 | Transactional commands and conflicts | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-052 | Offline draft reconnect | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-053 | Durable bounded jobs | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-054 | Shared export restore and retention | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-055 | GitHub read adapter and stable references | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-056 | Retrieved run/build/deployment evidence | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-057 | External field/status ownership | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-058 | Reviewed write-back framework | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-059 | Confluence selected-source adapter | Code built; external setup required | Register approved provider applications, configure actual tenant scopes and credentials; verify consent, denial, expiry, renewal and access loss in real accounts. |
| P2-060 | Drive selected-file adapter | Code built; external setup required | Register approved provider applications, configure actual tenant scopes and credentials; verify consent, denial, expiry, renewal and access loss in real accounts. |
| P2-061 | Azure work/test reference adapter | Code built; external setup required | Register approved provider applications, configure actual tenant scopes and credentials; verify consent, denial, expiry, renewal and access loss in real accounts. |
| P2-062 | ClickUp work reference adapter | Code built; external setup required | Register approved provider applications, configure actual tenant scopes and credentials; verify consent, denial, expiry, renewal and access loss in real accounts. |
| P2-063 | Bounded OCR/audio processing | Code built; external setup required | Configure actual OCR/transcription/diarization model access; verify real file fidelity, permissions, cancellation, budgets and cross-clip limitations. |
| P2-064 | Permission-aware portfolio | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-065 | Ownership retention and restore controls | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-066 | Onboarding and reusable templates | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-067 | Performance access and browser hardening | Validation deferred | Run the new authored/holdout/browser gate and add missing fixtures discovered during validation; no passing results reported. |
| P2-068 | Real-team usefulness pilot | Participant evidence required | Recruit/access actual participants or comparable tools, execute paired tasks, record total effort and failures; cannot be replaced by simulated role feedback. |
| P2-069 | Comparable workflow benchmark | Participant evidence required | Recruit/access actual participants or comparable tools, execute paired tasks, record total effort and failures; cannot be replaced by simulated role feedback. |
| P2-070 | Missing current-owner acknowledgments | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-071 | Requirement hierarchy and linked exceptions | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-072 | Multi-source evidence picker | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-073 | Structured handbook authoring | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-074 | Component API compatibility and migration register | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-075 | Current evidence matrix | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-076 | Reviewed risk-based regression selection | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-077 | Execution through an existing test pipeline | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-078 | Change contract from the existing work item | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-079 | Changed-since-last-view briefing | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-080 | Connected change notifications | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-081 | Known issues and escalation paths | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-082 | Operational manifest monitoring and rollback criteria | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-083 | Passphrase continuity rotation and recovery option | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
| P2-084 | Explicit cross-project dependencies | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-085 | Self-host packaging of the same backend | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-086 | Leased resumable jobs expiry and cost semantics | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-087 | Connector feedback-loop and access-loss safeguards | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-088 | Reusable edge-case and NFR templates | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-089 | Second-provider adapter and explicit comparison | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-090 | Authenticated receipts and approval authority | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-091 | Shared-service health and recovery observability | Code built; validation deferred | Run the original acceptance and new security/browser/service/evaluation gates; independently verify real results. No functional pass is claimed. |
