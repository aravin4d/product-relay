# Retrieval, delivery-task and provider evaluation

These runners and fixtures were built but **not executed**. Inputs/labels are authored fictional scenarios, with separate development and holdout splits and file hashes. Independent label review is required. Do not tune against holdout failures and then report those same cases as unseen evidence.

`npm run evaluate:retrieval` measures applicable retrieval, forbidden scope, baseline isolation, stale/unavailable originals, absent deployment and refusal to use raw exploration as approved context. It writes numerators/denominators and failures under ignored `work/evaluation/`. It does not score semantic answers or prove authorization security.

Provider comparison submits identical source-backed context to explicitly selected adapters. It records model IDs, latency, usage, shape/citation rejection and failed requests. Every eligible case consumes a request per provider; failed calls may consume allowance and billing. Configure ignored operator values `RELAY_EVAL_URL`, `RELAY_EVAL_PUBLIC_KEY` and a short-lived `RELAY_EVAL_ACCESS_TOKEN` for an enabled test account. Provider keys stay on the backend.

```sh
node --env-file=deploy/evaluation.local.env scripts/evaluate-providers.mjs --providers=openai,anthropic --split=development --allow-provider-calls
node --env-file=deploy/evaluation.local.env scripts/evaluate-delivery.mjs --providers=openai,anthropic --split=development --allow-provider-calls
```

The existing `cases.json` covers answers. `delivery-cases.json` adds **32 cases across eight non-answer tasks**: product extraction, test drafts, handoffs, scope/impact review, Support briefing, operational runbooks, incident triage and contradiction candidates. Each task has one development and three holdout cases, with source-backed qualifiers, prohibited assertions, unknowns and abstention expectations. `--task=TASK_ID` selects one delivery task; `--split=holdout` selects the frozen holdout.

Review every output using the same rubric: qualifiers preserved, unsupported assertion count, appropriate abstention, accepted/rejected drafts and correction seconds. Failed requests remain in the denominator. A quotation or valid schema does not establish correct interpretation. Populate `humanReview` in the saved result, then:

```sh
node scripts/score-evaluation.mjs work/evaluation/delivery-REPLACE_TIMESTAMP.json
```

The scorer reports reviewed counts, incomplete reviews, failures and correction effort. It refuses development data as a holdout score. Model rankings, quality targets and any superiority claim require actual reviewed results; no such result exists from this build.

`tests/phase2-performance.html` is a click-started browser fixture for fictional dataset tiers, query/export/encrypted save/reopen timings and budgets. Serve the repository locally and open that path in the intended browser; it runs only when started. Its results need browser/device/commit identification and interpretation against real supported sizes. No timing was recorded here.

In-app **Workflow observations**, **Export study report** and **Verification handoff** retain actual role-specific same-task evidence, total participant plus PM/preparation/correction time, failures and gate references. Simulated/self-reported observations are labeled and excluded from actual-observation totals. A completed form is still evidence requiring independent review, not a certification.

Actual PM/BA/Development/QA/Support/Operations participants and licensed comparable tools remain necessary for the usefulness/competitor exercise in [the handoff](../PHASE_2_NEXT_SESSION.md). These fixtures cannot establish product-market usefulness, company-wide savings or universal superiority.
