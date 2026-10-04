# Product Relay: live review from six delivery roles

**4 October 2026 · Product Relay 0.4.0 · Recommendation: fix reliability and reduce upkeep before a team pilot.**

The useful core is clear: preserve an agreed product rule, the work based on it, and the original evidence; when the agreement changes, show which work needs another review. The current live build is not dependable enough to become a team's shared product record. This review found a reproducible failure in sharing and recovery, plus misleading review summaries.

## What was actually evaluated

I used [the published app](https://aravin4d.github.io/product-relay/) to create **Product Relay — internal pilot review**. The real product was Product Relay itself, using its actual README and implementation checkpoint at repository commit `2c3a4e0`. The application code deployed was `14aa485`.

Six named reviewers were explicitly labeled as simulations: Product, QA, Development, BA, Support, and Operations. The BA had to use the Product role. These are role-based expert assessments, not interviews with six people or feedback from a paying customer. No private company documents, actual customer data, or real meeting transcript were available. A proposed future requirement was clearly labeled as an exercise, not a shipped feature or an approved request from Aravind.

The live exercise created:

- Three context sources: actual sharing SOP excerpts, actual verification limitations, and one explicitly simulated future requirement.
- Two approved descriptions of actual 0.4 behavior: sharing-round ancestry and local recovery versus portable export.
- Six scoped actions: five roles for sharing, and one separate QA control for recovery/export.
- A concrete QA task, a separate scope acceptance, and one acknowledgment. Nothing was falsely marked completed or passed.
- One preserved baseline with applicable action snapshots.
- One quoted statement, recorded interpretation, pending rule proposal, and separate acceptance of the **simulated future specification**.
- One approved support section describing current 0.4 behavior.

I inspected all six perspectives, current and historical lookup, the project summary, sharing-round preparation, and recovery reopening in a second tab. Competitor comparisons use current official documentation; I did not run a paid trial of each competitor. No live AI provider, connector, large-team deployment, or complete accessibility/security audit was tested.

## What worked and why it matters

| Live observation | Practical benefit | Boundary |
| --- | --- | --- |
| A quoted statement created a separate proposed change; the existing agreement stayed intact until acceptance. | Product and BA can distinguish a discussion from an agreed requirement. | A person still decides what the passage means. |
| After the simulated sharing rule changed, all five linked role actions needed review. The separate recovery/export action did not. | QA and delivery leads can find affected work without reopening every unrelated task. | This is comparison of manually recorded scope, not discovery of impacts from code or unstructured documents. |
| The QA task kept its original rule revision, owner, criteria, and receipt. Updating status was disabled while its rule scope was stale. | Prevents silently treating an old task as work against the new expectation. | It does not prove that implementation or testing happened. |
| Historical lookup showed the original 0.4 outcome and its original SOP, while current lookup showed the simulated future scope. | Useful when answering what was agreed before a walkthrough or earlier release. | Release/environment applicability remains text that readers must interpret. |
| Selecting each role reduced the visible work to that role. | Support and Operations can read a smaller handoff. | Selecting a named person shows their role's work, not just their own assignments. |

The strongest potential saving is **avoiding repeated clarification and rework after a decision changes**. The exercise did not establish a number of hours saved or a reduction in escaped defects.

## Three concrete defects

### REL-001 — Blocker: valid authored history fails sharing and recovery

**Live result:** after authoring rules and accepting the walkthrough proposal, starting a sharing round failed with `Invalid original rule comparison.` A second live tab could decrypt the recovery copy with the correct demonstration passphrase but could not open the project: the same validation error appeared.

The encrypted content was not shown to be lost or cryptographically corrupted. The application rejects the decrypted history. Saving reported success in the active tab, which makes the reopening failure particularly serious. The browser did not expose a completed download path, so this review does not certify retention of a file on disk.

**Reproduction:** create a rule, approve it, capture a statement against it, create and accept a rule proposal, normalize/save, then normalize/reopen again. The first import passes; the second import and sharing preparation fail.

**Confirmed cause:** `src/reconciliation.js` compares snapshots using `JSON.stringify`. Rule cleaning changes the insertion order of the `evidence` property, while the walkthrough's original snapshot retains its earlier ordering. The two objects have identical values but different serialized key order. The validator treats them as different agreements.

This is a defect in normal authored workflows, not merely a malformed imported file. Existing prepared examples can hide it. The earlier test suite checked some single round trips but missed this repeated save/reopen path.

**Fix direction:** compare structured values independently of object property order and normalize linked snapshots consistently. Preserve validation of IDs, revisions, quotations, and decision relationships. Add repeated save/reopen and encrypted recovery checks after both newly authored and imported rules. Do not fix this by disabling history validation.

Evidence: [sharing failure](sharing-validation-failure.png), [recovery failure](recovery-validation-failure.png), [diagnostic result](repro/regression-result.json). The original diagnostic script and generated fixture remain in the local review workspace; this archive retains their diagnostic result. Phase 2 P2-004 adds the repeatable repair regression to the repository test suite. The generated regression file is public test material, not an export of the live evaluation project. Its demonstration passphrase is `relay-review-regression`.

### REL-002 — High priority: Change review omits product-rule proposals

Immediately after a walkthrough created a pending rule proposal, **Change review** displayed **No proposals in this view**. **Product rules** simultaneously displayed **1 awaiting review**. Change review currently handles handbook proposals only; its navigation badge also counts that collection only.

The proposal was preserved, but its location is surprising. A delivery lead checking the apparently central review screen can miss it.

**Add:** one review queue for rule proposals, handbook proposals, task updates, unresolved interpretations, and stale evidence/work. Clearly label each type and link to the actual decision screen. Alternatively, rename narrow screens so their scope is unmistakable.

Evidence: [empty Change review](change-review-empty.png).

### REL-003 — High priority: Overview says caught up while five actions need review

After the simulated change was accepted, **Overview** showed **Review queue 0** and **All caught up**. **Delivery review** showed **Needs review 5**. The overview's attention logic does not include these affected actions.

The overview is not advertised as a release-readiness score, but this wording still gives a misleading management impression.

**Add:** a shared attention model that includes affected work, pending task decisions, missing current owner receipts, and verification gaps. Show the reasons and scope; do not invent a percentage ready to release.

Evidence: [Overview](overview-misses-stale-work.png), [QA affected work and unchanged control](qa-selective-impact.png), and the saved [six-role observations](live-role-observations.json).

## Individual role feedback

### Product lead

**Where it helps:** preserve the first agreement, distinguish an owner's interpretation from a proposal, and explain why a requirement changed. In a mid-sprint scope dispute, the old wording and source are more useful than a meeting summary alone.

**Pain:** the PM becomes the operator of the whole system: import documents, structure rules, approve them, decide affected roles, maintain handbook text, distribute files, and reconcile returns. There is no live connection to the backlog or document system. The incomplete review screens make that responsibility harder.

**What I would add:** a guided intake/review flow, bulk candidate review, one decision queue, business objective and success measure fields, and a clear distinction between proposed, agreed, and actually released behavior. Start with issue links and portable change summaries; add a connector only after choosing a real pilot team's tools.

**Adoption view:** useful for ambiguous changes and handoffs once reliability is fixed. I would reject it if every routine story required maintaining another specification and task system.

### QA lead / QA manager

**Where it helps:** this is the strongest role fit. A QA task keeps the expectation and scope it was planned against. The exercise correctly flagged the sharing task while leaving the recovery control untouched. This could reduce arguments about whether an earlier check still applies.

**Pain:** the generated QA criteria were generic; I had to replace them with concrete same-round, old-round, and non-mutation cases. There are no reusable test cases, executable runs, automatic result ingestion, typed defect/build links, or dependency-based regression selection. A pass entry and an artifact URL are self-reported evidence. Exact scope comparisons can flag equivalent wording changes; unrecorded or indirect impacts can be missed.

**What I would add:** requirement-to-test-case and build/run links, imported result provenance, a current evidence matrix by release/environment, reviewed edge-case suggestions, and risk/exception decisions. Keep receipt, work completion, and verified outcomes separate.

**Adoption view:** good as context for what needs rechecking. It cannot replace the team's test manager or prove release quality today. The recovery defect blocks even that narrower pilot until fixed.

### Development lead

**Where it helps:** inspect the exact before/after expectation and the reason for the change before implementing a misunderstood request. Original evidence can resolve a dispute without another meeting.

**Pain:** a role template repeats the rule; it does not identify affected services, APIs, code, feature flags, compatibility constraints, or migrations. There are no linked PR/build updates or dependency relationships. Developers would have to update their issue tracker and this project file separately.

**What I would add:** typed links to a story, PR, build, and deployment; component/dependency links; a concise change contract; and explicit unknowns with owners. Use AI to propose affected areas with evidence and confidence, then have developers confirm them. Do not present guesses as discovered code impact.

**Adoption view:** I would use it if the relevant change context appears from my existing work item. I would resist another mandatory place to report status.

### Business analyst

**Where it helps:** actor, condition, outcome, applicability, exact evidence, and preserved interpretations form a useful foundation for requirement analysis. The walkthrough comparison avoids treating the newest statement as automatically authoritative.

**Pain:** BA is not an available role. Mapping BA to Product produced the Product lead's same task view. There is no structured glossary, decision table, requirement hierarchy, linked exception model, nonfunctional requirement template, or dependency matrix. Sources still need human interpretation, and rules and handbook sections are separate maintained records.

**What I would add:** configurable roles; requirement types; business vocabulary and aliases; decision tables for conditions/exceptions; relationships among rules and derived guidance; and bulk source-backed review. Do not force performance, accessibility, retention, and operational requirements into one behavior template.

**Adoption view:** useful for a bounded feature with unclear decisions. Large complex specifications would need substantially more modeling and intake support.

### Support lead

**Where it helps:** role-specific guidance, original decisions, and historical agreements can explain why customers on different releases see different behavior. Keeping an escalation question unresolved is better than presenting a fabricated answer.

**Pain:** a support reader must obtain the latest file and know the vocabulary. **Is it safe to reset a handoff?** returned no approved context; **sharing** retrieved the relevant rules. This was a visible limitation of local term matching. Existing source documents do not automatically become approved support guidance. There is no ticket integration, change notification, customer-safe export, or reliable selection of the customer's actual release.

**What I would add:** a short approved support briefing, customer version/environment filters, known issue and escalation links, plain-language aliases, and a clear changed-since-last-file view. Publish separately reviewed customer-safe material; a role filter does not redact the full project.

**Adoption view:** useful as approved reference material. It needs much lower reading and freshness friction to become a daily support tool.

### Operations lead

**Where it helps:** a behavior change can carry rollout, rollback, monitoring, and runbook work with an owner. Historical scope helps explain the intent of an earlier release.

**Pain:** these are suggested/manual records, not deployment evidence. Environment and release are text fields. There are no deployment manifests, feature-flag states, monitoring links, rollback validation, incident connections, or authenticated operational approvals. Portable files also need a real backup and ownership process. The live recovery failure is a direct operational concern.

**What I would add:** structured release/environment entities, linked deployment and incident evidence, a reviewed rollout checklist, measurable rollback criteria, and a tested file backup/recovery procedure. Retain the static app for portable use; infrastructure automation belongs in a separately authorized connected mode.

**Adoption view:** useful for preparing a handoff after the file lifecycle is reliable. It cannot be the operational control plane or production sign-off record.

## Feedback as one delivery team

The product addresses a real coordination gap: **What did we agree, why did it change, and whose previous work now needs review?** Teams often have the pieces in different places. One explicit history can reduce repeated explanations and stop obsolete work being treated as current.

The present workflow may move effort onto the PM and BA rather than reduce total team effort. Document intake, rule authoring, task refinement, separate approvals, receipts, baselines, exports, file circulation, and return review all have a cost. The five role checkboxes started selected, which makes it easy to generate unnecessary work. A named perspective is a role view, so there is no focused personal inbox either.

The biggest team-wide gaps are:

1. **Dependable persistence:** a saved project must reopen and remain shareable after ordinary authored changes.
2. **One trustworthy attention view:** all decisions and affected work must appear consistently.
3. **Less duplicate maintenance:** record a change once, link derived guidance and existing work, and review suggestions together.
4. **Freshness and ownership:** show which baseline/file the reader has, what changed since their last view, who maintains the master, and which returns are outstanding.
5. **Connected evidence:** link the agreement to actual work, tests, code, and releases instead of duplicating status reporting.
6. **Selective impact:** direct links work today; indirect dependencies and semantic interpretation need reviewed modeling and validation.

File mode is a deliberate compromise that meets the GitHub-hosting requirement. Improve it first with a return manifest, master revision label, export confirmation, history inspection, and clear recovery guidance. Simultaneous editing and push notifications cannot be made reliable merely by adding UI to a static encrypted file; they require a shared service or an explicitly connected storage workflow.

## Company perspective

**Potential value:** reduce context loss during staff changes, lessen repeated clarification, retain reasons for product decisions, and make change reviews easier to audit internally. Static manual use needs no team account or mandatory inference, and project contents stay local unless shared or deliberately sent to the optional AI gateway.

**Current concern:** this review did not prove productivity gains, enterprise reliability, model quality, or governance. Everyone with the file/passphrase can read the whole project. Names and approvals are self-reported; selecting a person is not authentication. Former recipients can retain old copies. Conventional encryption does not make the format readable only by this app. A company must own backups, passphrase handling, master-file coordination, and application maintenance.

**Adoption risk:** an unmaintained copy becomes another stale knowledge source. A PM departure or a forgotten passphrase can disrupt continuity. The existing size/archive limits bound long-running projects, and complete parent archives consume capacity. Optional AI adds backend/provider setup and operating costs; static hosting does not make that part free.

**Decision today:** do not adopt this live build as a team's dependable record while REL-001 remains. After the defects are fixed, pilot one active feature with one master owner and real participants. Broader adoption needs authenticated access, revocation, organization-managed storage/recovery, tested migrations, and connected work evidence. Regulatory-grade audit or release authority would need a separate, much stricter validation effort.

## Comparison with current alternatives

These comparisons are based on documented capabilities checked on 4 October 2026. Plan availability and configuration affect the result. They do not establish which product gives better AI answers on the same inputs.

| Alternative | Its advantage over Product Relay | Product Relay's possible advantage | Honest fit |
| --- | --- | --- | --- |
| **Confluence + Jira + Rovo** | Linked PRDs/work items, shared knowledge, cross-tool search and AI actions. Rovo respects source permissions. | A portable encrypted project with explicit rule/task scope history, usable manually without a tenant. | Complement an existing stack with a focused change review; replacing its collaboration/work management would be a large undertaking. [PRD documentation](https://www.atlassian.com/software/confluence/templates/product-requirements), [Rovo capabilities](https://support.atlassian.com/rovo/docs/chat-actions/), [Rovo search](https://support.atlassian.com/rovo/docs/explore-rovo-features/). |
| **Azure DevOps + Test Plans** | Traceability across work items, code, builds, test cases/results, and releases; connected evidence is far stronger than manual links. | Easier portable narrative context before work items are fully formed, with role views and original interpretations. | For a team already on Azure DevOps, Relay must add clearer requirement context without creating another status system. [Microsoft traceability documentation](https://learn.microsoft.com/en-us/azure/devops/cross-service/end-to-end-traceability?view=azure-devops). |
| **ClickUp + Brain** | Shared task/document/conversation context and AI workflows inside the workspace. | Explicit preserved agreement versus discussion, scoped stale work, and portable manual operation. | General team productivity is already a crowded space. Relay's case must be narrower and measurable. [ClickUp Brain documentation](https://help.clickup.com/hc/en-us/articles/12578085238039-What-is-ClickUp-Brain-AI). |
| **Jama Connect** | Structured requirement relationships, test traceability, change impact, and downstream suspect flags. | A lighter setup for a bounded delivery handoff, with static hosting and an encrypted file. | **Closest conceptual competitor.** Change impact and suspect downstream work already exist; the differentiator would be usability and reduced administration for ordinary software teams. [Jama requirement/test relationships](https://help.jamasoftware.com/ah/en/getting-to-know-jama-connect-features/traceability-from-requirements-to-test.html). |
| **Qase** | Test design/execution, result records, reporting, and integrations with work trackers, CI, and test frameworks. | Product-to-Support/Operations interpretation and handoff, extending beyond QA activity. | Pair the context with actual test results. Do not claim a replacement for a test manager. [Qase product](https://www.qase.io/product/), [integrations](https://www.qase.io/integrations/). |
| **NotebookLM / Gemini Notebook** | Source-based AI understanding with broader supported source formats and Drive source updating. | Preserved approved behavior, task scope, owner decisions, and downstream review states rather than only document understanding. | Source-based Q&A is not a differentiator by itself; Relay needs to prove the follow-through after the answer. [Google source documentation](https://support.google.com/gemininotebook/answer/16215270?hl=en). |

**The idea is useful, but it is not a new market category.** Requirement traceability, baselines, cited knowledge, change impact, and role work are established capabilities. Product Relay's potential is making their combination simpler and more portable. That is a positioning hypothesis, not a demonstrated market advantage.

## Definite improvement order

| Stage | Deliverable | Exit criterion |
| --- | --- | --- |
| **1. Repair trust** | Fix REL-001; unify proposal/attention summaries; validate export/recovery across repeated cycles; keep genuine altered-history rejection. | A newly authored project survives create → approve → walkthrough → change → save → close/unlock → share → return/merge → reopen. Summary counts agree with their detail screens. |
| **2. Reduce upkeep in portable mode** | Guided intake and bulk review; configurable roles and a personal work filter; selective role defaults; linked derived guidance; file revision/return tracking. | Real participants can maintain one changing feature without repeatedly entering the same information or depending on the PM to interpret every screen. |
| **3. Connect to work already happening** | Typed links first; then one chosen tracker/document connector and test-result ingestion. | One reviewed change reaches the relevant existing work item and evidence returns with known provenance. Document ownership and conflict handling are explicit. |
| **4. Validate useful AI** | Deploy the protected gateway; evaluate extraction, interpretations, synonyms, unknowns, and current/historical answers on real representative documents. | Qualifiers and baseline selection are preserved; unsupported statements remain unknown; humans can review differences and reject bad proposals. Actual costs/latency are measured. |
| **5. Expand company use when justified** | Authenticated shared mode, controlled access/revocation, reliable backup/migrations, connected notifications and operational evidence. | Real simultaneous collaboration and company governance needs are met without claiming portable file receipts are authenticated sign-offs. |

Stages 3–5 should follow demonstrated demand. Adding more AI or connectors before making persistence and the attention view trustworthy would not solve the present blockers.

## How to prove it saves work

After Stage 1, run a pilot over at least two actual product changes and one handoff. Have real people in the six roles review the same before/after expectations. Compare their normal workflow with Relay using similar changes, accounting for feature complexity.

Measure total team time spent finding context, clarifying expectations, updating duplicate records, reviewing affected work, and reconciling files. Also count missed qualifiers, missed affected work, unnecessary reopened work, conflicting copies, and stale guidance. Include onboarding and the PM/BA's extra effort.

**Net time saved = avoided clarification/search/rework time − added authoring/update/file-coordination time.** This is a measurement definition, not a savings claim. Do not infer a reduction in escaped defects from a short pilot.

The decision to continue should be based on real users returning voluntarily and a repeatable reduction in total work, with no loss of qualifier accuracy or file reliability. If it only makes the PM maintain another project tracker, simplify the scope before adding features.

## Review artifacts and status

All findings are open. Application code was not changed or deployed during this review. The repository remains at its prior clean checkpoint. The active live evaluation was kept open; its exported/recovery data can hit REL-001 until repaired. Existing user projects were not edited or deleted.

The generated regression fixture and diagnostic script are separate public test artifacts. The live app reported a file update, but a retained operating-system file path was not verified. The six-role observations, screenshots, and prioritized CSV provide a durable record of the evaluation even if the live recovery copy cannot currently reopen.

Prior successful automated checks remain useful, but they do not override these observed end-to-end failures.


Archive note: copied for Phase 2 feedback traceability. Artifact links were made relative and the local diagnostic command was replaced with an archive-location note. Review conclusions are unchanged. All findings remain open until corresponding implementation checks pass.
