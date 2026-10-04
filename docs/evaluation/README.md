# Retrieval and provider evaluation

These runners were built but deliberately **not executed** in the implementation session. Fixtures are fictional. The candidate dataset has separate development/holdout labels and a file hash; it is not an independently validated benchmark. Never tune against holdout failures and then report those same cases as unseen quality evidence.

`npm run evaluate:retrieval` checks applicable retrieval, forbidden scope, baseline isolation, unavailable/stale originals, absent deployment and refusal to use raw source exploration as approved AI context. It writes the full numerator/denominator and failed cases to ignored `work/evaluation/`. It does not score semantic answers or prove authorization security.

Provider comparison uses the same source-backed payload for each explicitly selected provider, with a common context hash. It measures returned model ID, latency, usage, citation/shape rejection and failed requests. Each eligible case consumes a runtime request per selected provider. Failed calls may consume allowance/billing. Configure an ignored operator environment file with `RELAY_EVAL_URL`, `RELAY_EVAL_PUBLIC_KEY` and a short-lived `RELAY_EVAL_ACCESS_TOKEN` for an enabled test account. No provider key belongs in the browser/CLI arguments.

```sh
node --env-file=deploy/evaluation.local.env scripts/evaluate-providers.mjs --providers=openai,anthropic --split=development --allow-provider-calls
```

For a frozen holdout run, use `--split=holdout`. Review its output without changing the fixture to excuse failures. Outputs stay local and contain fictional plaintext; never run real customer material through this harness without a separate reviewed dataset/process.

The provider runner checks answers only. Test-case, handoff, scope-change, Support, Operations and incident tasks also need separate labeled development/holdout inputs and human ratings before P2-047 can be closed. Record qualifier preservation, authority, contradictions, correct abstention, unsupported assertions and correction seconds. A valid quotation is not proof of a correct interpretation. Do not rank models using citation validity or latency alone.

Real-team savings and competitor comparisons remain separate participant exercises described in [the next-session handoff](../PHASE_2_NEXT_SESSION.md). This dataset cannot establish product-market usefulness or universal superiority.
