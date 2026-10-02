# Product Relay — build in single-session waves

Updated 3 October 2026. Current shipped app: 0.2.0. Status: planning complete; implementation of these waves has not started. Next: **Wave 1**. Product direction: [BUILD_PLAN.md](BUILD_PLAN.md). Proof story: [DEMO_STORY.md](DEMO_STORY.md).

## How to read this schedule

One wave means one focused coding block in this chat, ending with a working, verified checkpoint. A block can include clarification and debugging; it is not a promise to consume exactly one chat turn, a whole five-hour usage window, or a fixed amount of time. The initial plan is **10 core sessions**, followed by separately chosen extensions.

Each session has a small must-finish scope, an optional stretch goal, a concrete check, and explicit deferrals. Stop adding features when the must-finish scope works. If a difficult change does not fit, save the safe checkpoint and name the remaining work for a follow-up session. Do not skip data-safety or authorization checks to preserve the session count.

This is a useful prototype plan. Production release certification, every connector, and broad performance guarantees are outside the core sessions. Existing encryption, source history, review, and file sharing remain functional throughout.

| Session / wave | Main result | What a user can do afterward |
| --- | --- | --- |
| 1 | Shared behavior records | Describe a product rule once, with conditions, evidence, owner, and release scope. |
| 2 | Document import | Bring a normal text PDF or DOCX into the existing source library and inspect extracted content. |
| 3 | Protected AI connection | Run one authenticated AI request through an optional backend, with credentials kept off the website. |
| 4 | First AI handbook | Turn selected sources into draft sections and questions, then review them. |
| 5 | Walkthrough reconciliation | Add a transcript, inspect conflicting statements, and record an owner decision. |
| 6 | Evidence-based answers | Ask about the current or an earlier approved baseline and inspect supporting passages. |
| 7 | Changes and suggested work | Compare a revised source, review the proposed behavior update, and see role-specific action suggestions. |
| 8 | Team follow-through | Record owners, acknowledgments, completion evidence, and stale work after a relevant change. |
| 9 | Safer shared files | Compare two project copies and merge supported independent edits with explicit conflict review. |
| 10 | Complete team demonstration | Run the whole handoff/change story, fix the main usability gaps, and publish a usable prototype checkpoint. |

**The central differentiator appears in Sessions 7–8.** Sessions 9–10 make it easier to use repeatedly. We can try the document-to-handbook flow after Session 4; do not wait for all ten sessions to collect feedback.

## Session 1 / Wave 1 — describe the agreed behavior

- [ ] Must finish: create one executable fictional PRD/SOP/walkthrough/change fixture with expected outcomes.
- [ ] Must finish: add a small backward-compatible behavior/decision contract: stable ID, actor, condition, outcome, applicability, source evidence, and review state. Add a safe migration if the bundle format changes.
- [ ] Must finish: expose those records in a simple editor/detail view and render applicable records consistently across team perspectives.

Check: a fraud-only rule and an ordinary cancellation rule coexist; an approved edit goes through review; the project exports and reopens without losing existing context. Keep the existing tests passing and add only tests needed for the new state transitions.

Stretch: show unresolved behavior questions on Overview.

Defer: broad TypeScript conversion, dependency visualization, templates for every industry, and a UI rewrite.

Saved result: the app represents a team's actual agreement, while all existing handbook sections still work.

## Session 2 / Wave 2 — import everyday documents

- [ ] Must finish: introduce bundling only as needed for dependencies, with a lockfile and an updated Pages build. Preserve the existing UI and domain modules.
- [ ] Must finish: support ordinary text PDFs with PDF.js and DOCX with Mammoth; normalize paragraphs/headings and preserve original-file metadata plus evidence locations.
- [ ] Must finish: provide an extraction preview, text correction, duplicate indication, and useful errors for unsupported or unreadable files.

Check: one supplied fictional PDF and DOCX import into the source library; citations survive export/reopen; derived document HTML cannot execute; malformed or oversized files preserve the current project. Validate actual browser behavior on the main supported browser.

Stretch: basic CSV table cells or SRT/VTT timestamps if parsing fits the session.

Defer: scanned-page OCR, arbitrary table fidelity, audio recording, and huge documents. Report these honestly rather than claiming successful extraction.

Saved result: a PM can start with the documents they already have, with visible extraction limitations.

## Session 3 / Wave 3 — connect one AI provider securely

