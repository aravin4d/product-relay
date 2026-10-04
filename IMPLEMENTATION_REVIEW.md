Current implementation is 0.4.0: see [CHECKPOINT_0.4.0.md](CHECKPOINT_0.4.0.md). This document retains the earlier section review as historical context.

# Implementation review — 2 October 2026

> This is the historical 0.2.0 review. Later qualified rules, document import, and optional AI work are recorded in [CHECKPOINT_0.3.0.md](CHECKPOINT_0.3.0.md). Treat its earlier feature limitations as historical.

The requested scope is a simple GitHub-hosted application with one portable encrypted file per project. PMs distribute the file; recipients select a teammate/role and read the product context. Common-space integrations come later. The earlier shared-server proposal was dropped before completion and is not part of this build.

| Section | Gaps repaired | Remaining limits |
| --- | --- | --- |
| Design | Google-style light surfaces, blue actions, multicolor product mark, icon navigation, clear hierarchy, responsive phone/desktop layouts, visible focus, reduced-motion support; external fonts removed | No affiliation with Google; full accessibility audit and cross-browser certification remain |
| Overview | Editable product details; source, approval, question, and review counts; actionable navigation; file-save state | Metrics describe recorded context, not actual delivery readiness |
| Handbook | Direct draft editing; reviewed changes to titles/audiences/behavior/evidence; archive/restore; readable exports | No rich-text editor, automatic source synthesis, or multi-source evidence picker |
| Walkthrough context | Owner/team questions; recorded resolutions; open questions retained in historical baselines | Resolutions do not automatically amend handbook behavior; reviewed proposals are required |
| Sources | Current source preview inside section/proposal forms; source revisions; dependency-aware archives; full history | TXT/Markdown/CSV text only; no PDF, DOCX, semantic table parsing, or external sync |
| Changes | Explicit keep/replace/remove evidence choices; stale/conflicting proposal blockers; accepted/rejected history; reject-review dialog; unchanged proposals rejected | No semantic AI impact analysis or automatic merge of copies |
| History | Immutable approved snapshots; captured questions; historical views; compare against current approved sections | Activity is locally recorded, not an authenticated or tamper-proof audit |
| Search | Role filtering applied before the result limit; historical approved search; clear no-answer state | Keyword excerpts, not AI answers |
| Team | Named teammates, editable roles, and a global perspective selector | Names are self-reported. Views filter content and do not enforce permissions |
| Storage | One encrypted `.relay` per product; encrypted autosaved recovery; memory-only keys; explicit file-update state; recover/reopen; separate review copies | Manual sharing; the PM maintains the master file; no cloud/team server |
| Conflicts | Local revision comparisons; cooperating-tab Web Locks; incoming-file protection for dirty recovery; linked-file fingerprint checks | No distributed lock, merge, or protection from every simultaneous external writer |
| Import | Duplicate IDs, malformed evidence, mismatched proposals, invalid snapshots, and invalid version numbering rejected; nested unknown fields stripped | File-format version remains 1 with backward-compatible optional team/question/archive fields |
| Migration | Earlier workspaces encrypted before the original browser copy is removed | Do not keep the older app open in another tab during migration |

## Verified

- 36 Node tests and syntax checks passed.
- 13 actual browser storage checks passed using independent storage clients: encrypted cache, incorrect passphrase, reopening, persistence, stale writes/exports, dirty incoming-file conflicts, export/import, review copies, and locking.
- The fictional workspace from the earlier build migrated successfully with its original two baselines.
- The actual `examples/orbit-demo.relay` file was selected through the browser chooser and opened with its demonstration passphrase.
- Manual interface checks covered named QA selection, draft creation/editing, questions, source/history/review/search surfaces, and recovery unlock errors.
- Phone viewport checked at 390 pixels: document width stayed 390, with no horizontal page overflow. Navigation scrolls within its own row.
- Direct file adapter overwrite/failure safeguards were tested. Native original-file writing has not been certified across browsers; manual-download replacement is supported.

## Security design

AES-256-GCM protects project payloads and local cache; PBKDF2-SHA-256 (600,000 iterations, random salt) derives keys; nonce is fresh per save. The fixed envelope format and salt are authenticated, and keys are non-extractable. Passphrases are not persisted. Only opaque IDs, timestamps, revision numbers, and export state remain readable in the cache.

Encryption protects stored data. It does not prevent a recipient with the passphrase from decrypting with another compatible reader, prevent access in an already unlocked tab, or authenticate the editor. There is no passphrase reset. Share passwords separately from files. Readable Markdown exports are intentionally unencrypted and have an explicit export prompt.

References: [Web Crypto key derivation](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey), [OWASP PBKDF2 work factors](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [GitHub Pages static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
