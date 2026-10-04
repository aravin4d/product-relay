# Phase 2 implementation checkpoint

**4 October 2026 · 0.5.0-phase2.0 · built, functional validation deferred.**

This checkpoint implements the portable delivery lifecycle and optional connected-service code in one continued build. The user explicitly requested testing in the next session. Syntax, static import linking, website assembly and backend packaging are construction checks; they do not establish that save/merge, SQL policies, browser flows or real providers work correctly. The live GitHub Pages deployment remains the earlier 0.4.0 build until a tested release is merged to `main`.

All **91 engineering items** and **138 feedback entries** remain individually mapped in the [backlog](PHASE_2_BACKLOG.csv) and [feedback register](PHASE_2_FEEDBACK_COVERAGE.csv). They now distinguish code present, partial implementation, external setup and deferred validation. None is labeled functionally complete just because this checkpoint contains code.

## What was built

| Team need | Implementation | Main source |
| --- | --- | --- |
| Reopen authored walkthrough/history safely | Canonical structured equality replaces property-order comparisons; linked snapshots normalize consistently; serialized encrypted saves reopen before success. Original affected files must still be tested. | `src/value.js`, `domain.js`, `storage.js`, `sharing.js` |
| See every pending decision and stale obligation | One person/role/scope selector feeds Overview, navigation and Review inbox. It includes legacy and native proposals, unresolved questions, stale work, current-owner receipts and evidence gaps. | `src/attention.js`, `app.js` |
| Begin with source-backed product intent | Typed objectives, behavior/constraint/exception/NFR requirements, numerical acceptance measures, decision-table mapping, hierarchy, glossary aliases and multi-source revision evidence. | `src/lifecycle.js`, `lifecycle-ui.js`, `planning-ui.js` |
| Give each role concrete work | Native owned work, current-scope receipts, relevant-role handoffs and concrete criteria; My work is separate from Team view. BA and custom roles preserve historical labels. | `src/lifecycle.js`, `actions.js`, `attention.js` |
| Explain a change and its impact | Reviewed typed dependency paths, affected cases/guidance/components, isolated change rehearsal, exact-base proposals, reviewed regression inclusion/exclusion and portable change contracts. | `src/lifecycle.js`, `planning.js`, `planning-ui.js` |
| Check the actual behavior | Versioned cases, charters/parameters, numerical thresholds and actual measurements; immutable manual/imported/retrieved runs; bounded JUnit/JSON import and mapping; defects and per-requirement evidence reasons. | `src/lifecycle.js`, `report-import.js`, `lifecycle-ui.js` |
| Distinguish approval from deployment | Release obligations and owned expiring exceptions; actual build/environment observations with explicitly reviewed agreement mappings. No average readiness score or inferred production behavior. | `src/lifecycle.js`, `knowledge.js` |
| Keep Support and Operations current | Approved derived guidance, known issues, workarounds/escalation and review dates; runbook/monitor/rollback fields; incident-to-question/regression/guidance follow-up. | `src/lifecycle.js`, `lifecycle-ui.js` |
| Share a portable master predictably | Master/round/base fingerprints, expected named returns, received/merged/withdrawn states, duplicate receipts, outstanding-return preview, retained earlier bases and complete merge parents. | `src/lineage-ui.js`, `sharing.js`, `app.js` |
| Retain readable evidence efficiently | Lossless dictionary packing; capacity preflight; CSV and SRT/VTT locations; safe Markdown rendering; bounded originals with raw-byte checksum verification. | `src/packing.js`, `structured-source.js`, `rich-text.js`, `lifecycle.js` |
| Maintain custody and reader continuity | Alternate custodian, known-passphrase rotation with old encrypted backup, separately encrypted recovery snapshot, encrypted last-view cursors and physically sanitized customer reading packs. | `src/storage.js`, `lifecycle.js`, `lifecycle-ui.js` |
| Add optional shared identity and collaboration | Supabase membership/capability policies, expected-revision commits, command IDs, journals, encrypted pending local drafts, stale conflict review, separate review-copy preservation, private originals and ownership transfer. | `src/shared.js`, `shared-ui.js`, `supabase/functions/_shared/projects.js`, five SQL migrations |
| Use external tools as the authoritative work owner | Selected GitHub issue/PR/run/deployment reads, Confluence pages, Drive text/CSV, Azure work/test results and ClickUp tasks/doc page text. Explicit source refresh, actual result mappings, reviewed GitHub comments and configured test-only dispatch/correlation. | `src/connector-ui.js`, `supabase/functions/_shared/connectors.js` |
| Process safely in a service | Durable jobs, bounded safe-read retry, lease/checkpoints, cancellation, access/revision checks, transactional outbox and visible uncertainty. PNG/JPEG OCR and short PCM WAV transcription require explicit consent. | `supabase/functions/_shared/jobs.js`, `media-provider.js`, `src/media.js` |
| Use AI without changing approved truth automatically | OpenAI/Anthropic selection, bounded typed tasks, exact quote checks, preserved unknowns, input/model/prompt provenance, shared-project reauthorization, request budgets and minimal latency/token receipts. | `src/ai.js`, `ai-tasks.js`, `supabase/functions/_shared/{handler,project-ai,openai,anthropic}.js` |
| Operate and evaluate the service | Permission-aware portfolio and in-app feed, owner budgets/retention policy/restore evidence, health signals, pinned self-host package, worker runner and opt-in retrieval/provider evaluation fixtures. | `src/service-controls-ui.js`, `deploy/`, `scripts/package-backend.mjs`, `docs/evaluation/` |

