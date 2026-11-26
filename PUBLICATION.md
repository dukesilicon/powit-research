# Proof of Witness: Towards an Infrastructure for Reliable Human Knowledge of Events

THOTH research manuscript · 24 November 2026 · Funding and release update 26 November 2026

## Abstract

People who did not observe an event often encounter a collection of reports without a reliable account of how those reports were produced. Repetition can resemble corroboration; missing testimony can resemble agreement; a durable digital object can appear more authoritative than its underlying evidence warrants. Proof of Witness (PoWit) addresses the structure and inspectability of this record. It binds event-scoped participation, committed reports, qualification decisions and declared relationships to an immutable attestation whose derivation can be replayed.

The existing TypeScript reference implementation supports an initial-finalization profile with four epistemic states: CONCORDANT, SPLIT, THIN and SILENT. Fresh local verification reproduced the frozen conformance vectors and passed 94 engineering tests across the kernel, development runtime, settlement profile and adapter. This release includes the kernel, 53 kernel tests and four complete synthetic Records. These results demonstrate specified computational behavior under declared trust assumptions. They do not demonstrate that witnesses were physically present, that accounts represent distinct people, or that the resulting records improve human judgment. The proposed three-month, $25,000 programme (with a viable $15,000 reduced-scope option) proceeds from engineering and an inspectable Record to a bounded Witness Event, operational and adversarial iteration, and then comparative epistemic evaluation.

## 1 The epistemic problem

An observer may be mistaken, deceptive, dependent on another source, or unable to see the relevant part of an event. A reader evaluating several reports needs more than their number or apparent agreement. The reader needs to know what each person could observe, what they committed to reporting, which qualifications and relationships were asserted, what supporting material exists, which reports failed admission, and what remains unresolved.

THOTH's governing research objective is: **“Its record makes human knowledge of events more reliable.”** Reliability here is an empirical question about people's judgments, not a property implied by a hash or a consensus label. A record could be computationally impeccable while preserving inaccurate testimony. It could also make readers overconfident if its presentation conceals weak participation assurance or overstates the significance of agreement.

PoWit therefore separates the reproducibility of a procedure from the physical truth of the claims processed by that procedure. The immediate engineering question is whether an evaluator can reconstruct how a result was formed. The later epistemic question is whether that inspectability helps people judge events more accurately and with appropriately calibrated uncertainty.

## 2 Origins and relationship to THOTH

THOTH is the company and prospective human-provenance network. PoWit is the open witnessing primitive beneath it; applications supply domain-specific schemas. VoteLedger is the first application and election schema, not the parent architecture. The project arose around the need to preserve accountable, situated human observation of real-world events. The September 2026 semantic and executable-profile decisions established the present initial-finalization boundary; subsequent engineering implements that boundary rather than replacing it with application-specific rules. [ADR-001](docs/decisions/ADR-001-powit-thoth-separation.md), [ADR-006](docs/decisions/ADR-006-powit-v0-semantic-freeze.md) and [ADR-007](docs/decisions/ADR-007-powit-v0-executable-policy-profile.md) record these distinctions.

The architectural hierarchy is real world → human observation → PoWit → THOTH → applications → VoteLedger. Human Passport concerns persistent human participation and personhood assurance. It remains a parallel strategic priority, outside the immediate funding application. Development accounts used in the present implementation must not be mistaken for a verified Human Passport deployment.

A **Record** is the conceptual history of witnessing and its provenance under declared access rules. It is broader than an Attestation, which is the immutable result envelope of one finalized PoWit execution. The JSON Record wrapper in this release is an existing demonstration format, not a newly standardized protocol object. [Terminology](protocol/overview/terminology.md)

## 3 Technical architecture

The reference implementation separates wire types, a deterministic in-memory kernel, an orchestration runtime, settlement-profile verification and a chain adapter. The research snapshot exposes the kernel and types without requiring a website, database, wallet or network service. The broader runtime is verified in the engineering report but is intentionally outside this minimal public candidate.

