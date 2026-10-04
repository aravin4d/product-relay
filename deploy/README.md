# Optional shared service

GitHub Pages hosts the interface and encrypted-file workflow. The optional service runs elsewhere and holds authorized project plaintext, authentication, protected provider credentials and jobs. This continuation supplies code and operator tools; no migration, account, notification, provider call, deployment or recovery drill was executed.

## Hosted Supabase path

1. Create an approved Supabase project. Review all **seven migrations**, then apply them in filename order. They create project snapshots, immutable command journals, memberships, private-original receipts, request allowances, jobs, delivery receipts, directory groups, operational controls and encrypted connector-account storage. No portable file moves until its holder chooses **Create shared master**.
2. Disable public signup and create intended Auth accounts. Enable AI users in `relay_ai_access`. Project membership separately controls editor/reviewer/observer/sanitized-reader capabilities. A portable teammate name is not a server account.
3. In the repository, `npm run setup:service` creates **ignored** `deploy/operator-state/` files with fresh worker/credential/backup keys and public example configurations. This only prepares local files. It refuses to overwrite existing keys. Fill in actual service/database values, provider app credentials and available API model IDs; retain the backup key separately. Never put a privileged key into browser settings or Git.
4. Set `RELAY_ALLOWED_ORIGINS` to the exact website origins. Load reviewed JSON into `RELAY_CONNECTORS_JSON`, `RELAY_OAUTH_JSON` and `RELAY_DELIVERY_JSON`; private JSON files do not load themselves. Each selected connector still needs explicit project/reference allowlists. Use an ignored env file with the Supabase secrets command or dashboard.
5. Deploy `relay-ai`, `relay-projects`, `relay-jobs`, `relay-connectors` and `relay-operations`. User-facing actions verify Auth in application code; job/operations workers verify a separate secret. The OAuth callback verifies a single-use expiring state. Preserve those checks when deploying with platform JWT verification disabled.
6. Sign in from the app using only service HTTPS origin and public key. Explicitly create/open a shared master, map existing Auth users to project members, and assign capabilities. Imported file approvals remain historical claims; authenticated server commands have their own journal.
7. Run the Node 24 worker under a process supervisor with operator-only `RELAY_SERVICE_URL`, `RELAY_SERVICE_PUBLIC_KEY` and `RELAY_WORKER_SECRET`:

   ```sh
   node --env-file=deploy/operator-state/relay-secrets.local.env scripts/run-worker.mjs --once
   ```

   Omit `--once` for continuous operation. It processes durable jobs and scheduled operations. GitHub Pages runs no background scheduler.

## Connector accounts and selected references

Register only the providers you intend to use. Each application must use the exact `relay-connectors` callback URL and approved app return URL from `oauth.example.json`. Match client ID/secret environment names, tenant scopes and connector allowlists. **Connect provider account** obtains consent; tokens never return to the browser. Credentials are AES-GCM encrypted with `RELAY_CREDENTIAL_KEY` and bound to project/user/provider. Disconnect disables future use in Relay; provider-side revocation is separate.

