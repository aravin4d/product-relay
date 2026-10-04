# Product Relay — every earlier feedback point and its response

**4 October 2026. Expanded planning register; no fixes are marked implemented by this document.**

The previous summary used 15 broad REL findings, and the first backlog contained 69 engineering items. That grouping hid individual role and historical-review requests. This register makes **138 separately visible feedback entries** traceable to **91 engineering items**, including **22 newly explicit backlog items**. Related entries can share a fix; these counts are not unique feature counts or a claim of completed work.

Read this register first to check completeness. Use [the full plan](PHASE_2_PLAN.md) for architecture and build order, [the backlog](PHASE_2_BACKLOG.csv) for implementation/dependencies/acceptance, and [validation](PHASE_2_VALIDATION.md) for V01–V18. [CSV version](PHASE_2_FEEDBACK_COVERAGE.csv) supports filtering by role, package and disposition.

Sources: [original live six-role review](docs/reviews/2026-10-04/TEAM_REVIEW.md), [original 15 prioritized findings](docs/reviews/2026-10-04/IMPROVEMENT_BACKLOG.csv), [earlier 0.2 section review](IMPLEMENTATION_REVIEW.md), and [historical product direction/extensions](BUILD_PLAN.md). The six roles in the live exercise were simulations, not customer interviews. Earlier limits already addressed in 0.4 are labeled for preservation/reverification, not reintroduced as new defects.

## Reading the status

- **Planned:** specific Phase 2 work with acceptance criteria; not shipped.
- **Implemented / reverify:** earlier capability exists but the new lifecycle must preserve and test it.
- **Mode boundary:** the concern is addressed by accurate labeling and the appropriate optional controls; a static file cannot supply server identity, erase copies, or recover a lost key from nothing.
- **Alternative not selected:** recorded architectural choice, not a dropped bug. Browser-local inference is an example; manual offline use and protected optional AI remain the chosen path.

## Coverage by group

| Group | Individually listed entries |
| --- | --- |
| Reliability and trustworthy review | 11 |
| Product lead | 8 |
| QA lead and QA manager | 14 |
| Development lead | 10 |
| Business analyst | 10 |
| Support lead | 10 |
| Operations lead | 10 |
| Whole delivery team | 9 |
| Company perspective | 13 |
| AI and earlier architecture extensions | 13 |
| Earlier section-review gaps and preservation checks | 14 |
| Competitive improvement directions | 8 |
| Explicit architecture choices and boundaries | 8 |

## Feedback details

### Reliability and trustworthy review