The frozen [specification](protocol/powit/v0/POWIT_V0_SPEC.md) owns behavior, [types](protocol/powit/v0/POWIT_V0_TYPES.md) own representation, and [vectors](protocol/powit/v0/POWIT_V0_TEST_VECTORS.md) supply expected inputs and outputs. Implementations must reject unsupported policy profiles rather than invent semantics.

| Object | Role |
| --- | --- |
| EventSchema | Pins versioned observation, eligibility, relation, sufficiency, aggregation and timing policies. |
| Event | Executes one frozen schema with explicit enrollment, observation, commitment and reveal windows. |
| WitnessParticipation | Represents an event-scoped participation right, distinct from an account or wallet. |
| Observation | A meaningful structured report admitted after a valid matching reveal and policy checks. |
| Attestation | Binds the finalized event, admitted sets, derived relations, evaluations, state and replay input. |

Event execution follows DRAFT → ACTIVE → FINALIZING → ATTESTED, with guarded cancellation from DRAFT or ACTIVE. Activation freezes configuration. Beginning finalization freezes the input journal and its logical time; retries must use the same inputs. Settlement follows formation and cannot change the epistemic result. [Kernel session](packages/powit-core/src/session.ts)

Windows are half-open. The execution environment assigns authoritative acceptance times and contiguous per-event sequence numbers; client timestamps cannot extend a window. These rules make admission reproducible. They do not prove when a person physically observed something, and the production clock and intake authority remain trust boundaries.

## 4 Observations and provenance

Enrollment consumes one opaque event-scoped uniqueness token under a pinned provider policy. The kernel rejects reuse of that token within the event. Its claim is conditional: a dishonest provider or a person holding multiple independently issued identities can defeat human uniqueness without violating token uniqueness. The development runtime derives tokens from accounts and therefore demonstrates account-scoped enforcement, not proof of personhood.

At commitment acceptance, the kernel retains an immutable QualificationSnapshot and a binding to the report, event, participation, evidence-manifest hash or explicit null, and salt. A later reveal must open that commitment within the reveal window. A wrong opening does not consume the participant's opportunity to submit a correct matching reveal. A matching but schema-invalid report is preserved as a reveal outcome without becoming an admitted Observation. Explicit abstention is also distinct from an admitted negative report.

The present runtime receives the report and salt at commit intake. It is **not server-blind before reveal**. Encryption at rest protects stored recovery and replay material from access without the configured key; it does not remove the runtime operator's technical ability to inspect plaintext. Commit-reveal binds reports against later change but does not prevent advance coordination, copying before commitment, coercion or collusion.

Ordinary later credential revocation does not rewrite the qualification snapshot. An authorized pre-finalization disqualification can exclude a contribution while preserving its history. Corrections after finalization require the unresolved B05 authorization profile; the current kernel does not silently edit an earlier Attestation.

Evidence references can bind raw artifact hashes and metadata in the frozen representation. Hash equality establishes byte integrity, not origin, authenticity, context or physical truth. The current supported schema requires evidence and authentication policies to be null. The tests verify canonical evidence representations and the distinction between a null and an empty manifest; they do not implement the full EvidenceArtifact authentication workflow. Authenticators, where a future reviewed policy enables them, assess task-scoped provenance or authenticity criteria. They do not establish the truth of every associated claim, and they do not replace physically present Witnesses. B06 remains unresolved. [Readiness register](protocol/powit/v0/POWIT_V0_OPEN_QUESTIONS.md)

## 5 Relationships and disagreement

The supported relation policy compares relevant-time, verified, conflict-free claim values. Equality yields KNOWN_RELATED; different known values yield KNOWN_DISTINCT; missing, invalid or conflicting information yields UNKNOWN. These statuses concern the declared dimension. Distinct organization values do not prove social independence or absence of coordination. Reputation concerns historical participation and cannot substitute for event-specific independence.

