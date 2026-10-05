# Product Relay

A delivery context system connecting the original PRD/SOP and walkthrough decisions to owned work, test evidence, releases, Support guidance and production learning. One encrypted `.relay` file per project works without accounts or AI. An optional shared service adds authenticated collaboration and selected integrations to the same domain.

**[Live 0.4.0 site](https://aravin4d.github.io/product-relay/)** · **[Repository](https://github.com/aravin4d/product-relay)** · **[Phase 2 build branch](https://github.com/aravin4d/product-relay/tree/codex/phase2-delivery-build)**

**Phase 2 continuation:** Source repairs and implementation are saved as **0.5.0-phase2.2** on a separate branch. Functional testing is deferred to the next session at the user's request. The live site remains the earlier build with its recorded authored-history/review-queue defects. Repair code is present on this branch; that is not yet proof of a reliable save/share/reopen journey.

Start with [the implementation checkpoint](PHASE_2_BUILD.md). All **91 engineering items** and **138 feedback entries** retain their individual acceptance contracts and concrete open work. No completion percentage substitutes for those checks.

## Why this exists

After a product decision changes, a team needs to know which requirement, work item, case, result, briefing or deployment context is affected, and why. Relay records the agreed revision and reviewed links instead of relying on the newest paragraph or a successful generic workflow. It keeps approval, ownership receipts, completion, test evidence and actual deployment as separate facts.

This is the proposed differentiator. Real-team savings and competitor superiority have not been established.

## Begin manually

1. Create a project, choose a passphrase of at least 12 characters and add teammates.
2. Import the original PRD/SOP or walkthrough transcript; inspect extraction before using it as evidence.
3. Use **Guided intake** and **Delivery records** to draft typed requirements, scope and numerical NFR measures. Review exact source quotations before approving.
4. Create only relevant owned work, approved cases and guidance. Record current-owner receipt separately from completion and actual test results.
5. Review a change through **Review inbox**, recorded dependency paths and an isolated rehearsal. Approve resulting changes separately and inspect the current evidence matrix.
6. Record release obligations and actual build/environment observations; use applicable Support/Operations guidance. Incidents create reviewed follow-up drafts.
7. Start a sharing round, record expected returns, save the encrypted master and send it through your existing channel. Share the secret separately. Review returned copies before merging.

**Explore the sample product** opens a fictional six-role journey. Nothing in the demonstration proves a real execution or deployment. `examples/orbit-demo.relay` is the earlier encrypted example; its public demonstration passphrase is **orbit-demo-context**. Never use that secret for real work.

## Built areas

| Area | Code present in Phase 2 |
| --- | --- |
| Agreement | Objectives, behavior/constraint/exception/NFR requirements, hierarchy, glossary, release/environment/audience/flag scope and multi-source revision evidence. |
| Review | Unified attention/inbox, per-item batch decisions, exact-base proposals, preserved history and explicit My work/Team view. |
| Delivery | Owned work, scope-bound receipts, component/API/compatibility/migration references and reviewed role handoffs. |
| QA | Versioned cases and measures, immutable actual runs, JUnit/JSON mapping, defects, regression selection and reason-based evidence matrix. |
| Release and learning | Obligations/accepted risks, actual deployment observations, Support/Operations guidance and incident follow-up. |
| Knowledge | Agreement versus raw sources, aliases, historical baselines and explicitly mapped deployed context; optional grounded AI. |
| Portable coordination | Encrypted master/cache, named returns, common bases, three-way record-group review, parent histories, lossless packing, future-save recovery keys, selected old-return proposals, encrypted archive offloading and sanitized exports. |
| Optional shared service | Membership/capability policies, transactional revision commands/journals, reviewed offline rebase with original draft retention, directory groups, private originals, scheduled consented notifications, encrypted backups/restore tooling, operational retention and portfolio. |
| Optional integrations | Selected GitHub, Confluence, Drive, Azure and ClickUp reads, account consent/renewal, actual ZIP report ingestion; reviewed GitHub comments/test-only dispatch; scanned-PDF/recording preprocessing and optional diarization. |
| Optional AI | OpenAI/Anthropic selection, bounded tasks, exact citations, preserved unknowns, shared-project reauthorization and request allowances. |

See [PHASE_2_BUILD.md](PHASE_2_BUILD.md) for each added implementation path, retained design boundaries and the per-item validation/setup handoff. The earlier partial paths now have code; account registration, actual service operation and acceptance evidence remain separate work.

## Run and host

Node.js 24 is the development target:

```sh
npm ci --ignore-scripts
npm run dev
```

Open http://127.0.0.1:4173. Local PDF.js/Mammoth assets are bundled; no visitor package installation is needed.

For construction checks and artifacts:

```sh
npm run check:static
npm run build
npm run package:backend
```

`site/` contains the static website. `work/relay-backend-package/` contains optional functions, their colocated domain modules, migrations, operator templates, worker runner and a file-hash manifest. Packaging starts no service and transfers no project.

GitHub Pages deploys the static site through the included workflow on `main`, after `npm run check` and the build. Feature branch pushes do not deploy. **Do not merge this checkpoint until next-session validation is recorded.** Tests/docs/examples/backend code are excluded from the site. For another repository select **Settings → Pages → GitHub Actions**.

Optional shared/AI/connector jobs require a separately operated backend. Use [deploy/README.md](deploy/README.md) and [AI_SETUP.md](AI_SETUP.md); GitHub Pages cannot hold provider secrets or run a worker. No backend/provider/connector account was provisioned during this build.

## Files, privacy and limits

Protected edits update encrypted browser recovery; **Save project file** exports the portable copy. Recovery alone does not share changes. File System Access browsers can link a native file; other browsers download another copy. A download request cannot prove it was retained on disk. File handles and unlocked keys stay in the active tab.

AES-256-GCM files/cache use fresh nonces and PBKDF2-SHA-256 with random salt and 600,000 iterations. Recovery metadata exposes IDs/timestamps/export state, not project contents. Every passphrase holder can read the complete portable project with a compatible implementation. Perspectives are filters; portable names/receipts are self-reported. Downloaded copies cannot be revoked. Losing every retained secret remains unrecoverable.

Phase 2 saves containing native delivery context use **schema 5**, retaining 26 record families, source revisions and logical history. Schemas 1–4 remain supported; future schemas reject. Keep originals before upgrading. Existing vault-v1 files remain supported. The optional recovery-key upgrade creates vault-v2 files with two wrapped key paths; earlier app builds cannot open v2. Both the passphrase and separately retained recovery secret can open later saves. Keep pre-upgrade copies. The file budget is 10 million serialized characters with a bounded 32 MB packing expansion; ten active merge parents remain the supported limit. Downloaded encrypted history bundles can offload those parents with hashed manifests and later be inspected or reattached. Offloading requires retaining the archive file and secret; source/approval history remains in the master.

Text PDF/DOCX import is bounded to 15 MB/document, 200 PDF pages and 200,000 extracted characters. CSV/SRT/VTT preserve bounded text locations. Original bytes are retained only when explicitly selected: portable originals 2 MB each/6 MB total, optional private shared originals 6 MB each. Remote references are not offline copies. Editing extracted text removes original layout claims. OCR accepts bounded PNG/JPEG; transcription accepts short PCM WAV. Scanned PDFs can be rasterized locally in batches of up to 50 pages. Browser-decodable recordings up to 60 MB / 30 minutes can be split locally into short PCM clips before consented processing. Optional provider diarization uses clip-local speaker estimates; it does not establish names or exact original page coordinates.

Manual use performs no product-content network request. Optional AI/media/connector/shared actions send authorized plaintext to the configured backend/providers after the relevant consent. Server/provider processing is not end-to-end encrypted. Provider secrets stay on the backend, sign-in tokens in tab memory and local pending review drafts encrypted. Shared-project identity/capability checks differ from portable self-reported decisions.

Recorded paths cannot prove all dependencies are known. Semantic equivalence, conflicting interpretations, carry-forward and actual deployment mappings require human review. A quoted passage, artifact URL, workflow success, task completion or runbook does not prove a requirement was tested or a rollback executed. No averaged readiness score or regulatory-grade audit claim is made.

## Verification and continuation

New code passed construction checks only; full tests/browser journeys, SQL migrations/RLS, Deno type checking, live Auth/models/connectors, recovery drills and measured performance remain deferred. Previous 0.4.0 tests/deployment evidence in [CHECKPOINT_0.4.0.md](CHECKPOINT_0.4.0.md) are historical and do not certify this branch.

Next session follows [the test handoff](docs/PHASE_2_NEXT_SESSION.md) and [V01–V18](PHASE_2_VALIDATION.md), beginning with a newly authored walkthrough/save/share/reopen journey rather than the prepared demo. `npm run check` includes functional tests and is intentionally reserved for that session. Retrieval/model runners in [docs/evaluation/](docs/evaluation/README.md) are opt-in and have not been run.

- [Implementation checkpoint and remaining work](PHASE_2_BUILD.md)
- [All 138 feedback points](PHASE_2_FEEDBACK_COVERAGE.md)
- [91-item engineering backlog](PHASE_2_BACKLOG.csv)
- [Detailed product/architecture plan](PHASE_2_PLAN.md)
- [Current build status](BUILD_STATUS.md)
