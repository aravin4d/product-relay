# Build status and continuation plan

Updated 2 October 2026. User authorizes building the complete Product Relay project in tested stages. Continue from these files; do not recreate the original prototype.

## Current direction — user decision

One local encrypted `.relay` file per project. The PM maintains the master copy and shares it with teammates. Recipients open it and select a named teammate or team role. An encrypted browser recovery copy retains edits locally. No shared-server requirement at this stage. Confluence/Drive/common-space integrations come later. The GitHub-hosted interface remains static.

## Completed

Stage 1 lifecycle foundation plus the Stage 2 design/storage/review pass. Version 0.2.0 contains product details, original source revisions, team perspectives, editable drafts, approvals, proposals with title/audience/evidence changes, archive/restore, walkthrough questions and decisions, approved historical baselines, comparisons, approved keyword search, encrypted portable files, encrypted recovery, stale-write checks, review copies, and migration from the earlier prototype.

Validation: 36 Node tests and all source/script syntax checks passed. 13 actual browser storage checks passed, including two-client conflicts. UI verified in the in-app browser at desktop and phone widths. Earlier fictional demo migration and file-based opening were verified. See IMPLEMENTATION_REVIEW.md for each section's completed repairs and limitations.

Local preview: `npm run dev`, http://127.0.0.1:4173. Browser check runner: /_checks. Example encrypted file: examples/orbit-demo.relay; fictional demo passphrase: orbit-demo-context. The earlier migrated local fictional demo uses fictional-relay-demo-passphrase. These are demonstration-only passphrases, never for real projects.

## Remaining stages

1. Guided onboarding: reusable handbook topics, source-to-topic mapping, walkthrough agenda, dependency graph, detailed completeness explanations; preserve unknowns.
2. AI orchestration: provider abstraction, grounded extraction/drafting/Q&A, structured evidence validation, resumable jobs, budgets, comparative evaluations. Live tests require credentials and a secure optional companion; keep GitHub Pages as the frontend.
3. Intelligent changes: semantic impact suggestions, unaffected manual edits, qualifiers, review dependencies, and explicit copied-file merge UI. No invented automatic consensus.
4. Common-space integration: documented Confluence/Drive/ClickUp/Azure adapters and fixtures first; actual tenant tests before claiming live sync. Keep portable file import/export as a supported workflow.
5. Production options when needed: authenticated organizations, person-level permissions, database/blob storage, jobs, verified audit identity, backups, and self-host packaging. These should not complicate the current file-based version.
6. Release: broader accessibility/cross-browser and large-file tests; polish; actual GitHub deployment once authenticated account access is available. The deployment workflow checks pull requests and deploys successful pushes to `main`; Git ignores real project files and local credentials. Remote publication remains pending sign-in.

## Known constraints

Single master editor for manual sharing. Recipients can read all perspectives; these are filters, not permissions. No lost-passphrase recovery. Keys/handles remain only in the active tab. Local cache is a recovery aid, and exported project files remain necessary for portability. Supported direct-writing browsers can link an original file through How sharing works → Open file for editing; other browsers download the next copy. File checks are not distributed locks. No AI, platform sync, PDF parsing, or authenticated approval identity yet.

## Model and usage policy

Build with GPT-6.1 Sol High; use Extra high selectively for architecture, security, and difficult conflicts. Routine edits can use Medium. Preserve tested checkpoints before usage limits. Account-wide usage percentages do not predict a fixed count of turns, tokens, sessions, or completion time. Recheck at milestone boundaries.