The implementation creates a complete pairwise relation graph for admitted participants and preserves supporting claim references and conflicts. It does not infer independence from a missing edge, compute a universal truth score, or infer groups transitively. Its complete graph also creates a quadratic scaling concern that remains to be evaluated.

Sufficiency is evaluated separately from report agreement. The current profile supports minimum admitted-observation count and minimum distinct verified values. EXACT_MATCH preserves each distinct canonical material value and its count; it does not declare a majority winner. [Derivation implementation](packages/powit-core/src/derive.ts)

| Condition, in evaluation order | Epistemic state | Interpretation |
| --- | --- | --- |
| No admitted Observations | SILENT | No admitted testimony; not proof of non-occurrence. |
| At least one admitted Observation, but sufficiency fails | THIN | The declared witness structure is insufficient, even if reports agree or disagree. |
| Sufficiency passes and material values converge | CONCORDANT | Qualified convergence under this schema; not objective truth. |
| Sufficiency passes and material values differ | SPLIT | Qualified disagreement remains visible; no majority substitution. |

## 6 Attestation generation and reproducibility

The kernel serializes its supported JSON profile canonically and uses domain-separated SHA-256 hashes. A finalized Attestation binds event and schema identities, admitted participation and observation sets, the relation graph, sufficiency and aggregation outputs, and the ReplayBundle. The bundle contains the frozen policies, lifecycle, assertions, qualification snapshots, commitments, reveals, intake journal, disqualifications and claimed outputs.

Replay processes the recorded actions under their authoritative times and re-derives the outputs. It compares the resulting bundle and Attestation rather than accepting the supplied graph or state as authoritative. Checking only an Attestation hash would establish a weaker integrity property. [Replay implementation](packages/powit-core/src/replay.ts)

The release's verifier runs separately from the Record generator, but uses the same reference kernel. This is independent execution by a reader, **not a second independently authored implementation or an external audit**. Shared implementation bugs remain possible. Full replay also requires the relevant inputs; a public commitment does not ensure their availability. THOTH's existing delivery profile declares restricted replay rather than universal public access. The examples here can be fully disclosed because they are synthetic.

## 7 An inspectable disagreement Record

[SPLIT.json](examples/SPLIT.json) is freshly generated by the existing demonstration loader from the frozen E2E-2 fixture. Five fictional participations produce five admitted reports: three affirmative and two negative. Their fixture-issued organization values satisfy the declared diversity requirement. The result is SPLIT, not a three-to-two decision that the event occurred.

The Attestation hash is:

```text
c19c1ac53ea15f279e4fe5d2f8a537c8aafc61b0d56b65e92e31927cea3dc34d
```

The complete Record contains the input journal, qualification snapshots, openings, admitted reports, relation graph, requirement results and Attestation. Its settlement status is UNSUBMITTED. The fixture clock ends at 400; this is synthetic protocol time, not a date of human witnessing. The five participants, their claims and observations are fixtures, not five verified people.

Run `pnpm verify` from the snapshot root with Node 24 or later. The command reconstructs sessions from all four Records, independently replays their serialized bundles, compares Attestations and hashes, and verifies that deliberately altered claims fail verification. [Reproduction instructions](README.md)

The accompanying CONCORDANT fixture has five matching reports and sufficient declared diversity. THIN has five matching reports but only one shared organization value. SILENT has five enrollments and no admitted reports. This comparison demonstrates why enrollment count, agreement and sufficiency are distinct.

## 8 Current engineering status

On 24 November 2026, the dirty working-tree source passed 53 kernel, 36 runtime, two settlement and three adapter tests after forced dependency rebuilds, with no skipped tests. Five package typechecks and the repository boundary check also passed. Runtime coverage includes local HTTP accounts, encrypted persistence, restart, finalization freezing, malformed intake, synthetic downloads and media-access boundaries. Test names referring to “real HTTP accounts” describe actual local HTTP requests by automated test clients, not real human participation.

