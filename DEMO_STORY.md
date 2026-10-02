# Product Relay — the story that should prove its value

This is a proposed fictional demonstration and pilot protocol, not behavior already implemented in release 0.2.0. Use it throughout the [single-session waves](BUILD_WAVES.md).

## The story people should remember

**A product decision changes. Everyone can see what it means for their work and which old evidence no longer applies.**

Product Relay starts before the first walkthrough and carries that same understanding through delivery. The demonstration uses Orbit subscriptions, a fictional SaaS product.

## Before the first walkthrough

Maya, the PM, imports a PRD and SOP. The PRD says ordinary cancellation prevents renewal while access continues to the paid period's end. The SOP says fraud-flagged customers can have access revoked immediately, but does not identify the release implementing that exception.

The app proposes two qualified behaviors and asks an explicit question about the fraud exception's release and owner. It does not flatten them into "cancellation immediately removes access." Maya uses the evidence-backed gaps as the walkthrough agenda.

Success: the team can inspect the rules and their locations, and the unknown release stays unknown.

## After the walkthrough

Maya supplies notes/transcript saying the fraud exception is planned for release 2 and that Development owns the revocation behavior. A phrase saying "cancel immediately" is ambiguous in isolation. The app displays the surrounding passage and asks whether it applies only to fraud-flagged workspaces.

Maya records the resolution: release 1 retains its ordinary behavior; release 2 adds immediate revocation for the fraud case. Sam, the developer, reviews the proposed applicability. The PM approves the exact qualified rule and saves the first baseline.

Success: spoken discussion is preserved and attributed where available, and owner review establishes what is agreed. The app does not infer implementation from a promise in a meeting.

## A later change arrives

Maya imports a revised PRD that formally adds the fraud-only behavior for release 2. The app shows what changed, the affected behavior, and suggested work. Maya confirms the applicability and impact.

| Person | Proposed action | Completion evidence |
| --- | --- | --- |
| Maya / Product | Confirm fraud scope, user messaging, and release applicability. | Reviewed decision and approved rule revision. |
| Sam / Development | Review the supplied billing/access dependency and implement the fraud branch. | Implementation reference plus explanation of applicability; not automatically certified from a link. |
| Alex / QA | Verify fraud cancellation removes access, blocks renewal, and preserves ordinary cancellation behavior. | Test cases/results tied to the rule revision, build, and environment. |
| Operations | Check rollout, monitoring, and rollback of access revocation. | Reviewed runbook and relevant operational checks. |
| Jordan / Support | Update fraud-cancellation guidance and escalation. | Reviewed customer-safe guidance for the approved release. |

Existing evidence for "all cancellation retains access" becomes stale where it covered the fraud path. Existing ordinary-cancellation evidence remains applicable unless another dependency invalidates it. Previously acknowledged changes are reviewed again only when their relevant meaning changes.

Success: every proposed action has an explanation and owner, unaffected work is preserved, and checking "I've read this" does not mark verification complete.

## During delivery review

Sam records implementation, Alex attaches test results, Operations provides rollout checks, and Support reviews its guidance. One missing rollback check remains visible with its owner.

The tool says what is agreed, implemented as reported, verified with supplied evidence, and still unresolved. It does not announce "100% release ready." Maya/QA manager can inspect the remaining gap and decide what to do.

## When the next person joins

A new QA teammate opens the PM's `.relay` file or the shared project, chooses the QA view, and asks: "Why does fraud cancellation differ, and what do we still need to check?"

The answer identifies the relevant release, original passages, owner decision, changed test expectations, and outstanding rollback check. A question about release 1 produces the earlier position rather than mixing release 2 into it.

## Pilot: prove benefit rather than polish

Use three authorized product scenarios: one new handoff, one later behavior change, and one teammate onboarding. Aim for five participants covering Product, Development, QA, Operations, and Support; treat this as a proposed sample, not known team size.

First measure their current method using the same documents and questions. Then repeat equivalent scenarios with Product Relay. Rotate comparable scenarios to reduce learning effects. Record preparation time, decision reconciliation time, repeated clarification questions, missed exceptions, incorrect conclusions, reviewer effort, and costs. Ask what they still had to maintain elsewhere.

Proposed success targets are at least 30% less preparation/reconciliation time, no increase in consequential errors, and users wanting to reuse it for a second real change. These are hypotheses until measured. A small pilot cannot establish statistical superiority or market novelty.

Do not measure success solely by generated word count, uploaded documents, model confidence, or how many AI actions were produced. The worthwhile result is less repeated work and fewer conflicting interpretations across the team.

## Three-minute public showcase

1. Open the initial PRD/SOP and show the unresolved fraud exception.
2. Add the walkthrough clarification and inspect the explicit owner resolution.
3. Add the revised PRD and show the scoped before/after behavior.
4. Switch between Development, QA, Operations, and Support to show their concrete actions.
5. Show one stale test result, one still-valid result, and a missing operational check.
6. Open an earlier baseline and explain why its behavior differs.

All showcase material must be fictional or explicitly authorized for publication. Show feature status honestly; until its wave passes, label demonstrations as planned or simulated.
