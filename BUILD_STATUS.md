# Current Product Relay build status

Updated 4 October 2026. Latest implementation: **0.4.0**. The user requested finishing core implementation in this continued run, followed by complete testing. The old ten-session schedule now serves as feature groups, not a limit on this run.

## Product direction

One encrypted local `.relay` file per project; PM-owned master; shared files opened by teammates with named/role perspectives; encrypted local recovery. GitHub Pages hosts the static interface. No mandatory database/account. Future Confluence/Drive/ClickUp/Azure integration remains outside this portable core.

## Implemented

All core workflow code is present: qualified rules and decision history; local PDF/DOCX import; optional protected AI gateway; cited rule/section/question candidate review; walkthrough comparison and resolution; current/historical approved context and optional explanation; source comparison and reviewed rule updates; role work; ownership, acknowledgment, completion and qualified verification; selective stale work; common-base file comparison/merge with complete parent archives; and the complete fictional demo.

Manual flows work without AI. Optional AI requires external Supabase/provider setup; no live account/key has been created. Code completion is not a claim that live model quality or hosted backend operation was verified.

## Checks

150 Node tests + syntax checks; static build; 13 browser storage checks; 6 actual browser parser-worker checks; UI walkthrough proposal, current/historical citations, stale team work, encrypted example opening, returned-file merge and parent inspection. Real PostgreSQL-compatible migration/grants/quota tests passed on PGlite PostgreSQL 18.3. Deno 2.9.6 gateway check and runtime fixture passed. Real network/provider calls and multi-connection database contention remain pending.

Checkpoint: [CHECKPOINT_0.4.0.md](CHECKPOINT_0.4.0.md). Historical checkpoint: [CHECKPOINT_0.3.0.md](CHECKPOINT_0.3.0.md). The latter describes the earlier build only.

## Files and hosting

Repository: https://github.com/aravin4d/product-relay

Static site: https://aravin4d.github.io/product-relay/

Verified 0.4.0 deployment: https://github.com/aravin4d/product-relay/actions/runs/37184393300 (application commit `14aa485`). Live QA perspective and PDF worker import passed.

Local preview: `npm run dev`, http://127.0.0.1:4173. Browser runners: `/_checks` and `/_document-checks`. Fictional portable example: `examples/orbit-demo.relay`, public demo passphrase `orbit-demo-context`.

New saves use schema 4. Schemas 1–3 import safely and future schemas reject. The encrypted envelope remains version 1. Keep original files before upgrading. `src/vendor` and `site` are generated/ignored. Development scratch/cache belongs outside the repository in the task-level `work/` directory. Real `.relay` files and credentials are ignored, apart from the fictional example.

## Known constraints

Perspectives are filters, not permissions. Names and sign-offs are self-reported. Keys/handles stay in the active tab; no lost-passphrase reset. Recovery is not a substitute for exporting the file. Native writing varies by browser and stale-write checks are not distributed locks.

Scope staleness compares exact actor/condition/outcome/applicability fields. Source warnings are separate and conservative. Meaning still needs human review. File merging requires matching sharing-round ancestry and coherent branch selections. Preserve complete parent histories; do not silently discard them to make a merge pass. Ten archives and a 10-million-character total bundle bound growth.

## Next external validation

Follow [AI_SETUP.md](AI_SETUP.md) using one explicitly configured Supabase/provider account. Verify actual available model ID, real authentication, allowance enforcement, fictional extraction and baseline-grounded explanation. Assess wrong qualifiers and unsupported claims. No provider key belongs in the public app or chat.

Connectors, shared storage, background jobs, difficult documents, and broad production/accessibility/security/performance validation remain separately scoped extensions. These are not hidden requirements for trying the portable product.

The user selected Ultra and authorized substantial available usage. Preserve checked commits; account-wide usage percentages do not guarantee a feature count or completion time. Do not infer permission to provision paid services from that usage instruction.