- [ ] Must finish: build an optional Supabase function endpoint with authenticated user access and backend-only provider credentials. Manual portable use remains account-free.
- [ ] Must finish: add a small provider interface and the first OpenAI Responses adapter, with runtime output validation, timeout/error handling, and recorded model/input revision metadata.
- [ ] Must finish: add source-selection confirmation, request size/token limits, a basic server-enforced usage allowance, and a clear connection/configuration screen.

External inputs before live completion: approved API key and access to one backend project. Configure them through secrets, not chat text or committed files. Verify the actual available model ID and provider data policy at connection time.

Check: one live authenticated request succeeds; missing auth, invalid output, provider failure, or excessive input does not alter approved content. Inspect the built bundle to ensure it contains no provider secret.

Stretch: simple cancellation.

Defer: multi-provider routing, durable queues, elaborate billing, and background processing. Start with short explicit requests; preserve drafts on failure and require a user-visible retry.

Saved result: the app can use AI with a protected key. If access is unavailable, save the endpoint and fixture-tested adapter as an incomplete connection checkpoint; do not claim live AI or mark this session fully complete.

## Session 4 / Wave 4 — make the first handbook draft

- [ ] Must finish: extract behavior/section/question candidates from selected source passages, with conditions and exact evidence references.
- [ ] Must finish: show candidate drafts next to evidence; allow accept/edit/reject through the existing review mechanism.
- [ ] Must finish: keep approved content separate from unreviewed output, preserve manual changes, and retain input revision hashes.

Check: the fictional PRD produces useful drafts; an unsupported claim becomes a question; invalid citations are rejected; changing a source before accepting output exposes a stale-result warning. Include a small labeled set covering missing evidence and lost qualifiers.

Stretch: suggest a walkthrough agenda from unresolved questions.

Defer: producing a perfect full handbook for every document, embeddings, and 50-case provider benchmarking. A valid schema is not proof that the content is correct.

Saved result: a PM can move from original material to a reviewable handbook in one flow.

## Session 5 / Wave 5 — preserve walkthrough decisions

- [ ] Must finish: treat pasted/uploaded transcript text as a distinct source revision and extract relevant proposed clarifications.
- [ ] Must finish: display PRD/SOP/transcript disagreements with both passages and applicability; do not decide authority from recency alone.
- [ ] Must finish: let the owner record the resolution and generate an explicit handbook/behavior proposal, preserving the older baseline.

Check: an ambiguous “cancel immediately” does not override ordinary cancellation; the owner can approve the fraud-only exception for release 2; the unresolved interpretation stays visible until decided.

Stretch: parse SRT/VTT timestamps if Session 2 did not include them.

Defer: live meeting bots, reliable speaker identification, and automatic transcript approval.

Saved result: walkthrough answers become traceable decisions within the same project.

## Session 6 / Wave 6 — ask grounded product questions

- [ ] Must finish: add bounded retrieval over approved behaviors, handbook sections, and evidence using exact terms and existing relationships first.
- [ ] Must finish: generate answers with source links, selected baseline/release context, and explicit missing information.
- [ ] Must finish: reject stale or cross-project context, and separate pending proposals from approved answers.

Check: the same cancellation question gets the appropriate current and historical answers; unsupported rollback questions say what is missing; quotations open the correct original revision.

Stretch: show a “what changed since this baseline?” answer.

Defer: vector databases, global company search, endless chat memory, and claims of flawless reasoning.

Saved result: teammates can understand the product without asking the PM to repeat every explanation.

## Session 7 / Wave 7 — turn a change into proposed team work

- [ ] Must finish: compare a revised source and identify changed conditions/outcomes versus simple wording edits.
- [ ] Must finish: propose a behavior/handbook update with before/after evidence; preserve unrelated manual content.
- [ ] Must finish: suggest specific Product/Development/QA/Operations/Support actions with applicability, rationale, and completion criteria.

Check: the fraud-only change stays fraud-only; ordinary cancellation is not silently rewritten; QA scenarios are labeled suggestions rather than executed tests. A reviewer confirms impact before proposed work becomes required.

Stretch: reuse confirmed manual dependency links to improve suggestions.

Defer: automatic code impact discovery, external task creation, and cross-product propagation.

Saved result: the team sees what an approved change would mean for each person's work.

## Session 8 / Wave 8 — show what people actually checked

