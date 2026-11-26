# PoWit v0 — normative semantics

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [terminology](../../overview/terminology.md); [types](POWIT_V0_TYPES.md); [open questions](POWIT_V0_OPEN_QUESTIONS.md)
Supersedes: Earlier v0 topic statements only where identified in [ADR-006](../../../docs/decisions/ADR-006-powit-v0-semantic-freeze.md)

## Purpose

Freeze the supported semantic kernel before implementation. The four initial policy gates B01-B04 are resolved by this document and [ADR-007](../../../docs/decisions/ADR-007-powit-v0-executable-policy-profile.md). Corrections and evidence authentication remain gated by B05/B06. CANONICAL applies to the explicit rules here, not to those optional capabilities.

Public description: “Proof of Witness turns independent human observation into verifiable real-world state.”

Normative purpose: “Proof of Witness (PoWit) is a protocol for transforming schema-qualified, independently committed and revealed human observations and their relevant relational context into a provenance-preserving attestation under a versioned event schema.”

## CANONICAL

### 1. Authority, scope and language

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT and MAY carry their BCP 14 meanings only when capitalized ([RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)). Definitions, exact field tables and decision tables in CANONICAL are also normative within their stated scope. SPEC owns behavior, TYPES owns the wire representation, TEST_VECTORS owns the stated fixtures, and OPEN_QUESTIONS owns unresolved decisions. Their requirements must agree; an implementation MUST NOT resolve a conflict itself.

PoWit is the primitive; Thoth is the human-centric network and prospective social unit; applications specialize it. VoteLedger is the first application, not a generic dependency. No established institutional legitimacy is presumed. Thoth accounts, wallets, services and a particular settlement chain are outside the primitive.

“HUMANS CONFIRM REALITY. MACHINES CONFIRM THE INTEGRITY OF THE PROTOCOL RECORD.” Human reports remain fallible. Machines verify protocol operations, not physical occurrence. “PoWit does not replace the human lens. It stacks it.” Convergence is evidential only in its qualified relational context; participant count is not a truth measure.

### 2. Object and identity boundaries

The exact core object set is **EventSchema, Event, WitnessParticipation, Observation, Attestation**. Supporting records do not replace these objects.

An Event executes one frozen schema identity/version/hash. A WitnessParticipation is one underlying eligible human's event-scoped role. It MUST NOT be equated with a persistent account, wallet or credential. One human MUST have at most one participation per Event and at most one admitted committed-and-revealed Observation through it. Multiple witness classes, recovery or a second credential MUST NOT multiply that entitlement. Disqualification MUST NOT free a slot for re-enrollment in the same Event. Concurrent admission MUST atomically reject a repeated opaque uniqueness token. Provider proof/derivation remains upstream and is trusted under the event's eligibility policy.

Identifiers MAY differ across events; public cross-event linkage is not required. A wallet address MUST NOT automatically be used as the public witness identifier. PoWit consumes schema-relevant properties/proofs, not a mandatory civil biography. ZK identity and exact scoped-ID/nullifier derivation remain outside this freeze. These privacy boundaries do not claim transport anonymity or concealment of funding links.

### 3. Event states and windows

The exact EventState set is **DRAFT, ACTIVE, FINALIZING, ATTESTED, CANCELLED**. Neither settlement nor supersession is an Event state. DRAFT permits configuration changes and accepts no commitments; activation freezes protocol-significant configuration.

| Transition | Guard and consequence |
| --- | --- |
| DRAFT → ACTIVE | Schema/configuration is validated and all required policies are supported; freeze EventDefinition and schema hash |
| DRAFT → CANCELLED | Stop execution; preserve any retained history |
| ACTIVE → CANCELLED | Only if no commitment has ever been accepted, including one later disqualified |
| ACTIVE → FINALIZING | Reveal window has closed; admission/disqualification decisions through the recorded cutoff are complete; freeze all protocol inputs and the logical `finalizingAt` |
| FINALIZING → ATTESTED | Deterministic finalization succeeds and the immutable initial Attestation is stored |

Other transitions are forbidden in this profile. Cancellation does not assert non-occurrence. A finalization error leaves the Event FINALIZING; a retry uses the identical frozen inputs, policy versions and logical timestamp. It MUST NOT accept new records or emit a fabricated epistemic state to hide an operational error. ATTESTED and CANCELLED are terminal for this execution. A correction creates another immutable Attestation without reopening the Event.