Schema 5 adds **26 record families** through one versioned lifecycle contract. Export/import, approved baselines, native histories and record-group file merging include those families. Schemas 1–4 retain their legacy semantics; unsupported future schemas reject. The encryption envelope remains unchanged. Keep originals because earlier app builds cannot read schema 5.

## Remaining implementation limits

These are open work or selected boundaries, not passing features hidden behind a completion percentage.

1. **Old incompatible returns:** earlier bases and returns are preserved, and a separate encrypted review copy can be inspected. A direct selected-record conversion wizard into new proposals is not implemented; recreation against the current master is manual.
2. **Long-lived archive offloading:** packing deduplicates snapshots without losing logical history. The ten-merge-parent bound remains. A validated archive-offload/import workflow that reduces the active master's archive count is not implemented.
3. **Provider connections:** selected adapters use administrator allowlists and backend credentials. OAuth consent/automatic refresh/account-selection wizards are not implemented. Actual tenant schemas, page access and expired/denied token behavior need validation.
4. **Test artifacts:** GitHub reads actual run/artifact metadata. Case-level proof comes from explicitly mapped actual results or bounded report files. Automatic artifact-content download/parsing across providers is not implemented.
5. **Notifications:** authenticated relevant in-app events and subscriptions are built. Digest preference is stored. Scheduled email/chat/digest delivery and external alert delivery are not implemented.
6. **Retention and operations:** the service records policy, alert ownership, budgets and restore evidence. Destructive pruning, automated backup verification and operational alert delivery are operator work. No recovery target has been measured.
7. **Recovery:** a separately encrypted point-in-time backup is built. Recovery-key wrapping of the active file is still an optional format spike. A snapshot cannot recover changes made after it was saved, and losing every secret remains unrecoverable.
8. **Document/media fidelity:** native text PDFs/DOCX, CSV and timestamped text are bounded. OCR accepts PNG/JPEG; audio accepts short PCM WAV. Scanned-PDF conversion, large/audio streaming, diarization, exact image coordinates and full proprietary document layout are not implemented.
9. **Meaning and quality:** graph paths and same-meaning/carry-forward decisions use recorded human review. No automatic semantic-equivalence/conflict engine or proven whole-system dependency discovery is claimed. NFR measures cover numerical operators and thresholds; complex statistical evaluation needs actual reviewed result interpretation.
10. **Evaluation completeness:** an opt-in retrieval/answer comparison harness and candidate development/holdout cases are built. Each other AI task still needs a separately labeled holdout. No actual model, real-team usefulness, accessibility/performance or competitor benchmark has been run for this checkpoint.

The planned native UI uses bounded registries/lists; full dashboard automation, continuous multi-user live editing, generalized task-tracker parity and company-wide crawling are outside the chosen delivery-context workflow. Project snapshots are conventional server plaintext authorized by membership. They are not end-to-end encrypted or a certified tamper-proof audit system.

## Setup and verification handoff

Manual use needs only the static build. Optional shared services require an approved Supabase environment, Auth accounts, backend deployment and worker operation; AI/connector/media paths additionally require their actual account credentials. No service, paid provider, external comment or test workflow was provisioned/executed during this build.

Use [deploy/README.md](deploy/README.md) for hosted/self-host installation, [AI_SETUP.md](AI_SETUP.md) for protected model configuration, and [docs/PHASE_2_NEXT_SESSION.md](docs/PHASE_2_NEXT_SESSION.md) for the test order. V01–V18 remain **not run** for the new code. The previous 0.4.0 results are historical evidence only.

Construction results: frontend/backend graph **41 modules linked**, packaged backend graph **18 modules linked**, **13 backend JS/TS files syntax-parsed**, static site assembled, backend package created with **34 consistent file hashes**, and whitespace checks passed. These checks executed no application logic or functional suite.

Build-only commands: `npm run check:static`, JavaScript/TypeScript syntax parsing, `npm run build`, `npm run package:backend`, and whitespace checks. Node syntax checking of `.ts` is not Deno type/module verification; static linking does not execute application logic; packaging does not start Docker or apply SQL.

