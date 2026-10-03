# Product Relay 0.3.0 — prototype checkpoint

3 October 2026. This is a working prototype checkpoint, not production certification.

## Completed in this build

**Wave 1:** qualified product rules retain actor, condition, outcome, release/environment scope, owner, team audiences, source passages, and review state. Approved rules require proposals for changes. Before/after decisions and baseline snapshots preserve older agreements. The fictional ordinary-cancellation rule and fraud exception stay separate across team perspectives. Source archival/revision and competing proposals have explicit blockers. Baseline comparison, Markdown export, and approved keyword search include rules.

**Wave 2:** ordinary text PDFs and DOCX files are extracted locally using locked PDF.js/Mammoth packages. Parsing uses a bounded, terminable worker. The UI previews extraction and permits correction before adding a source or source revision. Source metadata retains original file name/type/size/hash, parser version, warnings, and page/paragraph locations; original binary files are not embedded. Exact evidence passages open their original revision and location. Corrections deliberately remove unavailable original locations. Duplicate, malformed, oversized, unreadable, encrypted-document, and image-only PDF cases are explicit. CSV/SRT/VTT remain text.

The encrypted vault envelope is unchanged. The previous schema-1 encrypted example opens; new saves use project schema 2. Keep original files when upgrading. An older 0.2.0 app cannot open new schema-2 project data.

## Implemented ahead of live setup

Wave 3 includes the optional public connection settings, memory-only sign-in token, authenticated Supabase function, OpenAI Responses adapter, exact citation/input-hash validation, request bounds, explicit selected-source consent, origin/account allowlists, and atomic daily allowance migration.

Wave 4 includes source selection, candidate review, editable unapproved rule drafts, proposed questions, stale-source checks, and AI-run/draft provenance. Credential-free protocol/provider/workflow tests cover safe behavior. The browser rejects provider/service-role keys in public settings.

**Waves 3–4 remain incomplete.** No backend has been provisioned, no real inference has been called, and Supabase function bundling/deployment and allowance SQL have not been executed. The answer adapter exists, but no AI question interface or baseline-aware answer workflow is being claimed. Follow [AI_SETUP.md](AI_SETUP.md) when approved backend/API access is available. Never send keys through chat or commit secrets.

## Verification

- 92 Node tests: qualified rules and decisions, source/document metadata, official parser fixtures, AI protocol/provider and review workflow, old domain operations, encrypted files, and conflict/failure handling.
- Source and script syntax checks; static build with local parser assets and dependency licenses.
- Actual browser storage checks: encrypted recovery, independent clients, stale writes/exports, shared-file safeguards, exported reopening, review copies, and lock/unlock.
- Actual browser document workers: two-page PDF qualifiers, DOCX inert source markup, evidence-location round trip, correction invalidation, duplicate detection, malformed/cancelled inputs.
- App UI: rule draft edit and approval preserve ordinary/fraud distinctions; PDF preview imports into the source library; new rule evidence opens Page 2; optional AI remains inactive until configured and rejects a fictional provider key in public settings.

The browser checks use only fictional projects and preserve existing recovery copies. Linked native-file access varies by browser; adapter failure/conflict cases are automated. Provider-quality, representative team time savings, SQL execution, live authentication, and real runtime costs remain unmeasured.

## Continue from here

1. Supply access to an approved Supabase backend and runtime API through the setup workflow; verify one fictional live extraction and allowance failures.
2. Inspect candidate usefulness and qualifiers, save drafts, approve them separately, and verify original source references survive a shared-file round trip.
3. Complete Wave 4's live handbook checks and gather early feedback before walkthrough reconciliation.
4. Continue Waves 5–10. Automatic change-to-team actions, verification evidence, file merging, connectors, cloud collaboration, OCR/audio, and production hardening are still future work.

Start locally with `npm ci --ignore-scripts`, then `npm run dev`. Run `npm run check` and `npm run build` for relevant verification. The GitHub Actions workflow installs the lockfile, checks, builds, and publishes the static interface; it does not deploy the optional AI backend.