Each of enrollment, observation, commitment and reveal has an opening and closing instant. Intervals are half-open: `opensAt <= t < closesAt`. Each opening MUST precede its closing. `revealOpensAt >= commitClosesAt`. Enrollment MUST close no later than commitment closes. The report is submitted with the commitment, so its authoritative commitment-acceptance time MUST fall in both the observation and commitment windows. These windows MAY overlap only if the schema's timing policy allows it. Witness-reported `observedAt` is not used to admit or reject a protocol action and is not a cryptographically proven physical timestamp.

Only ACTIVE admits enrollment, commitments or reveals, subject to their respective windows. Equality with a closing instant is late. The execution environment assigns a protocol-authoritative acceptance time and monotonic per-Event sequence to every processed action, including rejected attempts in the replay journal. Client timestamps MUST NOT control admission. Clocks MUST be injectable for testing; replay uses recorded authoritative times/sequences, not the verifier's wall clock. Transport authentication remains outside PoWit. No scheduling race may extend a window or substitute a new input set.

### 4. Participation, qualification and admission

Participation progress is derived from retained records, not another Event state machine: enrolled; committed; revealed (valid, abstention or invalid report); admitted Observation, if any. Non-reveal is derived after reveal closure. Disqualification is a separate admissibility decision, never historical deletion.

Eligibility MUST be checked no later than commitment acceptance. Enrollment first consumes a valid EventScopedUniquenessAssertion under the pinned provider/method allowlists; one token cannot create a second WitnessParticipation in the Event. Commitment acceptance MUST atomically record the commitment and immutable QualificationSnapshot under the pinned schema/policies. Only event-relevant claims/proofs belong in the snapshot. Claims MUST be evaluated at the schema's specified relevant time and against their validity intervals. A snapshot is evidence of an admission decision, not proof that an issuer's assertions are true.

Ordinary later credential revocation is prospective: it MUST NOT automatically invalidate that commitment or remove the reveal right. Expiration after the relevant qualification time also MUST NOT silently rewrite the snapshot. A demonstrated defect that made participation invalid at the relevant event time is disqualification, not ordinary revocation. Before FINALIZING, an authorized eligibility authority's disqualification action MUST exclude that participation's Observation from finalization while preserving all records and a reasoned disqualification record. At/after input freeze it requires correction/challenge, not mutation. Issuers have no implicit retrospective deletion power. The trusted disqualification authority is pinned by the eligibility policy; correction authorization remains B05.

### 5. Commit and reveal

Each participation has at most one accepted CommitmentRecord, one retained matching RevealRecord and one admitted Observation. A second commitment MUST be rejected, even if identical; transports may retrieve an existing receipt without creating another record. Accepted commitments and snapshots MUST NOT mutate.

A submission MUST be authenticated to the scoped role and admitted within the commitment window. A commitment binds the event, participation, proposed observation hash, original evidence-manifest hash or explicit null, and a secret salt as specified in TYPES. Commit-reveal limits post-commit modification; it does not prevent pre-coordination, coercion or collusion.

A reveal MUST be admitted within its window and reproduce the accepted commitment. A wrong salt, wrong event/participation, malformed canonical value or hash mismatch is rejected; it creates no matching RevealRecord or Observation. Rejected attempts MAY be kept in a separate audit log and MUST NOT consume another participant's reveal entitlement. A later correctly authenticated matching attempt is still possible within the window.

A cryptographically matching reveal is retained exactly once, whether it is admitted as an Observation, is an explicit abstention, or fails Observation admission. Abstention and failed-admission reveals remain auditable and cannot be replaced with another report because it would not match the immutable commitment. Duplicate matching reveals cannot create a second record. Non-reveals remain visible through commitments without reveals and are excluded from aggregation.

Candidate report bytes can be hashed before admission. An Observation is, by definition, a meaningful admitted structured human report. A matching reveal creates an Observation only when it belongs to this Event/participation, opens the accepted commitment, arrives in-window, conforms to the pinned EventSchema, passes admission checks, and is not an explicit abstention. Schema v0 requires a material-claim path to resolve to a non-null JSON value for every admitted Observation. An explicit abstention is boolean `true` at a separate schema-declared path; it remains a RevealRecord and creates no Observation. The marker path MUST differ from the material-claim path and required paths. A negative real-world value such as `false` is meaningful and cannot be designated as the abstention marker. Other report fields remain report data; the core does not infer material meaning from them. Hash matching is not schema validation; schema validation is not physical truth.

