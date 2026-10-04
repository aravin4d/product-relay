# Optional shared service

The GitHub Pages interface and encrypted file workflow remain independent of this service. This package has been built locally, but migrations, Auth, provider calls, connector accounts, Docker operation and recovery have **not been exercised live**. The next session owns those checks.

## Hosted Supabase path

1. Create or select an approved Supabase project. Review all five SQL migrations, then apply them in filename order with the Supabase CLI. This creates project snapshots, command journals, private originals, memberships, request allowances and jobs. It moves no portable file until the user explicitly chooses **Create shared master**.
2. Disable public signup. Create intended Auth accounts and enable provider users in `relay_ai_access`; project membership is an additional requirement for project-scoped requests. Shared editors, reviewers, observers and sanitized readers are distinct capabilities.
3. Set backend secrets using an ignored file derived from `relay-secrets.example.env`. Set actual available API model IDs. OpenAI and Anthropic are explicitly selected; unavailable providers fail without switching. Browser settings contain only the service origin and public gateway key.
4. Deploy `relay-ai`, `relay-projects` and `relay-jobs`. Application functions verify Auth themselves. The jobs endpoint requires a separate worker secret rather than a user JWT. Restrict allowed website origins to actual HTTPS origins and explicitly selected local development origins.
5. Sign in from the app, select your existing project identity, and explicitly authorize transferring a portable project to the service. Add existing Auth users through **Manage membership**. Imported portable approvals are historical claims, distinct from this service's authenticated command journal.
6. Run the worker with Node 24 or newer, using operator-only environment values `RELAY_SERVICE_URL`, `RELAY_SERVICE_PUBLIC_KEY` and `RELAY_WORKER_SECRET`:

   ```sh
   node --env-file=deploy/worker.local.env scripts/run-worker.mjs --once
   ```

   Omit `--once` for the operator-supervised loop. Provide process supervision on your own server. There is no scheduler secretly running on GitHub Pages.

7. Configure `RELAY_CONNECTORS_JSON` using the example, with real project UUIDs and explicit allowlists. Credentials are resolved by the indicated environment-variable names. A provider-specific read never crawls the whole organization. Review results before importing source text, mapping cases, recording deployment observations or publishing an external comment.

## Self-host path

`npm run package:backend` creates `work/relay-backend-package` with copied functions, colocated domain contracts, ordered migrations, operator templates and SHA-256 file hashes. It rewrites browser-contract imports for a single functions volume; it starts nothing.

Use the official Supabase Docker distribution pinned to `self-hosted/v0.8.2`, the snapshot shown in the [official installation guide](https://supabase.com/docs/guides/self-hosting/docker). Follow its secret/key generation and HTTPS configuration. Keep the upstream main function router. Copy the package's `functions/*` into `volumes/functions/`, preserving that router. Merge the supplied Compose override and supply the ignored `relay-secrets.local.env`; do not start with example credentials. The app accepts a self-hosted HTTPS origin and Supabase public key.

Apply the package's migrations to the initialized database, in filename order, with `ON_ERROR_STOP` and a backup first. The pinned distribution supplies the Auth, Storage and service-role prerequisites. Configure Auth site/callback URLs for the actual Pages site and prohibit anonymous signup. Recreate the functions container when changing secrets, then validate the same authorization matrix as the hosted path. [Official self-hosted functions guidance](https://supabase.com/docs/guides/self-hosting/functions).

The package does not configure your DNS, TLS certificate, mail service, disks, backup destination or process supervisor. Fresh installation, migration compatibility and upgrade/restore operation remain validation gates, not reported achievements.

## Backups, retention and recovery

Assign a named operator. Back up the database (including Auth, memberships, command IDs, budgets, job/outbox receipts and Storage metadata), private Storage **object bytes**, container configuration and securely held secrets. A Postgres dump alone does not contain object files. Encrypt backups at the destination; Docker volume encryption and backup encryption are operator responsibilities. Shared processing uses authorized plaintext, not user-held end-to-end encryption.

Restore into an isolated service first. Restore identities, database schema/state and object bytes together; disable workers while inspecting old queued/leased jobs and outbox sends. Reconcile external side effects before restarting processing. Verify two-account access denial, project revision/hash, original-file hashes, baselines, current receipts and exact old result/deployment provenance. Record actual restore time and recoverable data loss in **Budgets, retention and restore evidence**; an entered number is an operator report requiring independent review.

Retention settings record the intended policy. Automatic destructive retention is deliberately disabled. Before an operator implements cleanup, create and verify the backup, inventory active source/job/asset provenance and unresolved sends, and publish which historical restore points will cease to exist. Never remove a receipt still needed to justify a current retrieved source/result. Downloaded portable files remain with their holders after server revocation.

Upgrade: export an encrypted master, take and verify full backups, inspect the package manifest and migration diff, deploy to an isolated restored copy, run authorization/lifecycle/job/connector checks, then upgrade the real service. For rollback, stop workers and reconcile sends before restoring a compatible database **and** function package. Rolling back only the frontend does not reverse database migrations or external comments.

## Connector and job boundaries

| Area | Implemented boundary |
| --- | --- |
| GitHub | Selected issues/PRs, actual run/artifact metadata, deployment/status observations, reviewed comments, administrator-configured test-only dispatch. Actual artifacts need bounded result-file import; workflow success alone gives no case coverage. |
| Confluence | Selected page/version and storage-format text. Macros, attachments and full layout need source review. |
| Drive | Selected plain text/Markdown/CSV or Google Doc text/Sheet CSV exports, with before/after revision checks. Multiple sheet tabs/formulas are not silently included. Short-lived OAuth tokens must be refreshed by the operator; an OAuth connection wizard is not included. |
| Azure | Selected work items and bounded actual test results, with explicit native case/scope mapping. |
| ClickUp | Selected task context and selected document page text, bounded to 50 pages / 200,000 characters. Page/revision provenance is retained; formatted blocks and embeds can be missing. [ClickUp pages API](https://developer.clickup.com/reference/getdocpagespublic) and [format limitations](https://developer.clickup.com/docs/docsimportexportlimitations). Actual tenant response shapes and access still require validation. |
| OCR/audio | Selected PNG/JPEG or short PCM WAV only: 2 MB, 20 million pixels, two minutes. Provider model access is required. No scanned-PDF conversion, speaker diarization or fabricated coordinates. |
| Original assets | 2 MB each / 6 MB embedded portable bytes; optional private shared uploads up to 6 MB each. Remote references are not offline copies of the bytes. Both downloads verify raw-byte SHA-256. [Storage upload](https://supabase.com/docs/reference/javascript/storage-from-upload), [download](https://supabase.com/docs/reference/javascript/storage-from-download). |
| Job recovery | Revision/access/hash recheck, lease and checkpoints, bounded safe-read retry/backoff, cancellation. Expired/ambiguous paid calls or external sends become uncertain and require reconciliation; domain idempotency is not a billing guarantee. |
| Notifications | Authorized in-app feed and relevance subscriptions. Digest preference is stored; scheduled email/chat delivery is not implemented. |

Keep diagnostic logs to IDs, timestamps, status and error codes. Do not enable body/token logging in the reverse proxy or SDK. Health exposes queue/failure/uncertainty counts for a bounded window, not a promise of complete observability or measured uptime.
