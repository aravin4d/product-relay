# Build status and continuation plan

Updated 3 October 2026. User authorizes building the complete Product Relay project in tested stages. Continue from these files; do not recreate the original prototype.

## Current direction — user decision

One local encrypted `.relay` file per project. The PM maintains the master copy and shares it with teammates. Recipients open it and select a named teammate or team role. An encrypted browser recovery copy retains edits locally. No shared-server requirement at this stage. Confluence/Drive/common-space integrations come later. The GitHub-hosted interface remains static.

## Completed

Version 0.3.0 adds the first two prototype waves: qualified product rules with approval/proposals/decision history and preserved baselines; local PDF/DOCX import with previews, corrected-text location invalidation, metadata, duplicate warnings, and exact page/paragraph citations. An optional AI client, Supabase gateway, strict source/citation protocol, allowance migration, and review UI are included, with live setup pending.

The previous foundation contains product details, original source revisions, team perspectives, editable drafts, approvals, proposals with title/audience/evidence changes, archive/restore, walkthrough questions and decisions, approved historical baselines, comparisons, approved keyword search, encrypted portable files, encrypted recovery, stale-write checks, review copies, and migration from the earlier prototype.

Validation: 92 Node tests and all source/script syntax checks passed; build succeeds. All 13 actual-browser storage checks and all 6 real parser-worker checks passed. Browser UI checks confirmed separate ordinary/fraud rules, draft editing and approval, PDF preview, source import, and Page 2 evidence. The previous encrypted schema-1 demo opens in the new domain model. AI protocol/workflow checks use fake providers; SQL execution, Supabase function deployment, and paid inference are unverified. UI verified in the in-app browser at desktop and phone widths. Earlier fictional demo migration and file-based opening were verified. See IMPLEMENTATION_REVIEW.md for each section's completed repairs and limitations.

Local preview: `npm run dev`, http://127.0.0.1:4173. Browser check runner: /_checks. Example encrypted file: examples/orbit-demo.relay; fictional demo passphrase: orbit-demo-context. The earlier migrated local fictional demo uses fictional-relay-demo-passphrase. These are demonstration-only passphrases, never for real projects.

GitHub repository: https://github.com/aravin4d/product-relay. Live site: https://aravin4d.github.io/product-relay/. Pages is configured for GitHub Actions with enforced HTTPS. The local `main` branch tracks `origin/main`; pushes deploy automatically after checks. Successful initial deployment: https://github.com/aravin4d/product-relay/actions/runs/37044992919 (attempt 2; application commit `15ef849`). The first attempt preceded Pages enablement; its build/check job passed, and the deployment succeeded after Pages was enabled and the failed job was retried. Live index/CSS/JavaScript matched local source, and the sample project and Alex's QA handbook view were verified on the published site. Real project files and local credentials are ignored by Git.

## Next work — single-session prototype waves

The current selected product path is [BUILD_PLAN.md](BUILD_PLAN.md), with [BUILD_WAVES.md](BUILD_WAVES.md) as the authoritative session schedule. The user requested single-session waves, not a production-release program. This replaces the exploratory 8-wave/40-step schedule and the original product-handoff-build-plan.md where they differ.

Plan: **10 core coding sessions**, each leaving a working checked checkpoint. Session 1: fixture and qualified behavior/decision records. Session 2: ordinary PDF/DOCX import. Session 3: protected live AI connection. Session 4: reviewed AI handbook drafts. Session 5: walkthrough reconciliation. Session 6: current/historical answers. Session 7: scoped changes and proposed team work. Session 8: owners, acknowledgment, verification evidence, and stale work. Session 9: explicit file comparison/merge. Session 10: complete demonstration and practical usability repairs.

Shared projects, connectors, durable jobs, difficult document formats, and broad production hardening are separately scheduled extensions. Do not bundle them into a single session or make them prerequisites for trying the portable product. Session count is a scope estimate, not a promise based on account limits.

**2 of 10 core waves complete.** Wave 3 has the protected gateway/client and server allowance code; Wave 4 has the reviewed rule-candidate/question path and provenance. Neither is marked complete until a real backend/provider is configured and verified. No backend or paid account has been provisioned. Next: follow AI_SETUP.md with approved Supabase/API access, verify a fictional live extraction, then continue walkthrough reconciliation. Keep original schema-1 files before saving upgraded schema-2 files. Source files, current checks, blockers, and continuation details are saved with this checkpoint.

## Known constraints

Single master editor for manual sharing. Recipients can read all perspectives; these are filters, not permissions. No lost-passphrase recovery. Keys/handles remain only in the active tab. Local cache is a recovery aid, and exported project files remain necessary for portability. Supported direct-writing browsers can link an original file through How sharing works → Open file for editing; other browsers download the next copy. File checks are not distributed locks. Optional AI code exists but no live gateway/provider is configured. Platform sync, OCR, audio transcription, authenticated team approval identity, shared cloud storage, and file merge are still pending. Whole-source revision staleness is conservative; semantic change impact and action evidence are later waves.

## Model and usage policy

The user selected Ultra for this build and authorized using available bandwidth. Continue with the user’s chosen model/effort; preserve checked checkpoints instead of treating usage percentages as completion guarantees. Preserve tested checkpoints before usage limits. Account-wide usage percentages do not predict a fixed count of turns, tokens, sessions, or completion time. Recheck at milestone boundaries.