### 6. Evidence, claims and Authenticator

Evidence supports an explicit human Observation; it MUST NOT replace it. Original protocol evidence MUST have its manifest hash bound into the commitment in this v0 profile. Null means no original evidence manifest, not an empty manifest or missing field. Later evidence is correction material and MUST NOT be inserted retroactively into that commitment. Large artifacts SHOULD be content-addressed; access locations are transport metadata, not canonical bytes.

“PoWit does not establish evidence authenticity through synthetic-media detection. It establishes evidentiary standing through provenance.” Neither an artifact hash nor a detector decides event occurrence.

An Authenticator is an event-scoped human participant evaluating whether a specific EvidenceArtifact satisfies schema-defined provenance criteria. The exact result set in this wire profile is PASS, FAIL, INDETERMINATE. PASS means provenance requirements passed, not that an event occurred. An Authenticator MUST NOT authenticate their own evidence, including through another account for the same human. Authentication never creates an extra witness Observation. Authenticator eligibility/diversity and aggregation of conflicting assessments remain B06; authentication-required schemas cannot run until that profile is selected.

Claims retain value/proof references, provenance, verification state, validity window and relevant issuer. SELF_DECLARED is not automatically VERIFIED. Verification means a specified check passed under a policy, not infallibility. Hidden, missing, stale, conflicted or unverified relationship evidence MUST NOT be silently promoted to independence.

### 7. Relations and sufficiency

“Witness independence in PoWit v0 is derived, not self-asserted.” Relation status is exactly KNOWN_RELATED, KNOWN_DISTINCT or UNKNOWN, relative to a named event-relevant dimension. Distinct on one dimension is not universally independent. Matching answers alone do not prove coordination; differing answers do not establish independence.

The finalization graph covers participations with admitted Observations and MUST represent every unordered pair for every schema-required dimension. The v0 relation rule is CLAIM_VALUE_EQUALITY. A schema dimension pins a claim type/path, JSON value type and `JCS_VALUE` normalization. Only claims whose verification state is VERIFIED under a dimension-accepted verification profile and whose validity interval includes the dimension's relevant event time participate. Values missing at the path, null, or of the wrong declared JSON type are unknown/incomparable. Same-type equal canonical values on a pair yield KNOWN_RELATED; different same-type values yield KNOWN_DISTINCT; otherwise UNKNOWN. Multiple distinct applicable verified values for one participation/dimension create conflict provenance and are treated as UNKNOWN; there is no fourth RelationStatus. Every required pair/dimension is represented, including UNKNOWN; a missing graph edge is invalid input, never evidence of independence. No transitivity, connected components or inference from absent relatedness is permitted.

Sufficiency is separate from agreement. A v0 schema MUST declare at least one ordered requirement; zero requirements makes it invalid. The only v0 operators are MIN_ACCEPTED_OBSERVATIONS(n) and MIN_DISTINCT_VERIFIED_VALUES(dimension,n), with each integer n >= 1. The first compares the admitted, non-disqualified Observation count to n. The second counts distinct canonical values from VERIFIED, conflict-free, time-valid claims on participations with admitted Observations; UNKNOWN and conflicted values do not count. It does not count relation-graph components. All requirements MUST pass; overall sufficiency is their logical AND. Unsupported operators, malformed/impossible parameter types and contradictory output are protocol errors, not a fifth epistemic state. Any required diversity failure makes the set insufficient regardless of agreement. Practical achievability is the schema author's responsibility unless static event cardinality makes a threshold impossible.

PoWit v0 MUST NOT use a universal independence score, truth-probability scalar, reputation × independence formula, connected-component group count or automatic fractional correlation weights. The only standardized sufficiency operators are the two above; other operators require a future protocol version.

### 8. Aggregation and classification

The only v0 reducer is EXACT_MATCH. The EventSchema MUST designate a material claim path using an ordered non-empty array of object-key strings; traversal is exact, case-sensitive and object-only, with no implicit array indexing or coercion. Every admitted Observation's path MUST resolve to a non-null JSON value. Compare values by their JCS canonical UTF-8 bytes. The result preserves each distinct value and its count, ordered lexicographically by canonical UTF-8 bytes; it never selects a winner. One distinct value is CONVERGENT; more than one is MATERIALLY_DIVIDED. `ENUM_DISTRIBUTION`, `NUMERIC_RANGE`, `THRESHOLD` and `STRUCTURED_TALLY` remain future candidates.

