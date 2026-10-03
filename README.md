# Product Relay

A portable product handbook for the entire delivery team. The PM keeps one `.relay` project file containing the original context, walkthrough questions, reviewed behavior, change proposals, team perspectives, and historical baselines.

**[Open Product Relay](https://aravin4d.github.io/product-relay/)** · **[Source repository](https://github.com/aravin4d/product-relay)**

Choose **Explore the sample product** to try it immediately. Version 0.3.0 adds qualified product rules and local PDF/DOCX import. The optional AI client, protected gateway, and draft-review UI are included; live AI requires your backend/API setup and has not yet been verified. Shared cloud integrations remain planned.

## Run

Node.js 24 is the tested local development runtime. The published manual app is static: document extraction runs locally with bundled PDF.js and Mammoth assets. Visitors do not install packages. AI is optional and requires a separately configured backend.

```sh
npm ci --ignore-scripts
npm run dev
npm run check
npm run build
```

Open http://127.0.0.1:4173. Choose **Explore the sample product** for an in-memory demonstration, or **Create a project** to begin a protected project. An in-memory sample is discarded on reload unless saved.

## The file workflow

1. Create a project and choose a passphrase of at least 12 characters.
2. Add original sources, teammates, qualified product rules, handbook sections, and questions.
3. Review rules/sections and preserve an agreed baseline.
4. Click **Save project file**. Each project has its own encrypted `.relay` file.
5. The PM shares the latest file and shares its passphrase separately.
6. Teammates choose **Open project file**, enter the passphrase, and select their name or team perspective.
7. Keep one person responsible for editing the master copy. Save and redistribute after changes.

Browsers with File System Access support can update a file linked in the same session: use **How sharing works → Open file for editing**, or choose its location on the first save. Otherwise, saving issues a new download; replace the older file manually. **How sharing works → Download project file** always creates a portable export without writing a linked original. The application distinguishes local recovery saves from file exports. A download being issued cannot prove that the user retained it on disk.

Every protected edit automatically updates an **encrypted local recovery copy**. Closing or reloading forgets the decryption key; reopening a recovery copy requires the passphrase. The file remains the portable source of context. Clearing browser storage removes recovery copies, not saved project files.

If an incoming file matches a project with unexported recovery changes, opening it is blocked. Use **Open as a separate review copy** to inspect another version without replacing yours. The tool does not automatically merge independently edited files.

## Try the complete example

Open `examples/orbit-demo.relay` using **Open project file**. Its public, demonstration-only passphrase is **orbit-demo-context**. All product details and names are fictional; do not reuse that passphrase for a real project.

Select Alex to see QA context, resolve a walkthrough question, accept the cancellation proposal, and save another baseline. The original baseline preserves the earlier wording and questions. The encrypted file contains the complete project, including every role view.

## Implemented sections

- **Overview:** context, approved handbook coverage, open questions, review queue, and lifecycle navigation.
- **Product rules:** stable rule IDs, actor, condition, outcome, release/environment scope, decision owner, multiple team perspectives, evidence, draft approval, reviewed proposals, archived records, decision history, and historical baselines.
- **Handbook:** Everyone/Product/QA/Development/Operations/Support perspectives; draft editing; source-linked review; proposed title, audience, behavior, and evidence changes; reversible archive.
- **Questions & decisions:** owner, relevant team, open/resolved status, recorded answers, and preserved baseline questions.
- **Source library:** pasted text or local PDF/DOCX/TXT/Markdown/CSV/SRT/VTT imports, preview/correction, original-file metadata, source revisions, page/paragraph-qualified citations, duplicate indication, linked-content checks, archive/restore. CSV and transcript timestamps remain text.
- **Change review:** before/after, exact source evidence, visible conflict/staleness blockers, pending/accepted/rejected history, and explicit owner decisions when evidence is removed.
- **Version history:** approved baseline snapshots, questions at the time of saving, comparison with current approved rules/sections, and recorded activity.
- **Search:** approved current/historical rules and sections filtered by perspective; drafts and proposals excluded.
- **Project team:** named teammates, editable roles, and perspective selection.
- **Optional AI workspace:** explicit source selection/consent, gateway connection and sign-in, validated candidate review, edit/save as unapproved rule draft, question review, stale-result rejection, and retained AI-run provenance. Live setup is pending; see [AI_SETUP.md](AI_SETUP.md).
- **Files and recovery:** encryption, portable open/save, encrypted IndexedDB recovery, lock/reopen, conflicting-tab checks, review copies, and earlier-build migration.

Migration converts each earlier unencrypted browser workspace to an encrypted recovery copy before removing its older copy. Export the resulting projects as separate `.relay` files. Do not run the older app in another tab during migration.

## Privacy and limitations

Files and recovery data use AES-256-GCM with a fresh random nonce for each encryption. Passphrases derive a non-extractable key using PBKDF2-SHA-256, a random per-project salt, and 600,000 iterations. Keys remain in the active tab's memory; no passwords or plaintext project content are persisted by the new cache. Unencrypted cache metadata contains a project ID, timestamps, sequence number, and export state. Manual use and local document extraction make no external requests for fonts, analytics, or product content. Optional AI sign-in contacts the configured gateway; generation sends only explicitly selected plaintext source revisions to that gateway and its AI provider. Provider credentials stay on the backend, and tokens stay in memory. Only public AI connection settings are persisted separately from the encrypted project cache.

This protects stored files; it cannot guarantee that only this software can read them. Anyone with the passphrase and a compatible implementation can decrypt them. An unlocked page, browser extension, malicious script, or compromised computer can access displayed content. There is no lost-passphrase recovery or per-person access control. A perspective is a reading filter, not a permission boundary: every recipient can view the complete file.

File handles last only for the current tab session. A linked file is checked for external changes before writing, and Web Locks serialize cooperating tabs where available. Cache revisions additionally prevent stale writes. These checks are not distributed locks for shared/network filesystems and cannot prevent all simultaneous writes by other applications. One master editor is the supported sharing workflow.

No live AI backend has been configured or verified. Automatic platform sync, authenticated team sign-offs, OCR, audio transcription, automatic task impact/verification, and collaborative merge are not implemented. PDF/DOCX extraction preserves text, not original layout or binary files. Maximum document size is 15 MB, PDF page count 200, and extracted source text 200,000 characters; unreadable image-only PDFs require OCR elsewhere. Editing the import preview invalidates original page/paragraph locations. Recorded approvals/activity are editable project records, not tamper-proof audit evidence. Meaning and truth still require human review. For this version, decrypted project bundles are limited to 10 million characters; individual source text is limited to 200,000 characters.

New saves use project schema 2. The app reads schema 1 and 2, while rejecting newer versions. The previous encrypted schema-1 demo was opened successfully. Keep a copy of original files before saving an upgraded version; version 0.2.0 cannot open schema-2 project data. The encryption envelope itself remains unchanged.

## Validation

`npm run check` checks all source/server scripts and runs 92 rule, document-parser, AI-protocol/review, domain, encryption, and file-safety tests. All 13 actual-browser storage checks and 6 actual-browser document checks passed on 3 October 2026. To run the storage checks, start the server and open http://127.0.0.1:4173/_checks. Those checks create isolated fictional projects and remove only their own test records. For the 6 actual-browser PDF/DOCX worker checks, open http://127.0.0.1:4173/_document-checks. Test pages are excluded from the published site. AI checks use credential-free fake adapters; they do not prove a live provider/backend connection. SQL execution and Supabase function deployment remain unverified.

The in-app browser was used to verify migration of the fictional earlier demo, locked recovery, named perspectives, section flows, and responsive layout. Direct native file writing varies by browser; the file adapter's conflict and failure cases are tested, while the browser storage checks validate exported-file reopening.

## GitHub Pages

Published at **https://aravin4d.github.io/product-relay/**. GitHub Pages uses the included workflow, and HTTPS is enforced. The deployment and live sample were verified on 2 October 2026; every published app file matched the saved source.

Upload this directory's contents to a dedicated repository with `main` as its default branch, including `.github`, `.gitignore`, and `.gitattributes`. In Settings → Pages, choose GitHub Actions. Run **Deploy Product Relay** in Actions for the first deployment if needed. Later pushes to `main` run the checks and automatically update the site. Pull requests run the checks without publishing. Deployment must finish successfully before a new version is live.

The workflow publishes only `index.html` and `src/`; tests, documentation, and example project files are excluded from the website. The workflow installs the locked development dependencies, checks the app, and builds local parser assets. Manual use needs no backend; optional AI requires the setup described above. The standard site address is `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. The workflow uses the official GitHub actions described in [GitHub's Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Keep real project files out of the public repository. `.gitignore` excludes `.relay` files except the fictional sample, along with local `.env` credentials and build output. Browser uploads do not apply Git ignore rules, so choose application files only when uploading through GitHub's website. Hosting the app does not upload project data. Files remain with their owners and recovery copies remain in each browser.

## Next

The selected prototype plan has **10 single-session waves**, progressing from document import and reviewed AI knowledge to team actions, verification, and safer shared files. Shared accounts, connectors, and production hardening are separately scheduled extensions. **Waves 1–2 are implemented.** Wave 3 has a tested connection scaffold but awaits a live backend/API; Wave 4 has the candidate-review path but awaits live output validation. Later waves remain planned.

- [Product direction and architecture](BUILD_PLAN.md)
- [Single-session build waves](BUILD_WAVES.md)
- [Differentiating demo story and pilot](DEMO_STORY.md)
- [Current build status](BUILD_STATUS.md) and [implementation review](IMPLEMENTATION_REVIEW.md)