- [ ] Must finish: assign named owners and track accepted/in-progress/blocked/completed/not-applicable actions.
- [ ] Must finish: record change acknowledgment separately from completion and verification evidence, with behavior revision and environment/release qualifiers.
- [ ] Must finish: invalidate relevant old evidence after a confirmed rule change and add a simple delivery review showing missing work and reasons.

Check: acknowledging a change does not mark a test passed; changed fraud behavior makes its old evidence stale while unaffected ordinary-cancellation evidence stays applicable; portable export/reopen preserves actions and evidence.

Stretch: export a concise team handoff report.

Defer: authenticated audit identity, tamper-proof claims, percentage-based release-readiness scoring, and automated verification of linked artifacts.

Saved result: the PM/QA manager can explain what is agreed, who is acting, what was checked, and what remains unresolved. This completes the core differentiating story.

## Session 9 / Wave 9 — compare and merge portable copies

- [ ] Must finish: detect common project ancestry and present base/current/incoming differences for behavior, section, question, and action records.
- [ ] Must finish: merge supported independent edits and require owner choices for conflicts; preserve histories and create a new revision.
- [ ] Must finish: explain unsupported merges, absent ancestry, incoming approved changes, and newer file formats without overwriting the master.

Check: two fictional copies with independent updates merge and reopen; two conflicting decisions require review; deletion/archive conflicts are visible; a failed merge leaves the original intact.

Stretch: show a concise merged-change summary.

Defer: simultaneous cloud editing, distributed locking, and automatic resolution of contradictory business decisions. Unsupported record combinations remain explicit manual-review cases.

Saved result: PM file sharing is more useful when teammates return edits.

## Session 10 / Wave 10 — make the full story usable

- [ ] Must finish: run the complete PRD → walkthrough → agreed baseline → revised source → role actions → verification → shared file story.
- [ ] Must finish: repair the biggest onboarding, progress, empty-state, import, review, and error-flow problems found in that story.
- [ ] Must finish: update truthful feature documentation, retain a fictional demo, and publish the verified prototype with a saved continuation checkpoint.

Check: use the deployed application for the complete story; verify file preservation, source links, role consistency, and main keyboard journeys. Record what was tested and what still needs browser/security/performance hardening. Collect representative feedback if available; otherwise label usefulness targets unmeasured.

Stretch: a short demonstration recording or clearer role handoff export.

Defer: formal production certification, every browser/device, large-scale load guarantees, enterprise authentication, and mandatory integration support.

Saved result: a coherent prototype the delivery team can try, with obvious value and an honest limitations list.

## Separately scheduled extensions

These are the selected long-term direction, not requirements for completing the ten-session portable prototype. Each is split into a new session plan when we reach it, using observed complexity rather than claiming one session can finish the entire feature.

| Extension | First bounded session | Additional work that remains |
| --- | --- | --- |
| Shared projects | Sign in, create one project, and grant two test users access through server policies. | Canonical cloud records, conflict-safe commands, offline proposals, scoped exports, membership revocation, backups, and operations. |
| Google Drive | Select and read one authorized file, retain its external revision, and refresh manually. | Access-loss handling, disconnect, private token storage, generated-output publication, and reconciliation. |
| Other platforms | Choose one actual available tenant; fetch selected Confluence pages, Azure work items, or ClickUp tasks. | Each platform's authorization, format coverage, update/delete behavior, write permissions, and real live validation. Build one connector at a time. |
| AI resilience | Add a durable job for one long-running extraction and test resumption/idempotency. | Queue leases, bounded retries, quotas, provider comparison/fallback, expiry and operational monitoring. |
| Difficult documents | Add a reviewed OCR path for one scanned page. | Languages, mixed scans, larger files, difficult tables, audio transcription, and extraction-quality measurements. |
| Production hardening | Choose the pilot's highest-risk failure and build its targeted controls/checks. | Cross-browser/accessibility/security audits, concurrency/load testing, backup/restore, self-host packaging, and deployment operations. |

## Save after every session

Record the session number, actual user-visible result, changed files/commit, relevant checks, real limitations, pending access, and the next session's first action. Keep the working app and export compatibility intact. Usage limits change how far a session gets; they cannot reliably predict a number of completed features. If interrupted, finish or safely checkpoint the current unit before adding scope.

Current state: **0 of 10 core sessions implemented**. Existing release 0.2.0 is the foundation, not Session 1 completion. Planning documents do not imply working future features.
