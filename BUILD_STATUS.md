# Build status and continuation plan

Updated 3 October 2026. User authorizes building the complete Product Relay project in tested stages. Continue from these files; do not recreate the original prototype.

## Current direction — user decision

One local encrypted `.relay` file per project. The PM maintains the master copy and shares it with teammates. Recipients open it and select a named teammate or team role. An encrypted browser recovery copy retains edits locally. No shared-server requirement at this stage. Confluence/Drive/common-space integrations come later. The GitHub-hosted interface remains static.

## Completed

Stage 1 lifecycle foundation plus the Stage 2 design/storage/review pass. Version 0.2.0 contains product details, original source revisions, team perspectives, editable drafts, approvals, proposals with title/audience/evidence changes, archive/restore, walkthrough questions and decisions, approved historical baselines, comparisons, approved keyword search, encrypted portable files, encrypted recovery, stale-write checks, review copies, and migration from the earlier prototype.

Validation: 36 Node tests and all source/script syntax checks passed. 13 actual browser storage checks passed, including two-client conflicts. UI verified in the in-app browser at desktop and phone widths. Earlier fictional demo migration and file-based opening were verified. See IMPLEMENTATION_REVIEW.md for each section's completed repairs and limitations.

Local preview: `npm run dev`, http://127.0.0.1:4173. Browser check runner: /_checks. Example encrypted file: examples/orbit-demo.relay; fictional demo passphrase: orbit-demo-context. The earlier migrated local fictional demo uses fictional-relay-demo-passphrase. These are demonstration-only passphrases, never for real projects.

GitHub repository: https://github.com/aravin4d/product-relay. Live site: https://aravin4d.github.io/product-relay/. Pages is configured for GitHub Actions with enforced HTTPS. The local `main` branch tracks `origin/main`; pushes deploy automatically after checks. Successful initial deployment: https://github.com/aravin4d/product-relay/actions/runs/37044992919 (attempt 2; application commit `15ef849`). The first attempt preceded Pages enablement; its build/check job passed, and the deployment succeeded after Pages was enabled and the failed job was retried. Live index/CSS/JavaScript matched local source, and the sample project and Alex's QA handbook view were verified on the published site. Real project files and local credentials are ignored by Git.

## Next work — single-session prototype waves

The current selected product path is [BUILD_PLAN.md](BUILD_PLAN.md), with [BUILD_WAVES.md](BUILD_WAVES.md) as the authoritative session schedule. The user requested single-session waves, not a production-release program. This replaces the exploratory 8-wave/40-step schedule and the original product-handoff-build-plan.md where they differ.

Plan: **10 core coding sessions**, each leaving a working checked checkpoint. Session 1: fixture and qualified behavior/decision records. Session 2: ordinary PDF/DOCX import. Session 3: protected live AI connection. Session 4: reviewed AI handbook drafts. Session 5: walkthrough reconciliation. Session 6: current/historical answers. Session 7: scoped changes and proposed team work. Session 8: owners, acknowledgment, verification evidence, and stale work. Session 9: explicit file comparison/merge. Session 10: complete demonstration and practical usability repairs.

Shared projects, connectors, durable jobs, difficult document formats, and broad production hardening are separately scheduled extensions. Do not bundle them into a single session or make them prerequisites for trying the portable product. Session count is a scope estimate, not a promise based on account limits.

Planning complete; **0 of 10 core sessions implemented**. Next: **Wave 1**, executable fictional story fixtures plus qualified behavior/decision records and a simple consistent team view. No backend or paid account has been provisioned. Preserve the deployed 0.2.0 and existing encrypted files throughout. Session 3 requires live backend/API access before it can be marked fully complete.

## Known constraints

Single master editor for manual sharing. Recipients can read all perspectives; these are filters, not permissions. No lost-passphrase recovery. Keys/handles remain only in the active tab. Local cache is a recovery aid, and exported project files remain necessary for portability. Supported direct-writing browsers can link an original file through How sharing works → Open file for editing; other browsers download the next copy. File checks are not distributed locks. No AI, platform sync, PDF parsing, or authenticated approval identity yet.

## Model and usage policy

Build with GPT-6.1 Sol High; use Extra high selectively for architecture, security, and difficult conflicts. Routine edits can use Medium. Preserve tested checkpoints before usage limits. Account-wide usage percentages do not predict a fixed count of turns, tokens, sessions, or completion time. Recheck at milestone boundaries.