The standalone snapshot additionally runs the 53 kernel tests and verifies all four exported Records without third-party runtime dependencies. These bounded regressions do not establish exhaustive correctness, production security, a measured capacity limit or public availability. No fresh Solana validator or public chain transaction was executed. No field Witness Event or comparative human study is claimed.

The full specification validator reported three preexisting documentation failures: an encoded cross-workspace handoff link; the paused assurance assessment missing from the protocol status index; and that assessment's absent baseline-evidence link. These failures remain reported, not silently repaired or represented as a passing specification check. [Engineering status and execution evidence](VERIFIED_ENGINEERING.md)

## 9 Scientific and engineering limitations

The primary scientific uncertainty is whether the Record improves an absent reader's judgment. Its structure could help expose contradictions, but increased detail or institutional presentation could also inflate confidence without improving accuracy. No result in this release resolves that question.

The engineering trust boundaries include upstream personhood and claim providers, authoritative intake and time, server access to pre-reveal reports, storage and key custody, replay-material retention, and authenticated publication. The current development store serializes transactions within one process; it is not a distributed transactional service. Physical presence and observation opportunity require operational evidence beyond geolocation. Watching a livestream does not constitute the intended situated witnessing.

EXACT_MATCH does not express measurement tolerance or resolve semantic equivalence between differently worded reports. A schema can ask a biased question or select inadequate sufficiency thresholds while remaining computationally valid. B05 corrections, B06 authentication, production personhood, stronger privacy and broader aggregation policies remain unresolved. Nonempty requiredClaims and a nonoverlapping commit/observation policy are expressly rejected by the current kernel because their normative behavior is incomplete or incompatible with commit-time report admission. Some malformed lifecycle/disqualification attempts raise errors rather than interoperable journal rejection codes. [Implementation limitations](packages/powit-core/README.md)

Formal assurance work is proposed and paused; no checked Lean proof or implementation-refinement theorem is claimed. Adversarial tests are examples of investigated failures, not evidence that collusion or every attack has been eliminated.

## 10 Proposed operational and epistemic validation

The funding request is **$25,000 for three months**, with a viable **$15,000 reduced-scope option** and **$0 existing funding**, as specified by the founder. The approved sequence is to verify existing engineering, complete one independently inspectable Record, conduct a bounded consented real-world Witness Event, iterate from operational and adversarial findings, and then conduct comparative epistemic evaluation once the mechanisms are sufficiently established. Human Passport remains a parallel priority outside this application. This research does not claim to have completed the broader canonical Passport Event → Witness Event → Reality Query/institutional pilot → organic witnessing sequence.

Month one consolidates reproduction, specifies one low-risk event and its observation question, and establishes consent, a disclosed participant-assurance procedure, reference evidence, privacy limits and independent Record inspection. Month two executes the bounded event and examines missed windows, dropout, mistaken or conflicting reports, disclosure failures and adversarial attempts. Operational shortcomings are retained and addressed before the comparative stage; frozen protocol changes would require separate versioned decisions.

Month three evaluates whether readers using the Record make better judgments than readers using a matched ordinary evidence presentation. The study will assess factual accuracy against separately established reference evidence, confidence calibration, recognition of contradictions and unwarranted certainty. Case allocation, scoring, exclusions and decision criteria must be set before collecting evaluation responses. Unknown reference facts remain unknown; witness agreement must not supply the answer key.

The comparison should hold underlying evidence and decision questions constant when testing the value of record organization. Any separate comparison that gives the Record group additional evidence must be reported as a combined evidence-and-format intervention. Small pilot results will be descriptive and explicitly limited; they will not justify broad epistemic-superiority claims. If the operational gate fails, the programme reports those findings and defers comparative claims rather than treating an unreliable mechanism as a completed intervention. [Programme and budget](PROGRAMME.md)

The intended contribution is a reproducible and empirically examinable account of human witnessing: what was preserved, what can be checked, where trust remains, and whether those distinctions actually help people know events more reliably.
