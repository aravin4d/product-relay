# Product Relay

A living product handbook for the whole delivery team, from the first PRD/SOP to walkthrough decisions, changed rules, owned work, and verification. Each project travels in one encrypted `.relay` file. The app runs on GitHub Pages; manual use needs no account or server.

**[Open Product Relay](https://aravin4d.github.io/product-relay/)** · **[Source repository](https://github.com/aravin4d/product-relay)**

Choose **Explore the sample product**. The fictional R3 fraud change needs fresh QA work, while ordinary cancellation keeps its applicable verification. This is the core differentiator: preserve what was agreed and checked, then show exactly which scoped work needs review.

## Start in five steps

1. Create a project and choose a passphrase of at least 12 characters.
2. Import a PRD/SOP, add teammates, and review qualified product rules and handbook drafts.
3. Capture walkthrough statements against the agreement; record owner decisions and approve any resulting proposals separately.
4. Plan relevant team work, assign owners, and record acknowledgment, completion, and verification as separate steps.
5. Start a **sharing round**, save the master file, and send it to teammates. Share its passphrase separately. Review returned copies in **Shared-file review** before merging selected edits.

A recipient opens the file and selects their name or team. Perspectives filter the reading view; every recipient can read the complete project. The PM remains responsible for the master copy.

## What is implemented in 0.4.0

| Area | Working behavior |
| --- | --- |
| Original context | Local PDF/DOCX/text import, extraction preview/correction, metadata, duplicate warnings, revision history, and exact page/paragraph citations. |
| Product rules | Stable IDs; actor, condition, outcome, release/environment scope, owner, audiences; draft approval, reviewed changes, archive/restore, and decision history. |
| Handbook | Role views, editable drafts, evidence and owner decisions, proposals, immutable approved baseline snapshots, and readable export. |
| Walkthrough review | A quoted statement beside its original agreed rule; unresolved questions, deferrals, owner interpretation, and separate rule proposals or new drafts. Recency never decides authority. |
| Ask the product | Local retrieval over approved rules/sections, current or historical baseline, qualifiers, original evidence, and explicit missing context. Optional AI explains the displayed approved evidence after consent. |
| Changes | Adjacent source-revision comparison; manually reviewed interpretation or AI candidates become proposals. Unrelated rules remain unchanged. |
| Delivery review | Reviewer-selected role actions, named owners, scope acceptance, work statuses, task-update proposals, acknowledgment, qualified verification records, selective stale work, and missing-work reasons. |
| Shared files | Embedded common base, three-way record comparison, explicit conflict choices, reviewed merge, linked-history validation, and complete encrypted parent archives. |
| Optional AI | Protected Supabase gateway, OpenAI Responses adapter, validated rule/section/question candidates, stale-output checks, grounded explanation, provenance, and server-enforced request allowance. |
| Files and recovery | AES-encrypted portable files and IndexedDB recovery, lock/reopen, stale-tab/file checks, separate review identities, and older-format migration. |

No provider account is configured. The AI code and its credential-free runtime tests work; paid inference, deployed Supabase behavior, and model extraction quality remain unverified. [AI setup](AI_SETUP.md) explains the exact external steps.

## Run and host

Node.js 24 is the tested development target:

```sh
npm ci --ignore-scripts
npm run dev
npm run check
npm run build
```

Open http://127.0.0.1:4173. The sample stays in memory until protected/saved. Local PDF.js and Mammoth assets are bundled; visitors do not install packages.

GitHub Pages publishes `index.html` and `src/` from the built `site/` directory. The included workflow installs locked dependencies, runs checks, builds, and deploys pushes to `main`. Pull requests run checks without publishing. In a new repository, select **Settings → Pages → GitHub Actions**. A deployment must finish before new code is live. Tests, documents, examples, and backend code are excluded from the published website.

The manual application remains static. Optional AI requires a separately deployed gateway and provider access; its secret key never belongs in the public website. No Confluence, Drive, ClickUp, or Azure account is needed to try the local-file product.

## Saving and returning files

Protected edits automatically update encrypted browser recovery. **Save project file** exports the portable copy; recovery alone does not share changes. Closing/reloading forgets the decryption key. Clearing browser storage removes recovery copies, not files already saved on disk.

Browsers supporting File System Access can link a file for direct updates through **How sharing works → Open file for editing**. Other browsers download a new copy. **Download project file** always exports without writing the linked original. Issuing a download cannot prove the user retained it on disk.

Start a sharing round **before** sending the master. Its common base stays inside the encrypted file while teammates return edits. Starting another round makes old returns incompatible with automatic comparison. Open returned files in **Shared-file review**, select incoming edits, explicitly choose conflicting branches, and name the merge reviewer. Incoming approval/accepted-task history requires an additional review checkbox. Inconsistent linked rule/task/source histories reject the entire merge. Both full parent histories are archived before the active result replaces the master.

These are record-group merges, not simultaneous editing. Same-task/same-rule histories stay together. Independent task edits can merge; incompatible branch dependencies require separate review files. Source branches keep original revision IDs and preserve both passages when an incoming branch is selected. Concurrent baselines retain stable IDs/snapshots and receive sequential display numbers. A project supports at most 10 merge archives and a 10-million-character decrypted bundle; anchors and archives consume that budget.

Opening an incoming file directly is blocked when matching recovery has unexported changes. **Open as a separate review copy** creates another project identity and preserves parent archives, but does not remain merge-compatible with the original master. Return edits using the normal shared project file.

## Try the encrypted example

Open `examples/orbit-demo.relay`. Its public demonstration passphrase is **orbit-demo-context**. All people, decisions, and evidence are fictional; never reuse that passphrase for real work.

Select Alex, open **Delivery review**, and compare ordinary and fraud verification. In **Ask the product**, search “fraud” using the current agreement and the R2 baseline. The outcome and original cited source differ. Review the walkthrough decision, rescope a stale task, and record a new qualified check. See [DEMO_STORY.md](DEMO_STORY.md).

## Privacy and limits

AES-256-GCM encrypts project files/recovery with a fresh nonce. PBKDF2-SHA-256 uses a random salt and 600,000 iterations to derive a non-extractable key. Keys remain in the active tab. Recovery metadata exposes only IDs, timestamps, sequence/export state; project contents stay encrypted until opened. Anyone with the passphrase and a compatible implementation can decrypt the file. There is no lost-passphrase recovery, per-person access control, or authenticated portable sign-off.

Manual use and extraction make no external requests for fonts, analytics, or product content. Optional AI sends only confirmed selected plaintext context to the configured gateway/provider over HTTPS. Provider secrets stay on the backend; sign-in tokens stay in tab memory; public connection settings can be retained locally. Inference is not end-to-end encrypted. Answers and unsaved candidates stay in memory; saved drafts, input revision references, and provenance enter the encrypted file.

Documents support ordinary text PDFs/DOCX and raw text imports: 15 MB per document, 200 PDF pages, 200,000 extracted characters. Original binaries/layout are not embedded. Editing extracted text removes original page/paragraph claims. OCR, audio transcription, difficult table fidelity, connectors, shared cloud storage, and authenticated team identity are outside this prototype.

Scope staleness compares the approved actor, condition, outcome, and applicability exactly. Title/owner/audience changes do not invalidate checks. This is not an automatic semantic classifier: a human reviews meaning, and a semantically equivalent rewording of those scope fields can still trigger review. Source-revision warnings are separate and conservative. Completion, acknowledgments, and test results are self-reported; linked artifacts are not executed or independently verified. There is no release-readiness percentage or tamper-proof audit claim.

File handles last for the tab session. Cache compare-and-set, Web Locks where available, and original-file fingerprint checks help avoid stale writes; they are not distributed locks. One master owner remains the supported sharing workflow.

New saves use schema **4**, and schemas 1–3 upgrade on opening. Future schemas are rejected. Keep an original copy before upgrading; earlier app builds cannot read schema 4. The encryption envelope is unchanged.

## Validation

On 4 October 2026: **150 Node tests** and source/script syntax checks passed; the static build passed. These include actual PDF.js/Mammoth parsing, portable rule/action/history validation, encrypted files, three-way merge cases, grounded-context isolation, and the real allowance migration running on PGlite PostgreSQL 18.3. A queued burst proves reservation counts; actual multi-connection database contention remains unverified.

The actual gateway entry point, pinned Supabase SDK, handler, and provider adapter passed a **Deno 2.9.6 runtime test with four substeps**, using intercepted fictional HTTP calls. Function type/module checking also passed. This does not prove external deployment or paid provider inference.

Actual-browser checks: **13 encrypted storage checks** and **6 document worker checks** passed. UI walkthrough-to-proposal, current/historical evidence, scoped stale work, and returned-file merge/parent inspection were exercised in the in-app browser. Direct native writing/download retention varies by browser. Mobile, accessibility, security, and performance audits remain further validation work.

Start the local server and open `/_checks` or `/_document-checks` to rerun isolated fictional browser checks. Existing recovery projects are preserved. Test pages are not deployed.

## Build record

The original ten-session plan is now a feature map: the user requested implementing the core in one continued run. All core workflow code is present; live AI setup/quality validation is still external work. Larger integrations and production hardening remain separately scoped.

- [Latest checked implementation](CHECKPOINT_0.4.0.md)
- [Current status and continuation](BUILD_STATUS.md)
- [Feature-wave plan](BUILD_WAVES.md)
- [Product direction](BUILD_PLAN.md)