If there are zero admitted Observations, aggregation is not invoked and classification is SILENT. An explicit abstention produces no Observation. A negative material value is not abstention absent the exact schema-declared abstention marker. For nonempty inputs aggregation is calculated even if sufficiency fails, so its basis remains inspectable; classification still gives THIN precedence.

The exact EpistemicState set is **CONCORDANT, SPLIT, THIN, SILENT**. Apply this ordered decision table to validated policy outputs:

| Order | Condition | State |
| --- | --- | --- |
| 1 | No admitted Observation | SILENT |
| 2 | At least one admitted Observation, sufficiency false | THIN |
| 3 | At least one admitted Observation, sufficiency true, EXACT_MATCH is CONVERGENT | CONCORDANT |
| 4 | At least one admitted Observation, sufficiency true, EXACT_MATCH is MATERIALLY_DIVIDED | SPLIT |

THIN takes precedence over apparent convergence or division whenever sufficiency fails. SILENT never asserts non-occurrence. Sufficient nonempty inputs require an aggregation policy that gives exactly one of convergent or materially divided; unclassified/overlapping results are a policy error and block finalization. None of these states guarantees truth. Retain the distribution/assessment basis even when the headline is THIN.

### 9. Attestation, correction and settlement

An Attestation is the immutable canonical result of finalization. It binds protocol version, EventDefinition, schema, accepted participations/Observations, graph, sufficiency, aggregation, replay inputs, logical finalization time, version and predecessor using the exact TYPES envelope. It MUST NOT include its own hash, mutable signatures, settlement status or later storage URLs. Hashes are references, not guarantees of data availability or issuer honesty.

The initial Attestation has version 1 and null predecessor. A permitted correction has predecessor equal to the old attestation hash, version equal to predecessor version + 1, and the same Event/schema binding. It recomputes all affected bindings from a separately frozen corrected input bundle. Both records remain retrievable under the access policy. A link alone does not authorize supersession; contested successors, new observations, schema changes and challenge authorization are B05. Without an accepted challenge profile an implementation MUST NOT produce a correction on its own authority.

Settlement concerns an Attestation, not EventState or epistemic formation. Local/content-addressed delivery and chain adapters are possible. Settlement failure, retry or chain rollback MUST NOT change the Attestation bytes or epistemic state. Solana remains an external preferred MVP profile, never a generic type dependency. A settlement receipt does not validate human independence or physical reality.

### 10. Replay and conformance

A verifier needs the exact schema and policy definitions; frozen EventDefinition/windows; participation and qualification records; claims and validity evidence; accepted commitments; matching reveals including invalid reports; evidence manifests and relevant authentication records; non-reveal/defect history; admission ordering/cutoff; and any authorized correction inputs. It must re-evaluate admission, meaningfulness, relation derivation, sufficiency and aggregation before comparing canonical bytes/hashes. The computed graph/evaluations are comparison targets, not trusted substitutes for re-derivation.

Hash-only comparison is integrity verification, not independent protocol replay. Missing protected inputs limits the verification claim and MUST be disclosed. Exact replay-bundle/admission provenance is B04. Identical frozen inputs and policy versions MUST reproduce the accepted set, relation graph, evaluations, state, Attestation bytes and hash; wall-clock completion time, map iteration order and transport metadata MUST NOT affect them.

### 11. Exclusions

The first kernel MUST NOT depend on ZK, private reputation, decentralized discovery, advanced location proofs, automated collusion detection, cross-event graph analysis, staking, slashing, token economics, DAO governance, prediction markets or generalized dispute courts. These remain future systems. Cryptographic validity ≠ epistemic validity; consensus ≠ independence; agreement ≠ sufficiency; settlement ≠ truth; evidence ≠ witnessing; no observation ≠ non-occurrence.

## PROVISIONAL

Additional reducers, relationship inference, sufficiency operators, corrections and evidence authentication beyond the stated initial-finalization profile are not v0 defaults. ZK identity construction, reputation and economic services remain future systems.

## OPEN QUESTION

The supported initial-finalization profile is executable from its policy definitions and ReplayBundle. B05/B06 block corrections and evidence authentication respectively. See [the decision register](POWIT_V0_OPEN_QUESTIONS.md) for production trust and deferred capabilities. Passing byte-format vectors alone is not protocol conformance.
