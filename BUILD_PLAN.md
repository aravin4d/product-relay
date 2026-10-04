# Product Relay — product direction and selected build path

Updated 3 October 2026. Future features described here are planned, not implemented. Current checked prototype: 0.4.0. Waves 1–2 are implemented; see [BUILD_STATUS.md](BUILD_STATUS.md) for tested progress and the pending live AI setup. Execution schedule: [10 single-session waves](BUILD_WAVES.md). Demonstration: [DEMO_STORY.md](DEMO_STORY.md).

## The product we are building

**Help the entire delivery team see what is agreed, what changed, who needs to act, and what has actually been checked.**

PRDs, SOPs, transcripts, and notes supply the original context. Product Relay turns that material into reviewed behavior, preserves owner decisions and earlier baselines, and connects an approved change to role-specific actions and verification evidence.

The useful record is qualified behavior: “For release 2, cancellation immediately revokes access for fraud-flagged workspaces; ordinary cancellation retains access until the paid period ends.” Each rule has conditions, applicability, supporting passages, review state, and linked work. A document being approved does not prove the behavior was implemented or tested.

The working scope is **a useful portable prototype built in 10 focused sessions**. Each session leaves a working checkpoint. Shared infrastructure, broad connector coverage, and production certification are later extensions. The session count is an initial scope allocation; difficult changes or missing access can require follow-up sessions.

## The differentiator and how we will prove it

The delivery problem is inconsistent interpretations: a rule is written in a PRD, qualified in a walkthrough, changed later, and acted on differently by Development, QA, Operations, and Support.

Product Relay's proposed distinction is this complete workflow:

1. Preserve the original evidence and show disagreements instead of hiding them in a summary.
2. Record one qualified, owner-reviewed behavior shared across role views.
3. Explain the impact of a later change and propose concrete work for each affected role.
4. Track acknowledgment separately from completion and verification.
5. Reopen relevant work when its underlying behavior changes, while preserving unaffected evidence.
6. Carry all that context in one encrypted project file before requiring a shared service.

Example: a fraud-only cancellation change suggests an implementation check for Development, regression scenarios for QA, rollout/rollback checks for Operations, and revised guidance for Support. Older evidence about the changed fraud path becomes stale; ordinary-cancellation evidence remains applicable. The QA manager can see remaining checks and owners.

