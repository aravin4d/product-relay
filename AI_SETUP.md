# Optional AI service

The portable/manual application works without an account or AI key. The code for the optional AI connection is included, but **no live backend or provider has been configured or verified**. GitHub Pages hosts the interface; it cannot run a protected AI function by itself.

## What is implemented

- A browser client with password sign-in against Supabase Auth. It keeps the session token in memory and saves only the public project URL/publishable key when requested.
- An authenticated `relay-ai` function using Supabase `getUser(token)` to verify the caller, not merely decoding JWT claims. An operator must additionally enable that account in the private allowlist. [Verified user lookup](https://supabase.com/docs/reference/javascript/auth-getuser).
- An OpenAI Responses adapter for handbook candidates and source-grounded questions, with structured output and independent shape/evidence checks. Candidates are proposed content requiring human review. [Responses text generation](https://developers.openai.com/api/docs/guides/text), [structured output](https://developers.openai.com/api/docs/guides/structured-outputs).
- Exact source/revision quotations, input hashes, model/prompt/schema provenance, and token-usage metadata. A valid quote does not establish that the AI correctly interpreted every qualifier; reviewers still decide the behavior.
- Explicit origin allowlisting and outbound plaintext confirmation. At most 8 selected source revisions, 24,000 characters per source, 48,000 characters total, 220 KB per request, 4,000 output tokens, and 12 behavior candidates per extraction.
- A database transaction reserving daily request allowances before a provider call: 10 per enabled account by default, adjustable from 1–20; 100 across the entire deployment. Failed processing attempts still consume a reservation because a provider may already have processed or billed them. These are request limits, not an exact monetary spending cap.

Source documents, provider outputs, passwords, project passphrases, and vault keys are not stored in the allowance database. Only allowlisted user IDs, daily limits, and counts are stored. Tables have RLS enabled, no public/user policies, and no anonymous/authenticated grants. The privileged reservation RPC is executable only by `service_role`.

## Configure when backend/API access is available

An operator needs one Supabase project, permission to deploy migrations/functions, an OpenAI API project/key, and a model available to that API project with Responses and structured output support. Coding usage in Codex does not fund these runtime API calls. Choose the exact API model/settings after checking actual access; do not paste a Codex model label into a backend model setting.

1. Use the Supabase CLI to sign in and link this repository to that approved project:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   Review the migration first. It creates only `relay_ai_access`, `relay_ai_usage`, `relay_ai_global_usage`, and `reserve_relay_ai_request`. No project data moves into the backend.

2. Configure function secrets through the Supabase Dashboard, or an ignored local secrets file supplied with `supabase secrets set --env-file YOUR_IGNORED_ENV_FILE`. Required values:

   | Name | Value |
   | --- | --- |
   | `OPENAI_API_KEY` | Provider credential, backend only |
   | `OPENAI_MODEL` | Exact API model ID supported by your account |
   | `RELAY_ALLOWED_ORIGINS` | Comma-separated exact website origins, such as `https://aravin4d.github.io,http://127.0.0.1:4173` |

   Supabase injects its URL and public/secret keys. The function accepts the current `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS` dictionaries (`default` entry), their single-key local variants, or legacy anon/service-role variables. Keep the service-role/secret key in the function environment. [Backend secrets](https://supabase.com/docs/guides/functions/secrets).

3. Disable public sign-ups in the hosted Auth configuration; the local configuration already does this. Create/invite the intended test account through the Auth administration interface. Enable that account's UUID through an administrator SQL session:

   ```sql
   insert into public.relay_ai_access (user_id, daily_limit)
   values ('THE_AUTH_USER_UUID'::uuid, 10);
   ```

   This is independent from portable project names and team roles. Those names do not grant service access.

4. Deploy:

   ```sh
   supabase functions deploy relay-ai
   ```

   `supabase/config.toml` disables the platform's legacy `verify_jwt` check for this function; the function itself still requires and verifies the exact user token using Auth `getUser`, rejects anonymous accounts, and enforces the server allowlist. This also permits the browser's unauthenticated CORS preflight. Do not remove that application authentication. [Function authentication](https://supabase.com/docs/guides/functions/auth).

5. In Product Relay's optional AI settings, enter only the project's HTTPS origin and **publishable/legacy anon** key. Sign in with the enabled test account. Start with the fictional fixture, select explicit source revisions, confirm plaintext processing, and inspect/reject/accept the proposed content. Provider keys do not belong in those settings or a `.relay` file.

6. Verify the actual deployment: allowed versus unlisted/expired sessions; known versus unknown origins; quota exhaustion; a small successful request with exact citations; refusal/timeout behavior; a revised source invalidating an earlier candidate; and ordinary manual use without a connection. A passing fake-adapter test is not proof of a live provider connection.

## Local checks

The committed credential-free tests exercise the same browser protocol, provider HTTP envelope, and gateway handler:

```sh
node --test tests/ai.test.mjs
```

For a local Supabase stack, review and apply the migration with `supabase db reset`, then run `supabase/tests/ai_allowance.sql` through a local database SQL client. That script checks grants, denied access, per-user limits, and the global allowance in a transaction that rolls back. **Run it only on a disposable local test database.** It deliberately clears current-day counters inside its rolled-back transaction to isolate the fixture.

Local validation completed on 4 October 2026: Deno 2.9.6 checks the actual function module and imports using the committed lockfile and pinned Supabase SDK 2.117.2. A Deno runtime test loads the real entry point and exercises CORS, Auth, privileged RPC, and the Responses envelope through intercepted fictional HTTP. Run:

```sh
deno check --node-modules-dir=none --lock=supabase/functions/deno.lock supabase/functions/relay-ai/index.ts
deno test --allow-env --node-modules-dir=none --lock=supabase/functions/deno.lock supabase/tests/relay_ai_runtime_test.ts
node --test tests/ai-allowance.test.mjs
```

The allowance migration and operator fixture executed against ephemeral PGlite 0.5.8 (PostgreSQL 18.3). Nine tests prove role/table/function restrictions, actual reservation constraints/counters/rollback/UTC, and fail-closed handler integration. PGlite serializes a queued burst; actual multi-connection advisory-lock contention requires an ordinary PostgreSQL deployment. No Supabase project, real Auth account, paid inference, or deployed function is verified. Retain `src/ai.js` when deploying from the repository root: the function uses that shared protocol.

AI explanations receive the selected approved agreement descriptions, their qualifiers, exact supporting fragments, chosen baseline, and known unknowns. Current stale evidence is excluded. Historical evidence stays tied to its preserved baseline revision. Local term matching can miss relevant material, and valid quotations do not prove that the model preserved their meaning. Review output before treating it as useful product context.

## Data and prototype limits

Selected plaintext is sent over HTTPS to the configured gateway and then OpenAI. Inference is not end-to-end encrypted. The function sends `store: false`, uses no tools, and makes no external document searches. That setting is not a universal zero-retention guarantee: provider monitoring, caching, and applicable account policies still matter. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

One bounded foreground request has a 45-second provider deadline and a 75-second browser deadline. Authentication/allowance calls have 8-second network deadlines. Timeouts leave project content untouched; there are no automatic provider retries, durable jobs, queue resumption, or fallback to another provider. Larger documents must be reduced to reviewed selected passages. Hosted function runtime limits are another reason to keep these requests small. [Function limits](https://supabase.com/docs/guides/functions/limits).

Sessions expire and require another sign-in; refresh tokens/passwords are not persisted. The existing local project cache is independent from service sign-in. An operator can disable a user in `relay_ai_access` to stop new AI requests. This does not revoke a portable project file already shared with that person.

The function does not certify document approvals, authenticate portable team decisions, infer whole-system dependencies, or prove that an answer is correct just because its quotations exist. Review, source revisions, baseline applicability, and verification evidence remain the application's responsibility. These constraints keep the prototype useful while making the next work explicit.