Source: [Reliability and trustworthy review](docs/reviews/2026-10-04/TEAM_REVIEW.md#three-concrete-defects). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-001 | A valid authored project cannot reliably reopen | Canonical equality and idempotent normalization; repeated authored and encrypted roundtrips | P2-001, P2-002, P2-003, P2-004 · W01 · V01, V02 | Both; Planned |
| FB-002 | Sharing preparation fails after a walkthrough change | Validate and preserve linked snapshots throughout sharing and merge | P2-002, P2-004, P2-033, P2-034 · W01, W08 · V01, V02 | Portable; Planned |
| FB-003 | Reported save success can hide a reopening failure | Validate serialized reopen; distinguish cache/save/export and retained disk evidence | P2-003, P2-004 · W01 · V01, V02 | Portable; Planned |
| FB-004 | Identical snapshots fail because JSON object key order differs | Structured equality ignores object order while preserving real value/array differences | P2-001, P2-002 · W01 · V01 | Both; Planned |
| FB-005 | Prepared demos and single imports missed the lifecycle failure | Fresh authored fixtures and repeated create/change/save/share/merge cycles | P2-004, P2-014 · W01, W03 · V01, V02, V04 | Both; Planned |
| FB-006 | Do not disable quotation, identity or linked-history checks to repair persistence | Tamper mutations must still reject atomically; preserve original affected file | P2-001, P2-002, P2-003, P2-004 · W01 · V01, V02 | Both; Planned |
| FB-007 | Change review and its badge omit product-rule proposals | One selector and inbox for all proposal kinds | P2-005, P2-006, P2-007 · W02 · V03 | Both; Planned |
| FB-008 | Overview says caught up with five stale delivery actions | Counts and detailed queues use identical scoped attention items | P2-005, P2-007 · W02 · V03 | Both; Planned |
| FB-009 | Missing current owner receipts must remain visible | Separate required current-scope acknowledgment gap from completion and verification | P2-070, P2-090 · W02, W11 · V03, V07, V14 | Both; Planned |
| FB-010 | Managers need verification-gap reasons rather than a readiness percentage | Explicit obligation/evidence matrix, blockers and owned exceptions | P2-075, P2-039 · W06, W09 · V02, V03, V07, V08 | Both; Planned |
| FB-011 | Preserve original agreement, unrelated checks and earlier cited baselines | Immutable history, reviewed applicability and complete lifecycle regression | P2-004, P2-014, P2-031 · W01, W03, W07 · V01, V02, V04, V06, V07 | Both; Planned |

### Product lead

Source: [Product lead](docs/reviews/2026-10-04/TEAM_REVIEW.md#product-lead). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-012 | PM maintains sources, rules, handbook, tasks and sharing separately | Guided intake, linked derived facts and explicit external field ownership | P2-015, P2-017, P2-018, P2-057 · W04, W12 · V02, V04, V06, V07, V11, V16 | Both; Planned |
| FB-013 | Review source-backed candidates in bulk | Per-item evidence/diffs with safe batch decisions and base checks | P2-016, P2-072 · W04 · V02, V03, V04, V11 | Both; Planned |
| FB-014 | Make every pending decision visible in one place | Unified decisions, questions and stale-context inbox | P2-005, P2-006 · W02 · V03 | Both; Planned |
| FB-015 | Capture business objective and success measures | Goals linked to typed requirements and measured observations | P2-010, P2-068 · W03, W14 · V02, V04, V17 | Both; Planned |
| FB-016 | Separate discussion/proposal, agreement and released behavior | Reviewed decision lifecycle and observed deployment records | P2-011, P2-032, P2-040 · W03, W07, W09 · V02, V03, V04, V05, V06, V08 | Both; Planned |
| FB-017 | Start with useful issue links and portable change summaries | Typed references and concise change contracts readable from existing work | P2-018, P2-055, P2-078 · W04, W12 · V02, V06, V07, V11, V16, V17 | Both; Planned |
| FB-018 | Routine stories must not create a second mandatory tracker | Native or external ownership is explicit; measure duplicate maintenance | P2-018, P2-057, P2-068 · W04, W12, W14 · V02, V07, V11, V16, V17 | Both; Planned |
| FB-019 | Choose connectors based on actual pilot needs | Provider order is definite; real-tenant acceptance is labeled separately from fixtures | P2-055, P2-059, P2-060, P2-061, P2-062, P2-068 · W12, W13, W14 · V07, V11, V16, V17 | Connected; Planned |

### QA lead and QA manager

Source: [QA lead and QA manager](docs/reviews/2026-10-04/TEAM_REVIEW.md#qa-lead--qa-manager). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-020 | Generic QA criteria require extensive rewriting | Reusable concrete case/exception/NFR templates; reviewed suggestions | P2-024, P2-088 · W06 · V02, V04, V07, V11, V12 | Both; Planned |
| FB-021 | Reusable test cases are absent | Versioned cases, suites, parameters and exploratory charters | P2-024 · W06 · V02, V07 | Both; Planned |
| FB-022 | No executable automated runs are connected | Manual native runs plus reviewed execution of configured external test pipelines | P2-025, P2-077 · W06, W12 · V02, V07, V14, V16 | Both / connected execution; Planned |
| FB-023 | No automatic result ingestion | Bounded reports plus retrieved actual provider runs/build artifacts | P2-027, P2-056 · W06, W12 · V07, V11, V16 | Both / connected retrieval; Planned |
| FB-024 | Typed defect and build links are absent | Exact identities connect observations, defects, case/run and build scope | P2-025, P2-026, P2-028, P2-040 · W06, W09 · V02, V07, V08 | Both; Planned |
| FB-025 | Requirement-to-case/run traceability is missing | Typed relationships and exact approved/case revision references | P2-013, P2-024, P2-025 · W03, W06 · V02, V06, V07 | Both; Planned |
| FB-026 | A pass entry or artifact URL is self-reported | Distinct evidence origin; link-only never means proved requirement coverage | P2-026, P2-075 · W06 · V03, V07, V08 | Both; Planned |
| FB-027 | Current evidence must be visible by release/environment | Inspectable matrix of missing, blocked, failed, stale and applicable evidence | P2-075 · W06 · V03, V07, V08 | Both; Planned |
| FB-028 | Indirect dependencies can miss relevant regression work | Scoped reviewed graph paths and proposed regression selection | P2-029, P2-076 · W07 · V06, V07, V12 | Both; Planned |
| FB-029 | Equivalent wording changes can cause unnecessary rechecks | Reviewed same-meaning/applicability relationship; preserve actual old runs | P2-031 · W07 · V06, V07 | Both; Planned |
| FB-030 | Edge-case suggestions need human review | Evidence-led scenario/exception proposals with concrete outcomes | P2-076, P2-088, P2-046 · W06, W07, W10 · V04, V05, V06, V07, V11, V12 | Both / optional AI; Planned |
| FB-031 | Risk and release exception decisions are not modeled enough | Owned risk/exception decisions remain separate from passing evidence | P2-039, P2-076 · W07, W09 · V02, V06, V07, V08, V12 | Both; Planned |
| FB-032 | Receipt, work completion and verified outcome must stay distinct | Separate states and current-owner receipt gaps | P2-025, P2-026, P2-070, P2-090 · W02, W06, W11 · V02, V03, V07, V08, V14 | Both; Planned |
| FB-033 | Recorded scope is not proof of actual execution or overall release quality | Provenance and obligations gate all coverage claims; execution occurs in real runner | P2-026, P2-039, P2-056, P2-077 · W06, W09, W12 · V02, V07, V08, V14, V16 | Both; Planned |

### Development lead

Source: [Development lead](docs/reviews/2026-10-04/TEAM_REVIEW.md#development-lead). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-034 | Role template repeats the rule without affected implementation context | Component/API/service register with reviewed links and scope | P2-074, P2-032 · W03, W07 · V02, V03, V04, V06, V08 | Both; Planned |
| FB-035 | Services, APIs and code locations are not represented | Stable component references and source-backed candidate edges | P2-074, P2-055 · W03, W12 · V02, V04, V06, V16 | Both; Planned |
| FB-036 | Feature flags and rollout conditions are missing | Reviewed component/flag constraints and observed deployment audience scope | P2-074, P2-040, P2-082 · W03, W09 · V02, V04, V06, V07, V08 | Both; Planned |
| FB-037 | Compatibility constraints and data migrations are missing | Typed obligations with owner, acceptance and deployment evidence | P2-074, P2-042, P2-082 · W03, W09 · V02, V04, V06, V07, V08 | Both; Planned |
| FB-038 | No linked story, PR, build and deployment updates | GitHub and work-system adapters with typed identity/provenance | P2-055, P2-056, P2-061, P2-062 · W12, W13 · V07, V16 | Connected; Planned |
| FB-039 | Missing dependency relationships hide downstream work | Reviewed graph with bounded traversal and uncertainty | P2-013, P2-029 · W03, W07 · V02, V06 | Both; Planned |
| FB-040 | Need a concise before/after change contract | Why, changed scope, unknowns, owners and exact evidence in one handoff | P2-032, P2-078, P2-030 · W07, W12 · V03, V06, V08, V16, V17 | Both; Planned |
| FB-041 | Unknown impact needs a named owner | Proposed work/questions with explicit uncertainty and ownership | P2-018, P2-029, P2-032 · W04, W07 · V02, V03, V06, V07, V08, V11 | Both; Planned |
| FB-042 | AI must not present guessed areas as discovered code impact | Candidate edges only; developer confirms source/basis and impact | P2-074, P2-046, P2-047 · W03, W10 · V02, V04, V05, V06, V12, V17 | Both / optional AI; Planned |
| FB-043 | Change context must be reachable from existing work without dual status reporting | Deep link/reviewed summary publication; external system owns its status | P2-057, P2-058, P2-078 · W12 · V06, V16, V17 | Connected / portable summary; Planned |

### Business analyst

Source: [Business analyst](docs/reviews/2026-10-04/TEAM_REVIEW.md#business-analyst). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-044 | BA is missing and is mapped to Product | Seed BA; configurable stable role IDs and historical-label preservation | P2-012 · W03 · V02, V04, V10 | Both; Planned |
| FB-045 | Named person view shows another person's role task | Explicit My work versus Team view and unassigned work | P2-019 · W04 · V03, V10 | Both; Planned |
| FB-046 | Requirement hierarchy is missing | Parent/group structure with validated cycles and preserved baselines | P2-071 · W03 · V02, V04, V06 | Both; Planned |
| FB-047 | Exception model is not sufficiently linked | Typed exception relationships and explicit applicable scope | P2-071, P2-011 · W03 · V02, V04, V05, V06 | Both; Planned |
| FB-048 | Requirement types should extend beyond a behavior template | Behavior, constraint and NFR types with acceptance measures | P2-010 · W03 · V02, V04 | Both; Planned |
| FB-049 | Business vocabulary and aliases are missing | Reviewed project/release glossary aliases | P2-020 · W05 · V05 | Both; Planned |
| FB-050 | Decision tables are absent | Conditions/combinations/exclusions with source-backed review | P2-010, P2-071, P2-037 · W03, W08 · V02, V04, V06, V11 | Both; Planned |
| FB-051 | Performance, accessibility, retention and operations need different measures | Reusable NFR templates with units/thresholds/unknowns | P2-010, P2-088 · W03, W06 · V02, V04, V07, V11, V12 | Both; Planned |
| FB-052 | Dependency matrix and derived guidance relationships are missing | Inspectable typed graph and linked guidance | P2-013, P2-017, P2-029 · W03, W04, W07 · V02, V06, V11 | Both; Planned |
| FB-053 | Multiple sources and handbook facts need unified evidence-led review | Multi-source picker, bulk review and one stored fact referenced by briefs | P2-016, P2-017, P2-072 · W04 · V02, V03, V04, V06, V11 | Both; Planned |

### Support lead

Source: [Support lead](docs/reviews/2026-10-04/TEAM_REVIEW.md#support-lead). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-054 | Support must obtain the newest file manually | Latest-known revision/return tracking plus changed-since-last-view brief | P2-033, P2-034, P2-079 · W08 · V02, V03, V05 | Portable; Planned |
| FB-055 | Plain-language handoff-reset query misses approved sharing context | Reviewed aliases, local retrieval evaluation and useful ambiguity handling | P2-020, P2-023 · W05 · V05, V12 | Both; Planned |
| FB-056 | Original source documents do not automatically become approved guidance | Source exploration separate from agreed answers; explicit guidance approval | P2-021, P2-041 · W05, W09 · V02, V05, V08, V12 | Both; Planned |
| FB-057 | Need a short approved Support briefing | Derived applicable FAQ/troubleshooting brief with retained approved basis | P2-017, P2-041 · W04, W09 · V02, V05, V06, V08, V11 | Both; Planned |
| FB-058 | Customer release/version/environment selection is unreliable | Structured applicability and actual deployed-scope answer filters | P2-011, P2-022, P2-040 · W03, W05, W09 · V02, V04, V05, V08 | Both; Planned |
| FB-059 | Ticket and incident context is disconnected | Typed external/native observations and production learning chain | P2-028, P2-043, P2-057 · W06, W09, W12 · V02, V07, V08, V16 | Both / connected references; Planned |
| FB-060 | Known issues and escalation links are missing | Version-scoped known issues/workarounds and responsible escalation owner | P2-081 · W09 · V03, V05, V08, V09 | Both; Planned |
| FB-061 | Change notifications are absent | Personal in-app change digest; authenticated subscriptions in connected mode | P2-079, P2-080 · W08, W11 · V02, V03, V05, V14, V15, V16 | Both / connected push; Planned |
| FB-062 | Customer-safe export is absent | Physically sanitized derivative with reviewed excerpts/history/assets | P2-044 · W09 · V09 | Both; Planned |
| FB-063 | Role filter must not be mistaken for redaction or permissions | Honest portable labels; server policies and explicit sanitized exports | P2-008, P2-044, P2-050 · W02, W09, W11 · V09, V14 | Both; Planned |

### Operations lead

Source: [Operations lead](docs/reviews/2026-10-04/TEAM_REVIEW.md#operations-lead). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-064 | Suggested work is not actual deployment evidence | Separate intention, approved release and reported/retrieved deployed state | P2-040, P2-056, P2-082 · W09, W12 · V02, V07, V08, V16 | Both; Planned |
| FB-065 | Release/environment entities are free text | Stable IDs and explicit scope with unknown legacy migration | P2-011, P2-040 · W03, W09 · V02, V04, V05, V08 | Both; Planned |
| FB-066 | Deployment manifests and flag states are absent | Selected manifest/config/flag references with provenance and audience | P2-082 · W09 · V02, V07, V08 | Both / connected ingestion; Planned |
| FB-067 | Monitoring links and observations are missing | Dashboard/monitor references and observations linked to rollout/incident | P2-082, P2-043 · W09 · V02, V07, V08 | Both; Planned |
| FB-068 | Rollout needs a reviewed checklist with owners | Release/runbook obligations and scoped deployment prerequisites | P2-039, P2-042 · W09 · V02, V08 | Both; Planned |
| FB-069 | Rollback validation needs measurable criteria | Thresholds, actual validation evidence and missing-proof reasons | P2-042, P2-082 · W09 · V02, V07, V08 | Both; Planned |
| FB-070 | Incident connections are absent | Observation to hypothesis/defect/decision/regression/runbook chain | P2-043 · W09 · V02, V08 | Both; Planned |
| FB-071 | Operational approvals are not authenticated | Capability-checked signed-in actor and exact revision in shared mode | P2-090 · W11 · V03, V07, V14 | Connected; Planned |
| FB-072 | File backup and ownership process is not proved | Alternate custodian, retained secret/recovery option and recovery drill | P2-003, P2-083, P2-065 · W01, W08, W14 · V01, V02, V09, V15 | Both; Planned |
| FB-073 | Infrastructure execution needs separately authorized connected mode | Configured test execution only; production actions are outside automatic approval | P2-058, P2-077, P2-090 · W11, W12 · V03, V07, V14, V16 | Connected; Boundary / reviewed integrations |

### Whole delivery team

Source: [Whole delivery team](docs/reviews/2026-10-04/TEAM_REVIEW.md#feedback-as-one-delivery-team). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-074 | Too much intake, authoring, approval and coordination effort | Guided intake and measure total team/PM effort including onboarding | P2-015, P2-016, P2-068 · W04, W14 · V03, V04, V11, V17 | Both; Planned |
| FB-075 | Five role checkboxes start selected and generate unnecessary work | Explicit relevant-role selection; unknown impact remains visible | P2-018, P2-088 · W04, W06 · V02, V04, V07, V11, V12 | Both; Planned |
| FB-076 | Personal focused inbox is absent | Owner-specific view with scoped attention and Team view distinction | P2-019, P2-070 · W02, W04 · V03, V07, V10 | Both; Planned |
| FB-077 | Record the change once and review related suggestions together | Linked derived guidance and reviewed change package | P2-017, P2-032 · W04, W07 · V03, V06, V08, V11 | Both; Planned |
| FB-078 | Readers need their baseline/master identity and changed context | Lineage, expected returns and last-view comparison | P2-033, P2-034, P2-079 · W08 · V02, V03, V05 | Portable; Planned |
| FB-079 | Outstanding returned copies can be lost when rounds change | Expected-return manifest and explicit carry-forward/proposal review | P2-033, P2-034 · W08 · V02 | Portable; Planned |
| FB-080 | Connect agreement to work already happening instead of duplicate status | External ownership and typed work/evidence connectors | P2-055, P2-056, P2-057, P2-061, P2-062 · W12, W13 · V07, V16 | Connected; Planned |
| FB-081 | Direct scope links do not discover unrecorded dependencies | Reviewed paths, unknown coverage and same-meaning review | P2-029, P2-031, P2-076 · W07 · V06, V07, V12 | Both; Planned |
| FB-082 | Static-file UI cannot supply reliable simultaneous editing or push | Transactional shared commands, conflict review and authenticated notification feed | P2-049, P2-051, P2-052, P2-080 · W11 · V14, V15, V16 | Connected; Planned |

### Company perspective

Source: [Company perspective](docs/reviews/2026-10-04/TEAM_REVIEW.md#company-perspective). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-083 | Productivity/ROI is unproved | Matched real-participant pilot counts all-role effort and correction failures | P2-068, P2-069 · W14 · V17, V18 | Both; Planned |
| FB-084 | Every full-file recipient can read all data | Honest portable labels; sanitized derivatives or controlled shared access | P2-008, P2-044, P2-050 · W02, W09, W11 · V09, V14 | Both; Planned |
| FB-085 | Selecting a person does not authenticate them | Server identity/capability checks for shared approvals only | P2-050, P2-090 · W11 · V03, V07, V14 | Connected; Planned |
| FB-086 | Former recipients retain already downloaded copies | Revocation stops future access; exports carry truthful boundary | P2-008, P2-054 · W02, W11 · V09, V14, V15 | Both; Mode boundary / controls planned |
| FB-087 | The format cannot be made readable exclusively by this app | Standards-based encryption plus real access controls, not exclusivity claims | P2-008, P2-050 · W02, W11 · V09, V14 | Both; Mode boundary / truthful labels |
| FB-088 | PM departure or lost passphrase can break continuity | Alternate custody, rotation/optional recovery key and ownership-transfer drill | P2-083, P2-065 · W08, W14 · V02, V09, V15 | Both; Planned |
| FB-089 | Unmaintained copies become stale knowledge sources | Latest-known labels, briefings, expiry/review dates and subscriptions | P2-079, P2-080, P2-081 · W08, W09, W11 · V02, V03, V05, V08, V09, V14, V15, V16 | Both; Planned |
| FB-090 | Size and complete-parent archives bound long projects | Capacity budget, lossless dedup, archive/restore and measured limits | P2-035, P2-036, P2-038, P2-067 · W08, W14 · V02, V10, V11, V13, V18 | Both; Planned |
| FB-091 | Optional AI/backend operation is not made free by static hosting | Measured provider/job/storage cost controls and explicit optional setup | P2-048, P2-065, P2-091 · W10, W14 · V12, V13, V15, V18 | Connected / optional AI; Planned |
| FB-092 | Organization-managed storage, backup and migrations are needed at scale | Shared policies/repository, export/restore and self-host option | P2-049, P2-054, P2-065, P2-085, P2-064 · W11, W14 · V09, V14, V15, V17, V18 | Connected; Planned |
| FB-093 | Regulatory-grade audit and release authority require a stricter separate effort | Authenticated ordinary journal; no certification/tamper-proof claim | P2-090, P2-065 · W11, W14 · V03, V07, V14, V15 | Connected; Boundary / ordinary governance planned |
| FB-094 | Adoption should depend on real users returning voluntarily | Capture willingness, total cost and repeatable benefits; no short-pilot escaped-defect claim | P2-068, P2-069 · W14 · V17, V18 | Both; Planned |
| FB-095 | Measure net saved work, not only QA benefit or generated output | Avoided effort minus added upkeep; matched tasks include PM/BA and failures | P2-068 · W14 · V17 | Both; Planned |

### AI and earlier architecture extensions

Source: [AI and earlier architecture extensions](BUILD_PLAN.md#later-scope-useful-extensions-not-hidden-requirements). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-096 | Live provider behavior and model quality are untested | Actual protected account/provider checks reported separately from fixtures | P2-045, P2-047 · W10 · V12, V17 | Optional AI; Planned |
| FB-097 | Preserve qualifiers, authority and unknown handling | Task-specific gold/holdout cases and human review of exact evidence | P2-046, P2-047 · W10 · V05, V12, V17 | Optional AI; Planned |
| FB-098 | Current/historical answers must not mix baselines | Scoped retrieval and request-input identity | P2-022, P2-046 · W05, W10 · V05, V12 | Both / optional AI; Planned |
| FB-099 | Measure actual latency/cost and human correction effort | Recorded usage and reviewer effort with explicit budgets | P2-047, P2-048, P2-068 · W10, W14 · V12, V15, V17 | Optional AI; Planned |
| FB-100 | Provider comparisons/fallback need an explicit adapter and choice | Second-provider contract/evaluation; no hidden data routing | P2-089, P2-048 · W10 · V12, V15, V17 | Optional AI; Planned |
| FB-101 | Long processing needs durable resumable jobs | Bounded chunks, lease/checkpoint/cancellation/expiry and current-input recheck | P2-053, P2-086 · W11 · V12, V14, V15 | Connected; Planned |
| FB-102 | A queue cannot guarantee exactly-once provider billing | Accepted domain effects idempotent; uncertain external side effects reconciled | P2-086, P2-077 · W11, W12 · V07, V12, V14, V15, V16 | Connected; Boundary / safeguards planned |
| FB-103 | Imported instructions must not change prompts/access/actions | Untrusted-content handling plus schema/citation/authority and permission checks | P2-046, P2-050 · W10, W11 · V05, V12, V14 | Both / optional AI; Planned |
| FB-104 | Exclude generated exports from source ingestion loops | Origin tagging and no recursive auto-ingestion | P2-087 · W12 · V05, V14, V16 | Connected; Planned |
| FB-105 | Timeout is not deletion and access loss invalidates cached context | Distinct adapter outcomes and permission-aware answer invalidation | P2-087 · W12 · V05, V14, V16 | Connected; Planned |
| FB-106 | Realtime signals should refresh, not silently merge conflicts | Expected-revision transactions and explicit conflict resolution | P2-051, P2-052, P2-080 · W11 · V14, V15, V16 | Connected; Planned |
| FB-107 | Cross-product dependencies must be explicit and access-aware | Reviewed scoped links with unknown/inaccessible handling | P2-084 · W14 · V06, V14, V17 | Connected / authorized snapshots; Planned |
| FB-108 | Self-host operation needs packaging, backups and upgrades | Same backend deployment package and tested restore/upgrade runbook | P2-085, P2-091 · W14 · V13, V14, V15, V18 | Connected; Planned |

### Earlier section-review gaps and preservation checks

Source: [Earlier section-review gaps and preservation checks](IMPLEMENTATION_REVIEW.md). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-109 | Rich handbook authoring was absent | Safe structured blocks and plain-text fallback with linked facts | P2-073 · W04 · V02, V10, V11 | Both; Planned |
| FB-110 | Multiple-source evidence picker was absent | Exact multi-revision passages with explicit evidence change decisions | P2-072 · W04 · V02, V04, V11 | Both; Planned |
| FB-111 | PDF/DOCX input was absent in the 0.2 review | Already added in 0.4; repeat real parser/worker and persisted citation checks | P2-004, P2-015, P2-037 · W01, W04, W08 · V01, V02, V04, V11 | Both; Implemented in 0.4 / reverify |
| FB-112 | Semantic tables and timestamp locations were absent | Bounded table/CSV and SRT/VTT fidelity with uncertainty preview | P2-037 · W08 · V11 | Both; Planned |
| FB-113 | Scanned documents and audio input were absent | Bounded optional OCR/transcription path, consent and review | P2-063 · W13 · V11, V12, V13 | Both / selected processing; Planned |
| FB-114 | Original document binaries are not retained | Explicit bounded attachment choice; byte-identical restore | P2-038 · W08 · V02, V11, V13 | Both; Planned |
| FB-115 | Automatic source synthesis was absent in earlier build | Candidate code exists; live source-backed acceptance remains to prove | P2-015, P2-045, P2-046, P2-047 · W04, W10 · V04, V05, V11, V12, V17 | Optional AI; Partly implemented / live acceptance planned |
| FB-116 | Owner resolutions must not silently amend the agreement | Separate interpretation/proposal/approval with retained exact base | P2-004, P2-016, P2-032 · W01, W04, W07 · V01, V02, V03, V06, V08, V11 | Both; Implemented foundation / preserve and extend |
| FB-117 | Keep archive/restore and keep/replace/remove evidence decisions | Reference-safe archives and explicit multi-source evidence diff | P2-036, P2-038, P2-072 · W04, W08 · V02, V04, V11, V13 | Both; Implemented foundation / preserve and extend |
| FB-118 | Local activity is not authenticated or tamper-proof history | Mode-aware identity and server approval capability; no certification claim | P2-008, P2-090 · W02, W11 · V03, V07, V09, V14 | Both; Planned |
| FB-119 | Full accessibility/cross-browser and native-write coverage are incomplete | Keyboard/screen-reader/phone/device matrix and real retained-file checks | P2-009, P2-067, P2-004 · W01, W02, W14 · V01, V02, V10, V13, V18 | Both; Planned |
| FB-120 | Design needs readable responsive UI without external fonts | Preserve local assets, clear hierarchy, focus and reduced-motion behavior while extending | P2-009, P2-067, P2-066 · W02, W14 · V10, V13, V17, V18 | Both; Implemented foundation / preserve and extend |
| FB-121 | Dirty-cache, stale-file and simultaneous-tab protection must persist | Atomic migration/recovery tests and explicit shared conflict boundaries | P2-004, P2-014, P2-051 · W01, W03, W11 · V01, V02, V04, V14 | Both; Planned |
| FB-122 | Unknown future formats must not be stripped into apparent validity | Version rejection, backup-before-migration and linked validation | P2-002, P2-014 · W01, W03 · V01, V02, V04 | Both; Planned |

### Competitive improvement directions

Source: [Competitive improvement directions](docs/reviews/2026-10-04/TEAM_REVIEW.md#comparison-with-current-alternatives). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-123 | Jama already has requirement relationships, traceability and change impact | Build reviewed hierarchy/relationships and benchmark simpler total-team workflow | P2-071, P2-029, P2-075, P2-069 · W03, W06, W07, W14 · V02, V03, V04, V06, V07, V08, V17, V18 | Both; Planned |
| FB-124 | Qase has stronger test execution/results and integrations | Native cases/manual runs, external execution and real result provenance | P2-024, P2-025, P2-056, P2-077, P2-069 · W06, W12, W14 · V02, V07, V14, V16, V17, V18 | Both / connected execution; Planned |
| FB-125 | Azure has stronger work/code/build/test/release traceability | Connect actual identities/evidence without creating another status system | P2-056, P2-057, P2-061, P2-069 · W12, W13, W14 · V07, V16, V17, V18 | Connected; Planned |
| FB-126 | Confluence/Jira/Rovo provide collaboration, permissions and agent tools | Shared policies plus selected docs/work connectors and reviewed actions | P2-050, P2-058, P2-059, P2-069 · W11, W12, W13, W14 · V11, V14, V16, V17, V18 | Connected; Planned |
| FB-127 | ClickUp provides broad collaborative work and contextual AI | Link its authoritative work; prove agreement/evidence handoff value | P2-057, P2-062, P2-069 · W12, W13, W14 · V16, V17, V18 | Connected; Planned |
| FB-128 | Google source notebooks support broader inputs and source understanding | Fidelity/selected refresh and measured follow-through into work/releases/learning | P2-037, P2-060, P2-063, P2-043, P2-069 · W08, W09, W13, W14 · V02, V08, V11, V12, V13, V16, V17, V18 | Both / connected refresh; Planned |
| FB-129 | Slite was also named in the earlier positioning discussion | Include knowledge verification/source-answer workflow in documented and access-based benchmarking | P2-069, P2-017, P2-021 · W04, W05, W14 · V05, V06, V11, V12, V17, V18 | Both; Planned |
| FB-130 | Established features must not be sold as a new market category | Same scenario comparison and honest wins/losses; superiority remains a hypothesis | P2-069, P2-068 · W14 · V17, V18 | Both; Planned |

### Explicit architecture choices and boundaries

Source: [Explicit architecture choices and boundaries](BUILD_PLAN.md#alternatives-considered). Each row identifies the concrete response, engineering items and supported mode.

| ID | Earlier feedback point | Response | Work / checks | Mode and disposition |
| --- | --- | --- | --- | --- |
| FB-131 | GitHub-only hosting must still support a useful manual product | Static frontend plus account-free native portable lifecycle | P2-004, P2-018, P2-024, P2-039, P2-043 · W01, W04, W06, W09 · V01, V02, V07, V08, V11 | Portable; Planned |
| FB-132 | Provider keys cannot safely live in the public frontend | Protected backend secrets and selected plaintext consent | P2-045, P2-046, P2-050 · W10, W11 · V05, V12, V14 | Optional AI; Chosen path / direct frontend keys excluded |
| FB-133 | Shared DB was deliberately deferred until file value is proved | Portable checkpoints first; optional shared repository/policies later | P2-049, P2-050, P2-054 · W11 · V09, V14, V15 | Connected; Planned |
| FB-134 | Browser-local models were an alternative with device/quality costs | Manual offline mode retained; local inference not selected for Phase 2 core; future adapter requires measured device/quality acceptance | P2-047, P2-048 · W10 · V12, V15, V17 | Portable; Alternative not selected / recorded decision |
| FB-135 | Cloud processing cannot honestly be called zero-knowledge | Explicit server/provider data flow and permission-enforced selected exports | P2-008, P2-044, P2-050, P2-054 · W02, W09, W11 · V09, V14, V15 | Connected; Mode boundary / controls planned |
| FB-136 | Lost all decryption keys cannot be fixed with a reset button | Optional retained recovery key/custodian; honest irrecoverable state if none exist | P2-083, P2-003 · W01, W08 · V01, V02, V09, V15 | Portable; Mode boundary / continuity safeguards planned |
| FB-137 | Restricted partial bundles cannot become full masters through merge | Sanitized derivative identity/type and explicit proposal workflow | P2-044, P2-054, P2-034 · W08, W09, W11 · V02, V09, V14, V15 | Both; Planned |
| FB-138 | Production infrastructure/monitoring execution is outside automatic product approval | Record evidence/obligations; separately authorized external action paths; no production control-plane promise | P2-082, P2-058, P2-090 · W09, W11, W12 · V02, V03, V07, V08, V14, V16 | Connected; Boundary / integrations planned |

## Newly explicit implementation items

These 22 additions close gaps that were previously buried, incomplete or only implied:

| Item | Capability | Package |
| --- | --- | --- |
| P2-070 | Missing current-owner acknowledgments | W02 |
| P2-071 | Requirement hierarchy and linked exceptions | W03 |
| P2-072 | Multi-source evidence picker | W04 |
| P2-073 | Structured handbook authoring | W04 |
| P2-074 | Component API compatibility and migration register | W03 |
| P2-075 | Current evidence matrix | W06 |
| P2-076 | Reviewed risk-based regression selection | W07 |
| P2-077 | Execution through an existing test pipeline | W12 |
| P2-078 | Change contract from the existing work item | W12 |
| P2-079 | Changed-since-last-view briefing | W08 |
| P2-080 | Connected change notifications | W11 |
| P2-081 | Known issues and escalation paths | W09 |
| P2-082 | Operational manifest monitoring and rollback criteria | W09 |
| P2-083 | Passphrase continuity rotation and recovery option | W08 |
| P2-084 | Explicit cross-project dependencies | W14 |
| P2-085 | Self-host packaging of the same backend | W14 |
| P2-086 | Leased resumable jobs expiry and cost semantics | W11 |
| P2-087 | Connector feedback-loop and access-loss safeguards | W12 |
| P2-088 | Reusable edge-case and NFR templates | W06 |
| P2-089 | Second-provider adapter and explicit comparison | W10 |
| P2-090 | Authenticated receipts and approval authority | W11 |
| P2-091 | Shared-service health and recovery observability | W14 |

## Completion rule

Coverage means a point has a response and a verifiable work item; it does not mean the problem is fixed. A feedback entry is resolved only after its linked implementation and relevant validation pass. Record partial progress, rejected candidates, access-blocked integrations and explicit mode boundaries honestly. Keep stable FB/P2 IDs when adding feedback so earlier promises remain traceable.