## Engineering item status

Every row retains its original acceptance contract in the CSV. Counts describe implementation disposition, not passed features.

- **62**: Code built; validation deferred.
- **3**: Validation deferred.
- **14**: Partial build; validation deferred.
- **10**: Code built; external setup required.
- **2**: Participant evidence required.

| ID | Capability | Checkpoint status | Remaining work |
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
| P2-010 | Typed requirements and objectives | Partial build; validation deferred | Conflicting meanings need a recorded human question/decision; automatic semantic conflict detection is not built. |
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
| P2-030 | Change rehearsal | Partial build; validation deferred | Rehearsal captures an alternative and affected recorded dependencies; full simulated downstream regenerated artifacts are not built. |
| P2-031 | Reviewed same-meaning and carry-forward | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-032 | Reviewed change package and handoffs | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-033 | Master lineage and expected returns | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-034 | Safe round replacement and return review | Partial build; validation deferred | Old incompatible copy can be retained and inspected; direct selected-record conversion wizard into current-base proposals remains manual. |
| P2-035 | Capacity and responsiveness budgets | Partial build; validation deferred | Supported query/save/merge/reopen dataset budgets must be measured; no performance pass is claimed. |
| P2-036 | Lossless snapshot deduplication | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-037 | Table and transcript fidelity | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-038 | Bounded original attachments and archives | Partial build; validation deferred | Archive offload/reimport that safely reduces active merge parents is not implemented; ten-parent bound remains. |
| P2-039 | Release obligations and exceptions | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-040 | Build/deployment and rollout scope | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-041 | Applicable Support guidance | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-042 | Operational obligations and runbooks | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-043 | Production-to-product learning | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-044 | Sanitized role/customer reading exports | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-045 | Live protected AI deployment | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-046 | Versioned bounded AI tasks | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-047 | Labeled model/holdout evaluation | Partial build; validation deferred | Other AI tasks need separately labeled frozen holdouts; actual semantic scoring and correction-time measurements are unrun. |
| P2-048 | AI cost latency and routing controls | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-049 | Shared repository and asset model | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-050 | Authenticated project policies | Partial build; validation deferred | Project membership policies are built; organization-level group/directory administration is not implemented. |
| P2-051 | Transactional commands and conflicts | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-052 | Offline draft reconnect | Partial build; validation deferred | Stale drafts are retained for manual current-base proposal recreation; automatic reviewed rebase wizard is not implemented. |
| P2-053 | Durable bounded jobs | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-054 | Shared export restore and retention | Partial build; validation deferred | Full operational restore drill and automated backup/retention execution are not implemented or measured. |
| P2-055 | GitHub read adapter and stable references | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-056 | Retrieved run/build/deployment evidence | Partial build; validation deferred | GitHub artifact contents are metadata-only; actual case reports require separate bounded file import. |
| P2-057 | External field/status ownership | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-058 | Reviewed write-back framework | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-059 | Confluence selected-source adapter | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. OAuth consent/token-refresh wizard is not included. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-060 | Drive selected-file adapter | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. OAuth consent/token-refresh wizard is not included. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-061 | Azure work/test reference adapter | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. OAuth consent/token-refresh wizard is not included. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-062 | ClickUp work reference adapter | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. OAuth consent/token-refresh wizard is not included. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-063 | Bounded OCR/audio processing | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-064 | Permission-aware portfolio | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-065 | Ownership retention and restore controls | Partial build; validation deferred | Retention is recorded policy; destructive pruning and automated backup/restore execution are operator work. |
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
| P2-080 | Connected change notifications | Partial build; validation deferred | Digest preference stored; scheduled digest/email/chat delivery is not implemented. |
| P2-081 | Known issues and escalation paths | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-082 | Operational manifest monitoring and rollback criteria | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-083 | Passphrase continuity rotation and recovery option | Partial build; validation deferred | Recovery snapshot does not wrap the active project key or recover later changes; recovery-key format remains an optional spike. |
| P2-084 | Explicit cross-project dependencies | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-085 | Self-host packaging of the same backend | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-086 | Leased resumable jobs expiry and cost semantics | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-087 | Connector feedback-loop and access-loss safeguards | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-088 | Reusable edge-case and NFR templates | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-089 | Second-provider adapter and explicit comparison | Code built; external setup required | Configure approved real accounts/runtime; verify actual tenant/provider behavior. Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-090 | Authenticated receipts and approval authority | Code built; validation deferred | Exercise every original acceptance criterion and record V-gate evidence in the next session. |
| P2-091 | Shared-service health and recovery observability | Partial build; validation deferred | External alert delivery, automated backup monitoring and measured recovery objectives are not implemented. |