| Provider | Setup / boundary |
| --- | --- |
| GitHub | Register an OAuth application and select scopes. The example uses `repo offline_access`; `repo` is broad provider permission, while Relay restricts selected repositories/actions. For more restricted provider permissions, operator-supplied fine-grained credentials remain available. Selected issues/PRs, runs, ZIP artifacts and deployment observations; reviewed comments and administrator-selected test-only dispatch. [Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps), [authorization flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps). |
| Confluence | Register a 3LO application, `read:page:confluence offline_access`, and the approved cloud ID/site origin. Both must match the selected connector. Storage-format macros/attachments/layout require review. [3LO setup](https://developer.atlassian.com/cloud/confluence/oauth-2-3lo-apps/), [scopes](https://developer.atlassian.com/cloud/confluence/scopes-for-oauth-2-3LO-and-forge-apps/). |
| Drive | Register a web-server OAuth client and selected read scope. Offline consent obtains refresh credentials. Reads bounded selected text/Markdown/CSV, Google Doc text and selected Sheet CSV exports with revision checks; other tabs/formulas are not implicitly included. [Web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server). |
| Azure | Register an application for a **specific tenant**, with the selected Azure DevOps delegated scope and offline access. Selected work items/test results still require project allowlists and native case/scope mapping. [Authorization-code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow). |
| ClickUp | Register the exact redirect URI and client credentials. Selected tasks/document pages remain bounded; page formatting/embeds can be lost. Access loss or a non-refreshable expired token requires reconnection. [Authentication](https://developer.clickup.com/docs/authentication), [token endpoint](https://developer.clickup.com/reference/getaccesstoken). |

A refresh lease prevents concurrent blind retries of rotating credentials. An interrupted or ambiguous exchange requires reconnection. Consent or a valid token cannot bypass the external account's permissions. Refresh never silently changes approved product context.

GitHub artifact ingestion follows a bounded signed download, checks a supplied digest, ZIP structure/CRC, expansion limits and JUnit/Relay JSON shape. It does not extract arbitrary filesystem paths. Actual cases still need reviewed native mappings; workflow success alone proves no requirement coverage. [Artifacts API](https://docs.github.com/en/rest/actions/artifacts).

## Notifications, groups and operations

Configure administrator-approved destinations using `delivery.example.json`: verified-account email through Resend, Slack, Teams or a generic HTTPS receiver. Destination secrets stay on the server. Members explicitly enable a destination and their relevant feed subscription. Digest batches contain a generic update count and direct users to their authorized project, without source bodies. Membership, project and destination consent are checked before sending. Deduplication receipts prevent automatic repeats; timed-out or ambiguous sends require operator reconciliation. No sends were made during this build.

An organization owner can create groups of **existing Auth users**, map them to project members and grant capabilities on projects they own. A project/account has one managed group grant at a time. Removing group membership restores the earlier direct membership or revokes a group-created grant; a direct membership override detaches the group grant atomically. This is not external SSO/SCIM provisioning.

Health rotates through bounded project batches and records changed backup/queue/failure/uncertainty signals in the owner's feed. Destination subscriptions control external delivery. Job counts describe the latest 200-job window. Monitoring infrastructure, provider availability and measured uptime remain operator responsibilities.

## Encrypted backups, retention and recovery

The operator needs Node 24, compatible `psql`/`pg_dump`/`pg_restore`, database privileges and private Storage access. Retain a separate random 32-byte base64 `RELAY_BACKUP_KEY`; losing it makes these backups unreadable. A credential-vault key rotation also requires a credential re-encryption procedure or reconnecting accounts; changing that key alone breaks old connector credentials.

```sh
node --env-file=deploy/operator-state/relay-secrets.local.env scripts/backup-service.mjs
node --env-file=deploy/operator-state/relay-secrets.local.env scripts/run-backups.mjs
node --env-file=deploy/operator-state/relay-secrets.local.env scripts/restore-service.mjs --file=/retained/backup.relay-backup
```

Backup holds an exported database snapshot, dumps it, downloads every receipted Relay private original, checks raw hashes, captures configured Relay/runtime secret references, then creates and integrity-extracts an AES-256-GCM encrypted archive. It records a verified-backup receipt only after extraction checks. The scheduler follows the shortest configured backup interval across projects. Keep operator env files private and give the backup volume to the container's `node` user. The package excludes ignored keys/configuration from distributable artifacts.

The scope is the full application database and **receipted Relay originals**. Unreceipted/unrelated bucket objects, infrastructure disks, TLS/DNS, PostgreSQL roles/extensions, Supabase JWT/encryption configuration, Auth mail settings and physical/PITR recovery are separately retained infrastructure. A dump contains Storage metadata, not object bytes; both are preserved here for receipted originals.

Restore without an apply flag only authenticates/decrypts/extracts. For a real drill, prepare an **empty isolated compatible database** with required roles/extensions, pointed to by isolated Supabase Auth/Storage services; disable workers. Set `RELAY_RESTORE_DATABASE_URL`, `RELAY_RESTORE_SERVICE_URL` and its service secret. This rejects a populated database and the recorded source database:

```sh
node --env-file=deploy/operator-state/relay-secrets.local.env scripts/restore-service.mjs --file=/retained/backup.relay-backup --apply-to-empty-environment
```

It restores database/object bytes, checks project revisions/original hashes, marks restored queued jobs/sends uncertain, invalidates old consent states and writes captured configuration to a private file **without activating it**. Configure compatible Auth/runtime settings and independently verify permissions before restarting workers. The restore records actual elapsed time only when executed; a successful extraction is not a completed service-recovery drill.

Retention is opt-in, needs a configured age **and a verified backup at the current revision from the last 48 hours**. It prunes terminal unreferenced jobs, older server snapshots and read feed entries that were never externally delivered. Approval/source/command journals, private originals, offline-return evidence and delivery receipts remain. This conservative policy is not unlimited storage cleanup; snapshot deletion changes historical server restore points. Downloaded portable files cannot be recalled.

## Self-host packaging and upgrade

`npm run package:backend` creates `work/relay-backend-package/`: five function entries, colocated domain contracts, seven migrations, public operator templates/scripts and a SHA-256 manifest. It copies no ignored operator state and starts nothing.

The existing reference is the official Supabase Docker `self-hosted/v0.8.2` snapshot. Review the [official installation guide](https://supabase.com/docs/guides/self-hosting/docker), pin the selected distribution and configure its secrets/HTTPS/Auth/Storage first. Copy packaged `functions/*` into its functions volume while preserving the upstream router, apply migrations in order with `ON_ERROR_STOP`, and merge the supplied Compose override. Set Auth site/callback URLs to the actual app; prohibit public signup. [Self-hosted functions](https://supabase.com/docs/guides/self-hosting/functions).

The optional operator Dockerfile uses the PostgreSQL APT repository and defaults to client major 17. Set `POSTGRES_MAJOR` at build time to match your selected database's supported tools; this image was not built or run during this session. [PostgreSQL Debian packages](https://www.postgresql.org/download/linux/debian/). Copy the package as `relay-package/` for the Compose build context and create a private operator env file. Backups need a writable retained `/backups` volume and compatible isolated restore infrastructure.

For upgrades, preserve an encrypted master and verified full backup, inspect migration/package manifests, apply to an isolated restored copy, then complete authorization/lifecycle/job/connector/recovery validation before upgrading the real service. Rollback requires compatible database **and** function/runtime configuration; stop workers and reconcile external sends first. A frontend rollback does not undo migrations or external comments.

Keep logs to IDs, timestamps, states and error codes. Do not log bodies, project plaintext, tokens or key-bearing URLs. Functional acceptance, Deno type/runtime checks, provider quality and real-team usefulness remain next-session gates.
