# Optional protected AI and shared service

The manual encrypted-file application works without accounts or AI. Phase 2 adds protected OpenAI/Anthropic adapters and optional shared service code. **No live backend, model account or provider inference has been configured or verified.** GitHub Pages hosts the interface; functions and workers run elsewhere.

## Data and authority

The browser retains only public service settings and a tab-memory sign-in token. Provider keys and service-role credentials remain server-side. Auth calls verify the user with Supabase `getUser`; AI users must also be enabled in `relay_ai_access`. Shared-project requests additionally check membership/capability and independently reconstruct selected source/record/answer context before and after inference. Portable excerpts are user-provided file-holder claims; the service cannot authenticate a local file's historical approvals. [Verified user lookup](https://supabase.com/docs/reference/javascript/auth-getuser).

AI candidates remain drafts. Exact citations, schemas, input hashes, model/prompt metadata and stale-context checks can reject invalid output; they cannot prove that an interpretation preserved every qualifier. Owner approval, implementation, test evidence and deployment remain separate.

OpenAI uses Responses with structured output and `store: false`. Anthropic uses Messages with explicit structured output. Set exact API model IDs available to the actual accounts; a Codex model label is not an API identifier or funded runtime allowance. Provider selection is explicit, and unavailable providers fail without switching. [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

Selected plaintext goes over HTTPS to the configured service/provider. This processing is not end-to-end encrypted. `store: false` is not a universal zero-retention guarantee; account and provider policies still apply. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

## Install when approved backend access is available

Full operator instructions and self-host packaging are in [deploy/README.md](deploy/README.md). This repository now contains **five migrations**, not only the earlier allowance migration. Review them before applying: they create optional project snapshots, revisions/journals, memberships, private asset receipts, jobs/outbox, notifications, request allowances and minimal AI receipts. A portable project moves into server plaintext only after **Create shared master** consent. Do not claim the database contains no project data after that action.

For an approved hosted Supabase project:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Disable public/anonymous signups; create intended accounts through administration. Enable a chosen Auth user through an administrator SQL session:

```sql
insert into public.relay_ai_access (user_id, daily_limit)
values ('THE_AUTH_USER_UUID'::uuid, 10);
```

Backend secrets go in the dashboard or an ignored local file used by `supabase secrets set --env-file`. See `deploy/relay-secrets.example.env` for placeholders. Required by the selected path:

| Setting | Purpose |
| --- | --- |
| `RELAY_ALLOWED_ORIGINS` | Exact enabled HTTPS website origins and explicit local development origins. |
| `RELAY_DEFAULT_PROVIDER` | Explicit default `openai` or `anthropic`. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI backend credential and actually available model. |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Anthropic backend credential and actually available model. |
| `OPENAI_OCR_MODEL`, `OPENAI_TRANSCRIBE_MODEL` | Separately configured available models for bounded media jobs. |
| `RELAY_WORKER_SECRET` | Separate random operator worker credential, at least 32 characters. |
| `RELAY_CONNECTORS_JSON` | Explicit project/provider reference allowlists; credentials resolved server-side. |

Supabase supplies its service URL/public and privileged keys. The runtime accepts current publishable/secret-key dictionaries and legacy equivalents. Never expose the privileged key through the website. [Function secrets](https://supabase.com/docs/guides/functions/secrets).

Deploy `relay-ai`, `relay-projects` and `relay-jobs`. `config.toml` disables the platform's legacy JWT verification because user-facing functions verify Auth themselves and support CORS preflight. The worker route verifies its separate worker secret. Keep those application checks. [Function authentication](https://supabase.com/docs/guides/functions/auth).

In the app's connection settings enter only the service HTTPS origin and **publishable/legacy anon key**, then sign in with the enabled account. Sessions require renewed sign-in when expired; passwords/refresh tokens are not persisted. Selecting a portable teammate name does not create an Auth user or grant server membership. Provider OAuth/token refresh currently belongs to the operator; a connection wizard is not built.

## Tasks, limits and cost

Tasks cover product extraction, agreement-grounded answers, cases/charters, handoffs, qualifier/impact review, Support brief, operational runbook and incident triage. Each request is bounded to 8 source revisions, 24,000 characters per source, 48,000 source characters total, 220 KB/request and 4,000 output tokens. Selected delivery context is separately bounded to six records/24,000 characters. Quotes must occur in the submitted exact revisions. Conflicting or unknown information remains reviewable rather than automatically approved.

The private enabled-account request limit defaults to 10/day (configured 1–20); deployment-wide limit is 100/day. Shared projects additionally have owner-controlled enablement and a 0–100 daily request allowance, default 20. These are request reservations, not exact monetary caps. Failed/cancelled/uncertain attempts may consume allowance and provider billing. Usage/latency receipts contain identities/hashes/model/task metadata, not prompt/output bodies; authorized shared snapshots can contain saved draft text.

Foreground inference has a 45-second provider deadline and 75-second browser deadline, with no automatic provider retry. Background media/connectors use explicit durable jobs, bounded safe-read retries, leases/checkpoints and cancellation. Ambiguous paid calls/external sends require reconciliation; domain idempotency does not guarantee exactly-once billing. Scheduled email/chat/digest delivery is not implemented.

PNG/JPEG OCR and short PCM WAV transcription require explicit selected-file consent. Limits are 2 MB, 20 million pixels and two minutes. No scanned-PDF conversion, diarization or fabricated coordinates are provided. Shared private original uploads are separate consented operations.

## Next-session verification

The user deferred functional tests for this checkpoint. Prior 0.4.0 fixture/runtime results are historical. Do not claim the new migrations, SQL race behavior, SDK runtime or live provider schemas work solely because syntax/static linking passes.

Start with `npm run check` and [the test handoff](docs/PHASE_2_NEXT_SESSION.md). In an isolated environment verify two-user/two-project authorization, expired/revoked accounts, unknown origins, disabled project/account, exhausted allowances, concurrent commands, actual model availability, correct schema/refusal/timeout output, source/record changes during inference and content-minimized diagnostics. Preserve denied/stale output without changing approved content. No real key belongs in public test fixtures.

Deno module/type checks are also pending for the new entries. Review the pinned SDK/import/lock configuration before running the actual functions. The original SQL allowance fixture deliberately changes counters inside a rolled-back transaction and belongs only in a disposable test database.

Optional answer/retrieval comparison is documented in [docs/evaluation/README.md](docs/evaluation/README.md). Its runners were created but not run. Only explicit operator invocation can make provider calls. Human qualifier/authority/unknown/correction scoring and other task holdouts are required before claiming model quality or any superiority.