This combination is a positioning hypothesis, not a claim of market exclusivity. [Rovo](https://www.atlassian.com/software/rovo) offers search, chat, agents, and connectors; [Slite](https://slite.com/help) documents AI assistance and document verification; [Jama](https://www.jamasoftware.com/solutions/requirements-traceability/) covers relationships, change impact, reviews, and verification coverage. We should prove that our simpler handoff-to-action workflow removes repeated work for ordinary delivery teams. Do not present individually established features as new inventions.

## Benefits by person

| Person | Useful result |
| --- | --- |
| PM / Product | Clear agreed behavior, unresolved decisions, evidence, and assigned reviewers. |
| Development | Changed expectations, supplied dependencies, suggested implementation checks, and unresolved assumptions. |
| QA | Expected outcomes and exceptions, suggested scenarios, evidence tied to release/environment, and changes needing revalidation. |
| QA manager / delivery lead | Named ownership, missing decisions, outstanding actions, and verification gaps with explanations. |
| Operations | Applicable rollout, rollback, monitoring, and runbook actions. |
| Support | Approved customer behavior, exceptions, escalation, and role-appropriate reading. |
| New teammate | Current understanding, earlier decisions, original context, and source-grounded answers. |

## Normal user journey

Start with whatever exists: a draft PRD can be enough. Add product scope and owners, import sources, inspect extraction, and select what AI should process. Review proposed handbook sections and questions alongside evidence; save an agreed baseline. After the walkthrough, add notes/transcript, resolve disagreements, and review explicit updates. Later revisions propose qualified changes and role actions. People record their work and attach evidence; relevant changes make old evidence stale. Share the latest `.relay` file and its passphrase separately.

The handbook is derived from shared approved records. Different role views must not invent incompatible versions of the same rule. Names and locally recorded approvals remain self-reported in portable mode.

## Alternatives considered

| Approach | Tradeoff | Decision |
| --- | --- | --- |
| Browser-only manual app | Easy GitHub hosting and private local work; no semantic automation. | Preserve as the fallback. |
| Browser directly calls AI with a key | Quick experiment, but exposes a powerful credential to frontend code and complicates team budgets. | Exclude from the supported path. |
| Browser local model | Potential offline inference; device/download/memory and quality constraints need evaluation. | Optional later adapter. |
| Portable projects + protected AI gateway | Retains simple file sharing while adding controlled AI processing. | Selected core path. |
| Shared database from the beginning | Enables permissions/collaboration, but increases setup before proving usefulness. | Separate follow-up after the portable story works. |
| Self-hosted service | Organization controls deployment; takes responsibility for operation and upgrades. | Later packaging of the same domain/backend design. |

## Definite technical path

Keep the existing vanilla JavaScript UI/domain modules and GitHub Pages. Add bundling and a lockfile when document-parser dependencies need them. Use explicit versioned contracts and runtime validation; migrate modules to TypeScript only where helpful. A framework rewrite is not required for the prototype.

Use [PDF.js](https://mozilla.github.io/pdf.js/) for ordinary PDFs and [Mammoth](https://github.com/mwilliamson/mammoth.js) for DOCX. Preserve source locations and original material within documented size limits. Sanitize converted content and block external fetching. Preview ambiguous extraction; OCR, arbitrary table fidelity, and audio processing are separately scheduled extensions.

Preserve encrypted `.relay` files and encrypted local recovery. Add a new format version when needed, read existing files, back them up before migration, and reject unsupported newer formats rather than stripping their data. A file merge compares common ancestry and stable record IDs. Unsupported or contradictory changes require explicit review.

Use **Supabase as the single optional backend**: Auth and Edge Functions for the initial AI gateway; Postgres, private Storage, and queues when shared mode and durable jobs are added. Manual use remains account-free. Hosted functions have finite CPU, memory, and duration limits, so initial requests are short and document parsing stays in browser workers. Split long jobs into bounded tasks when the durability extension is built. [Functions](https://supabase.com/docs/guides/functions), [runtime limits](https://supabase.com/docs/guides/functions/limits), [queues](https://supabase.com/docs/guides/queues).

Implement an **OpenAI Responses provider adapter first**, with schema-constrained candidates and application validation. Choose the exact supported model/settings using official documentation, account availability, and representative tests when credentials are available. Do not assume a Codex model label is an API model identifier or promise superiority over another model. Add Anthropic comparison/fallback later through the same interface; provider changes require an explicit configured choice.

Start retrieval with exact terms, approved records, relationships, and nearby evidence. Add embeddings only if measured answer quality calls for them. Reprocess changed context rather than repeatedly sending the entire project. [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) helps enforce shape; it does not establish the truth of an interpretation.

## What must be preserved in the data

| Record | Essential context |
| --- | --- |
| Source revision | Original content/hash, owner/type, normalized blocks, extraction warnings. |
| Evidence | Exact revision, quote, and page/paragraph/cell/transcript location. |
| Behavior | Stable ID, actor, condition, outcome, exclusions, release/environment/customer applicability, evidence. |
| Decision | Proposed/approved/disputed/superseded state, owner, rationale, exact base revision. |
| Team action | Exact behavior revision, audience, owner, status, acceptance criteria, reason. |
| Verification | Supplied artifact/result, author, release/environment, applicable/stale/unverified state. |
| Baseline | Approved records and decisions as known at that point. |
| AI run | Selected scope, input hashes, model/prompt/schema version, validation, usage, outcome. |
| Merge/sync | Parent revision, stable IDs, conflict choices, and command IDs when shared mode exists. |

Source authority is an explicit owner decision about an issue; recency alone does not settle it. Intended, implemented-as-reported, and verified behavior are separate states. An acknowledgment is not proof of a completed action. A test result for release 1 is not automatically valid for release 2.

## Minimum protections remain in the prototype

Provider keys stay in backend secrets, never the website, public repository, or project files. Verify authenticated sessions and apply request/usage limits server-side. Present the selected sources/provider before sending content. AI processing receives selected plaintext context; it is not end-to-end encrypted inference. Never send the file passphrase or vault key.

Avoid request bodies in logs and minimize persisted processing data. Use `store: false` where supported, while explaining that it is not a universal zero-retention guarantee. Provider monitoring and feature-specific policies still apply. Confirm suitability before processing real company documents. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [backend secrets](https://supabase.com/docs/guides/functions/secrets), [authentication](https://supabase.com/docs/guides/functions/auth).

Treat imported instructions as source content, not authority to change prompts, permissions, or call tools. Validate quotations, revision IDs, output schemas, and qualifiers. Do not apply a result to a different input revision. Human review remains necessary even when quotations are valid.

Recipients with a portable file's passphrase can read its entire contents; role views are filters. Add optional user-held recovery keys and known-passphrase rotation later; these cannot reconstruct a key already lost. Local history is not an authenticated or tamper-proof audit.

## Core-session checks and usefulness

For each session, preserve the existing working journeys and check the changed behavior with a relevant fixture or browser journey. Tests target data loss, stale revisions, unsupported evidence, unsafe markup, and permission failures where applicable. Record actual outcomes; mock providers cannot certify a live AI connection.

Use the fixed story in [DEMO_STORY.md](DEMO_STORY.md): before-walkthrough context, an ambiguous clarification, a qualified fraud-only change, affected team work, stale versus unaffected evidence, and an earlier baseline. The full story should work by Session 8 and be easier to repeat after Sessions 9–10.

Try the document-to-handbook flow after Session 4 and collect feedback early. Proposed pilot measure: preparation/reconciliation time compared with the team's current method, repeated clarification questions, missed exceptions, incorrect conclusions, and reviewer effort. A 30% time reduction is a target to test, not a promised result. Do not measure usefulness by generated word count or model confidence.

## Later scope: useful extensions, not hidden requirements

After the portable prototype, split these into separate bounded sessions:

- Shared accounts/projects, server-enforced tenant/project access, transactional revision checks, offline proposals, revocation, scoped exports, authenticated receipts, and backup/restore. Realtime signals trigger refresh; they do not resolve conflicts. Portable names never grant server permissions. [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Google Drive selected-file read/refresh first, then one of Confluence, Azure DevOps, or ClickUp when an actual test tenant is available. Add explicit publication separately, with destination revision/diff checks. Timeouts are not deletions; lost access invalidates answer context. Exclude app-generated outputs from source ingestion. [Drive file-scoped access](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).
- Durable queues, leased jobs, idempotency, resumable processing, cancellation, expiry, advanced spend controls, and provider comparisons. Queue delivery does not make application writes or provider billing exactly-once.
- OCR, stronger table handling, transcription, large-project indexes, explicit cross-product dependencies, and measured performance. No whole-company crawling or guessed dependency propagation.
- Broader labeled AI evaluations, cross-browser/accessibility/security tests, concurrent editing/load checks, operational monitoring, recovery drills, and self-host packaging. [Self-host guidance](https://supabase.com/docs/guides/self-hosting/docker).

Shared mode will use server-managed processing and encryption at rest, with server authorization. Do not call it zero-knowledge storage. Revoking a member cannot retrieve an already downloaded copy. Restricted cloud exports must enforce permissions and identify partial bundles; they cannot become complete masters through a merge.

## Effort and external inputs

Plan for **10 core coding sessions initially**, with further sessions for extensions and unexpected repairs. Session scope is more useful here than production engineering-hour estimates. This is not a guaranteed ten-session delivery date; actual throughput depends on complexity, available usage, and account access.

Before Session 3 live completion, provide access to one backend project and an approved API key through a secrets mechanism. Before integration sessions, provide a test account/tenant. Before usefulness claims, supply authorized representative material and feedback. Fictional fixtures allow the rest of the prototype to develop without company data.

Runtime costs are separate from coding-session usage: provider tokens, backend/storage/egress, optional email/transcription, and any source-platform subscriptions. Verify current pricing and measure actual consumption before quoting a monthly budget. [Supabase pricing](https://supabase.com/pricing).

At each session boundary save the code, relevant checks, actual feature status, known limitations, and exact next action. Keep commits small and the deployed application usable. Do not provision paid infrastructure merely because this document selects its architecture. Do not use parallel agents unless the user asks.

**Next session: Wave 1 — the fixture, qualified behavior/decision records, and a simple shared view.**
