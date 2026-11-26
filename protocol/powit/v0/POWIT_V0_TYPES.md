# PoWit v0 — canonical record formats

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [semantics](POWIT_V0_SPEC.md); [vectors](POWIT_V0_TEST_VECTORS.md); [open questions](POWIT_V0_OPEN_QUESTIONS.md)
Supersedes: Provisional v0 object/cardinality/encoding candidates only as recorded in ADR-006

## Purpose

Freeze wire envelopes and deterministic bytes without inventing policy semantics. These are conceptual JSON schemas, not TypeScript declarations or an implementation. A record can pass structural validation while failing its governing policy. PolicyRef pins a definition; it does not make an undefined policy executable.

## CANONICAL

### 1. Shared conventions

All fields listed below are **required**, including nullable fields, unless explicitly marked transport-only. Unknown fields in a protocol record MUST be rejected; schema-defined values occur only inside the designated JSON payloads. No absent-field defaults. `null`, empty string, empty object and empty array are distinct. No undefined values. Every field participates in its record's digest unless an explicit projection is stated. Optional semantics use a required field with explicit null; no implicit omission.

| Primitive | Frozen representation |
| --- | --- |
| Id | ASCII string matching `[A-Za-z0-9][A-Za-z0-9._:-]{0,127}`; opaque and case-sensitive; uniqueness within the owning Event/type namespace |
| Version | Id-shaped opaque version label; no semantic-version ordering; `protocolVersion` is exactly `powit-v0` |
| Hash | 64 lowercase hexadecimal characters, no `0x`; SHA-256 digest, never a numeric value |
| Salt | 64 lowercase hexadecimal characters representing 32 random bytes; production MUST use a cryptographically secure generator; deterministic vectors are not production randomness |
| Time | Nonnegative safe integer, milliseconds since Unix epoch UTC, no timezone string or leap-second notation |
| Count/version counter | Nonnegative safe integer; Attestation version starts at 1 |
| J | JSON value accepted by the numeric/string profile below; domain payload semantics require a policy |
| IdSet / HashSet | Array sorted ascending ASCII by element, no duplicates; empty is `[]` |
| RecordSet | Array sorted by the record identity/key specified below; duplicate keys invalid, even when content is identical |

Sets MUST be normalized before hashing or compared against their required sorted representation. JCS itself never sorts arrays. Ordinary lists retain order; reordering them changes meaning and hash. Record identifiers MUST resolve within the matching Event. No global civil identifier, wallet, secret root or raw biometric is a required core field.

### 2. Canonical serialization and hashing

Use [RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785) and SHA-256. JCS supplies recursive UTF-16 property-name ordering, ECMAScript primitive serialization and UTF-8 output. Preserve Unicode without normalization; reject duplicate keys, invalid Unicode and non-finite numbers. Emit no BOM or trailing newline. Do not rebuild an object and assume JSON.stringify will preserve JCS ordering for integer-like keys.

This v0 profile additionally permits JSON numbers only when their mathematical value is an integer in `[-9007199254740991,9007199254740991]`. Reject out-of-range or fractional input before lossy parsing; never round it into compliance. Equivalent numeric syntax such as `1.0` canonicalizes to `1`; negative zero canonicalizes to `0`. Higher precision quantities MUST use schema-defined strings; numeric reducer interpretation remains B01. This restriction makes envelope counters/times interoperable without selecting a numerical epistemology.

Let `C(x)` be the JCS UTF-8 bytes of an admissible value. Freeze:

`H(D,x) = lowercase_hex(SHA-256(ASCII(D) || 0x00 || C(x)))`.

`||` denotes byte concatenation. D is one of the exact ASCII domains below; it contains no NUL. The terminator is one zero byte, not the text `\\0` or a newline. Hash values inside JSON remain their lowercase hex strings, not decoded bytes. Domain strings are case-sensitive. A successful digest calculation says nothing about record admissibility.

| Exact domain | Input / hash reference |
| --- | --- |
| POWIT_V0_SCHEMA | Complete EventSchema → schemaHash |
| POWIT_V0_EVENT | EventDefinition only → eventHash |
| POWIT_V0_POLICY | Resolved policy-definition J → PolicyRef.definitionHash |
| POWIT_V0_OBSERVATION | Proposed/accepted Observation wire value → observationHash |
| POWIT_V0_EVIDENCE_MANIFEST | EvidenceManifest → evidenceManifestHash |
| POWIT_V0_COMMIT | CommitmentPreimage → commitmentHash |
| POWIT_V0_UNIQUENESS_ASSERTION | EventScopedUniquenessAssertion → uniquenessAssertionHash |
| POWIT_V0_RELATION_GRAPH | RelationGraph → relationGraphHash |
| POWIT_V0_SUFFICIENCY | SufficiencyEvaluation → sufficiencyEvaluationHash |
| POWIT_V0_AGGREGATION | AggregationResult → aggregationResultHash |
| POWIT_V0_PARTICIPATION_SET | Sorted accepted WitnessParticipation record array → acceptedParticipationSetHash |
| POWIT_V0_OBSERVATION_SET | Sorted accepted Observation record array → acceptedObservationSetHash |
| POWIT_V0_REPLAY_INPUTS | Canonical ReplayBundle → replayInputHash |
| POWIT_V0_ATTESTATION | Complete immutable Attestation → attestationHash |

The two set hashes are **flat hashes of full canonical arrays**, not Merkle roots. Participation records sort by `participationId`; Observations sort by `witnessParticipationId`. Event uniqueness makes the latter unique. Empty arrays are hashed, never replaced by null. No leaf hashing, proof path, padding, tree balancing, duplicate folding or membership-proof claim exists. `relationGraphHash` hashes the whole graph; `observationSetRoot` and `relationGraphRoot` are not wire fields. Merkle formats are deferred, not needed for this full-data profile.

No standalone protocol hash is specified for other supporting records; their complete bytes are bound through the replay bundle or enclosing manifest/graph. Artifact content digests use raw SHA-256 over the exact file bytes (not H or JSON), explicitly typed as SHA-256 in the reference. Signatures, URLs, access tokens and ledger confirmations are transport/adapter metadata outside these digests; they cannot change what was attested.

Node 24.18.0 and the repository's Node 22.18+ requirement support the necessary ECMAScript serialization and built-in SHA-256 computation. No runtime dependency was added. TYPES selects no signature suite, parser library or ZK system. The vectors exercise the byte decisions; a production parser must also enforce the rejection rules before lossy parsing.

### 3. Policies, schema and Event

Every table row specifies field, type and meaning. All are hashed unless noted. Policies and EventDefinitions are public/verifier-accessible in this profile; hidden sensitive inputs require explicit access arrangements, not a different undisclosed schema.

| Record | Fields and invariants |
| --- | --- |
| PolicyRef | `policyId: Id`, `policyVersion: Version`, `definitionHash: Hash`. Resolve the exact definition and verify H(POLICY, definition); an ID/version alone is insufficient. Unsupported definitions block activation/replay. |
| EventSchema | `protocolVersion: "powit-v0"`, `schemaId: Id`, `schemaVersion: Version`; `observationSchema: PolicyRef`, `witnessEligibilityPolicy: PolicyRef`, `requiredClaims: IdSet`, `relationPolicy: PolicyRef`, `relationalDiversityPolicy: PolicyRef`, `sufficiencyPolicy: PolicyRef`, `aggregationPolicy: PolicyRef`, `timingPolicy: PolicyRef`; `evidencePolicy: PolicyRef or null`, `authenticationPolicy: PolicyRef or null`, `challengePolicy: PolicyRef or null`. The observationSchema definition selects required paths, one materialClaimPath and an optional explicit abstentionPath/marker. The relationPolicy definition selects CLAIM_VALUE_EQUALITY dimensions and relevant times. The relationalDiversityPolicy pins which dimensions may be used by MIN_DISTINCT_VERIFIED_VALUES. The sufficiencyPolicy contains one or more supported requirements. The aggregationPolicy is exactly EXACT_MATCH. Null evidence/authentication disables the feature; authentication requires evidencePolicy. Null challengePolicy does not authorize corrections. |
| Windows | `enrollmentOpensAt`, `enrollmentClosesAt`, `observationOpensAt`, `observationClosesAt`, `commitOpensAt`, `commitClosesAt`, `revealOpensAt`, `revealClosesAt`: Time, all required; obey SPEC section 3. |
| EventDefinition | `protocolVersion: "powit-v0"`, `eventId: Id`, `schemaId: Id`, `schemaVersion: Version`, `schemaHash: Hash`, `windows: Windows`, `configuration: J`. configuration is an object interpreted only by the pinned schema; do not put mutable display labels here. Freeze this whole value on activation. |
| Event | `definition: EventDefinition`, `state: EventState`. Event is the execution wrapper; eventHash hashes **definition only**, not state. State changes are retained in the replay/audit history. No Event digest over the mutable wrapper is defined. |

EventState is exactly `DRAFT`, `ACTIVE`, `FINALIZING`, `ATTESTED`, `CANCELLED`. No enum coercion or lowercase alternatives. Schema identity/version MUST resolve to the same schemaHash for the Event's entire execution. Schema migration is not an in-place Event update.

### 4. Participation, claims and qualification

These records may contain sensitive associations. Only authorized verifiers need access to full claim/proof values; publication of their hashes does not make low-entropy attributes private. Participant IDs are event-scoped; privacy strength depends on the upstream provider and disclosure rules.

| Record | Fields and invariants |
| --- | --- |
| WitnessParticipation | `eventId: Id`, `participationId: Id`, `witnessClasses: IdSet`, `enrolledAt: Time`, `uniquenessAssertionHash: Hash`. Class values are schema-defined labels, not additional participation rights. The referenced EventScopedUniquenessAssertion is accepted once per opaque event-scoped token; no principal secret or wallet field. |
| EventScopedUniquenessAssertion | `eventId: Id`, `uniquenessToken: Id`, `assuranceProvider: Id`, `assuranceMethod: PolicyRef`, `assertedAt: Time`, `validUntil: Time or null`. The opaque token is unique within the Event and MUST NOT itself disclose a cross-event link. The provider/method trust and token validity are inputs pinned by the eligibility profile; PoWit defines no derivation or human-Uniqueness proof. A duplicate token is rejected atomically and cannot create another participation. `assertedAt` MUST be the authoritative time of the accepted assertion action; if validUntil is finite, it MUST be greater than assertedAt and enrollment/commitment must occur before it. |
| CredentialReference | `issuerId: Id`, `credentialRef: string`, `proofRef: string or null`. Nonempty opaque references, not raw documents. Their resolution/issuer trust is profile-controlled. These references need not be public or cross-event-stable. |
| Claim | `eventId: Id`, `claimId: Id`, `subjectParticipationId: Id`, `claimType: Id`, `value: J or null`, `credential: CredentialReference or null`, `provenance: ClaimProvenance`, `verificationState: VerificationState`, `verificationPolicy: PolicyRef or null`, `validFrom: Time`, `validUntil: Time or null`. At least one of value/credential must be non-null. If VERIFIED, verificationPolicy and credential are nonnull and the policy issuer equals credential.issuerId. If finite, validUntil > validFrom; interval is half-open. Null validUntil means no stated upper bound, not perpetual credibility. |
| QualificationSnapshot | `eventId: Id`, `participationId: Id`, `schemaHash: Hash`, `policy: PolicyRef`, `evaluatedAt: Time`, `relevantAt: Time`, `claims: Claim RecordSet`, `eligible: true`. Claims sort by claimId, all subjects/event bindings agree; evaluatedAt is the accepted commitment time. A rejected eligibility attempt is not this accepted snapshot. |

ClaimProvenance is exactly `SELF_DECLARED`, `CREDENTIAL`, `PRESENCE`, `THIRD_PARTY`, `DERIVED`. VerificationState is exactly `VERIFIED`, `UNVERIFIED`, `INVALID`; VERIFIED means the pinned verification policy produced a passed issuer result, not objective truth. Expiry is computed at relevantAt, never silently rewritten into a stored state. Claims supporting known relations require the selected relation policy's accepted verification policy, not just this enum. Competing claim values are not resolved by ID order.

The accepted participation set contains exactly the non-disqualified participations with admitted Observations at the finalization cutoff. Explicit abstentions, invalid reports, non-reveals and disqualified participations remain in replay history, not this set. This set is not a census of every enrolled person.

### 5. Observation and commit/reveal records

| Record | Fields and invariants |
| --- | --- |
| Observation wire value | `eventId: Id`, `witnessParticipationId: Id`, `observedAt: Time`, `report: J`, `evidenceManifestHash: Hash or null`. report MUST be an object with schema-defined structured content. For admission, every required path and materialClaimPath resolves; the material value is non-null. An explicit abstention is recognized only by the exact schema-declared abstentionPath and marker, and creates no Observation. Supplemental text belongs inside the schema. The `(eventId,witnessParticipationId)` pair identifies at most one admitted Observation; no independently chosen observationId. |
| CommitmentPreimage | `eventId: Id`, `witnessParticipationId: Id`, `observationHash: Hash`, `evidenceManifestHash: Hash or null`, `salt: Salt`. Hash with POWIT_V0_COMMIT. event/participation/evidence fields MUST equal the proposed Observation fields. Salt is the hex string in canonical JSON, not decoded bytes. |
| CommitmentRecord | `eventId: Id`, `witnessParticipationId: Id`, `commitmentHash: Hash`, `acceptedAt: Time`, `qualificationSnapshot: QualificationSnapshot`. The accepted record never exposes salt or report before reveal. |
| RevealRecord | `eventId: Id`, `witnessParticipationId: Id`, `candidateObservation: J`, `evidenceManifest: EvidenceManifest or null`, `salt: Salt`, `receivedAt: Time`, `validation: RevealValidation`, `validationReasons: IdSet`. One retained cryptographically matching reveal. It may be `ADMITTED_OBSERVATION`, `EXPLICIT_ABSTENTION` or `INVALID_OBSERVATION`; no self-hash or embedded CommitmentRecord. |

RevealValidation is exactly `ADMITTED_OBSERVATION`, `EXPLICIT_ABSTENTION`, `INVALID_OBSERVATION`. Reasons are empty for admitted/abstention and nonempty stable codes for INVALID_OBSERVATION. A structurally canonical candidate can be hashed even if invalid; H(OBSERVATION, candidateObservation) is recomputed before schema validation. If an evidence manifest is present its H(EVIDENCE_MANIFEST, value) must equal the preimage reference. For abstention, the candidate must satisfy the schema's explicit abstention marker and still match the commitment; it is retained but creates no Observation. For admitted/abstention, every event/participation/evidence binding agrees across records. Other cryptographic mismatches belong to rejected-attempt logs, never this RevealRecord. The committed `observedAt` is a witness report field; `receivedAt` and intake acceptance time are protocol-authoritative.

An Observation contains no commitment hash, reveal timestamp or verdict: those reverse references remain in CommitmentRecord/RevealRecord, avoiding a hash cycle. Admission is determined by the retained records and policies, never by an `accepted: true` flag supplied by the witness.

### 6. Evidence and authentication

| Record | Fields and invariants |
| --- | --- |
| EvidenceArtifact reference | `artifactId: Id`, `submittedByParticipationId: Id`, `digestAlgorithm: "SHA-256"`, `contentHash: Hash`, `byteLength: Count`, `mediaType: string`. Nonempty mediaType describes declared content, not verified authenticity. contentHash hashes exact raw bytes. Size/hash must match retrieved bytes; locators and access tokens are transport-only and excluded. |
| EvidenceManifest | `eventId: Id`, `witnessParticipationId: Id`, `artifacts: EvidenceArtifact RecordSet`. Sort by artifactId; unique IDs; all submittedByParticipationId values equal the manifest participation. An explicit empty artifacts array differs from no manifest. Authentication records are not inside the committed manifest, avoiding a dependency on later assessments. |
| AuthenticationRecord | `eventId: Id`, `artifactManifestHash: Hash`, `artifactId: Id`, `authenticatorId: Id`, `policy: PolicyRef`, `assessedAt: Time`, `result: AuthenticationResult`, `reasonCodes: IdSet`, `provenanceClaimIds: IdSet`. Result is exactly PASS, FAIL, INDETERMINATE. The authenticator's event role/credentials and non-self-authentication must be verified under B06; ID inequality alone is not human distinctness. |

Artifact access and AuthenticationRecords can be restricted. Their presence does not replace the human's explicit report or qualification. Exactly which authentications admit evidence is policy-dependent and unresolved; no majority of authenticators is implicitly sufficient.

### 7. Relations

| Record | Fields and invariants |
| --- | --- |
| Relation | `leftParticipationId: Id`, `rightParticipationId: Id`, `dimension: Id`, `status: RelationStatus`, `claimIds: IdSet`. left < right in ASCII order; no self-edges. Identity is the tuple `(leftParticipationId,rightParticipationId,dimension)`. claimIds identifies provenance used by the pinned policy; status is derived, never accepted as a participant's assertion. |
| RelationGraph | `eventId: Id`, `policy: PolicyRef`, `participantIds: IdSet`, `dimensions: IdSet`, `relations: Relation RecordSet`, `conflicts: RelationConflict RecordSet`. Sort relations lexicographically by the three identity components (compare components separately; do not concatenate). Exactly one Relation per unordered participant pair and required dimension; no duplicate or missing edge. |

RelationStatus is exactly `KNOWN_RELATED`, `KNOWN_DISTINCT`, `UNKNOWN`. participantIds equal the non-disqualified participations with admitted Observations; dimensions equal the sorted relation-policy dimensions. For a dimension, only VERIFIED claims valid at its relevantAt participate. `JCS_VALUE` compares canonical JSON bytes. A participation with a single canonical value has that value; no value, invalid/unverified-only values, incomparable values, or multiple distinct applicable verified values means unknown for that dimension. Multiple distinct values produce a `RelationConflict` with all applicable claim IDs; its pairwise relations are UNKNOWN. One known value on both ends: equal means KNOWN_RELATED, unequal means KNOWN_DISTINCT. Otherwise UNKNOWN. `claimIds` contains sorted supporting claims from both endpoints; for conflict, include the conflicted participation's applicable claims and any known counterpart claims. `RelationConflict` is `participationId: Id`, `dimension: Id`, `claimIds: IdSet`, `canonicalValues: [{canonicalValue: J, claimIds: IdSet}]`, sorted by canonical bytes; it is derived provenance, not a fourth relation status. Empty/one-person graph has no pairs, not evidence of sufficient diversity. Missing edges are invalid and never imply independence. No transitivity/group clustering is defined.

### 8. Evaluations

| Record | Fields and invariants |
| --- | --- |
| RequirementEvaluation | `requirementId: Id`, `operator: SufficiencyOperator`, `parameters: J`, `observedValue: Count`, `passed: boolean`, `claimIds: IdSet`, `relationKeys: array of [Id,Id,Id]`. The reference sets are sorted and duplicate-free; they identify exactly the inspected claims/relations for the operation. |
| SufficiencyEvaluation | `eventId: Id`, `policy: PolicyRef`, `requirements: RequirementEvaluation[]`, `overallSufficient: boolean`. Preserve schema order in this ordinary list; IDs remain unique. Include exactly all requirements; at least one is mandatory; overallSufficient is logical AND of every passed value. |
| AggregationResult | `eventId: Id`, `policy: PolicyRef`, `reducer: "EXACT_MATCH"`, `materialClaimPath: array of Id`, `assessment: AggregationAssessment`, `values: AggregationValue RecordSet`. Each AggregationValue is `canonicalValue: J`, `observationCount: Count`, `participationIds: IdSet`. Sort values by unsigned lexicographic order of the JCS UTF-8 bytes of canonicalValue; ties are impossible. Its total count equals admitted Observation count. |

SufficiencyOperator is exactly `MIN_ACCEPTED_OBSERVATIONS` and `MIN_DISTINCT_VERIFIED_VALUES`. Parameters are respectively `{minimum: Count}` and `{dimension: Id, minimum: Count}`; minimum is >=1. The first observedValue is admitted Observation count; its claimIds/relationKeys are empty. The second observedValue is the number of distinct VERIFIED, time-valid, conflict-free canonical dimension values among participating Observations; claimIds is exactly the claims used and relationKeys is empty because this operator counts values directly rather than graph groups. UNKNOWN/conflicted values do not count. AggregationResult assessment is exactly `CONVERGENT` or `MATERIALLY_DIVIDED`. Empty admitted set has no AggregationResult and Attestation aggregationResultHash is null. Nonempty result's value counts sum to the observation count; one value is CONVERGENT, more than one is MATERIALLY_DIVIDED. No winner or weighting exists.

### 9. Attestation and external records

All Attestation fields are required and hashed. Field names ending in Hash refer to H with the domain table, except supersedes which is the predecessor's attestationHash. Attestation is expected to be inspectable; underlying claim/evidence access may be restricted and must be disclosed to verifiers.

| Attestation field | Type / meaning |
| --- | --- |
| protocolVersion | Exactly `powit-v0` |
| eventId | Id of the concrete Event |
| eventHash | Hash of frozen EventDefinition |
| schemaHash | Hash of pinned EventSchema; equal to EventDefinition.schemaHash |
| acceptedParticipationSetHash | Full sorted accepted-participation array digest |
| acceptedObservationSetHash | Full sorted accepted-Observation array digest |
| relationGraphHash | Digest of the full graph |
| sufficiencyEvaluationHash | Digest of the full sufficiency evaluation |
| aggregationResultHash | Hash of AggregationResult or null iff there are zero admitted Observations and aggregation is NOT_INVOKED |
| replayInputHash | Digest of the complete canonical ReplayBundle below |
| epistemicState | Exactly CONCORDANT, SPLIT, THIN or SILENT, derived by SPEC |
| version | Positive safe integer; initial 1; permitted successor increments predecessor by 1 |
| supersedes | Hash or null; null only for initial version |
| finalizingAt | Time captured on entry to FINALIZING, or the correction bundle's authorized input-freeze time; never hashing-time wall clock |

There is no mutable `latest` flag, settlement status, issuer wallet, on-chain address, attestationHash field, universal confidence or signature inside this object. External envelopes MAY carry authentication/signatures over the immutable hash after their suite is specified. A matching attestationHash validates bytes, not authority to issue or correct them.

| Supporting record | Exact envelope / boundary |
| --- | --- |
| ChallengeRecord | `challengeId: Id`, `eventId: Id`, `targetAttestationHash: Hash`, `submittedAt: Time`, `policy: PolicyRef`, `reasonCodes: IdSet`, `supportingManifestHashes: HashSet`. This records a request, not acceptance or authorization; challenger identity/standing and adjudication are B05. No standalone ChallengeRecord hash domain is frozen. |
| SettlementRecord | `attestationHash: Hash`, `adapterId: Id`, `adapterVersion: Version`, `status: SettlementStatus`, `recordedAt: Time`, `receipt: J or null`. SettlementStatus is exactly PENDING, CONFIRMED, FAILED. Append immutable adapter records; do not mutate Attestation. CONFIRMED means the adapter's specified condition, not universal finality; reorgs may append FAILED. These records are outside epistemic hashes. |

### 10. Binding and validation checklist

### 10. Deterministic policies and replay envelope

The following are the supported policy-definition shapes. Definitions are hashed with POWIT_V0_POLICY; extra or missing fields are invalid. `Path` is a nonempty array of exact, case-sensitive object-member strings matching Id; traversal fails if a member is absent or an intermediate value is not an object. No array index, coercion, normalization or default is implicit. An abstention path, when present, MUST differ from materialClaimPath and from every requiredPath. Only boolean `true` at that separate path means abstention; absence, false or another value does not. An explicit true marker bypasses only the non-null material-value requirement, not declared structural checks. Report keys outside required/material/abstention paths are retained as report data and are not rejected by the core.

| Policy | Exact definition |
| --- | --- |
| ObservationSchema | `{policyKind:"OBSERVATION_SCHEMA_V0", requiredPaths:Path[], materialClaimPath:Path, abstentionPath:Path or null}`. Every Path is resolved against report. Required paths and material path must resolve. An abstentionPath must differ from materialClaimPath. Only boolean true at this path is EXPLICIT_ABSTENTION and no Observation is created; this separate marker is the only abstention. Otherwise the material path must resolve to non-null J for admission. |
| WitnessEligibility | `{policyKind:"WITNESS_ELIGIBILITY_V0", assuranceProviders:IdSet, acceptedAssuranceMethods:PolicyRef[], disqualificationAuthorities:IdSet}`; method refs sort by policyId/version. A participation requires a valid EventScopedUniquenessAssertion whose provider/method are allowlisted and one eligible QualificationSnapshot. Only a listed authority can submit a pre-finalization disqualification. Providers/authorities are upstream trust inputs; no human-proof mechanism is standardized. |
| Relation | `{policyKind:"RELATION_CLAIM_VALUE_EQUALITY_V0", dimensions:[{dimensionId:Id,claimType:Id,claimPath:Path,valueType:"STRING" or "BOOLEAN" or "INTEGER" or "ARRAY" or "OBJECT",normalization:"JCS_VALUE",relevantAt:"QUALIFICATION_RELEVANT_AT",acceptedVerificationPolicies:PolicyRef[]}]}` sorted by dimensionId; each policy list sorts by policyId/version. `claimPath` traverses Claim.value. Only VERIFIED claims whose nonnull verificationPolicy is on this dimension's list are eligible; the policy's issuerId must equal the credential issuerId. A missing path, null or wrong-type value yields UNKNOWN. Distinct values of the same declared JSON type are comparable; no coercion occurs. |
| Upstream assurance method | `{policyKind:"UPSTREAM_ASSURANCE_METHOD_V0", provider:Id, method:Id}`. This names a verifier profile; its human-uniqueness cryptography is outside PoWit. |
| Claim verification profile | `{policyKind:"CLAIM_VERIFICATION_V0", issuerId:Id}`. This identifies which issuer's VERIFIED result is accepted; it does not establish that issuer's honesty. |
| Relational diversity | `{policyKind:"RELATIONAL_DIVERSITY_V0", distinctValueDimensions:IdSet}`. It limits dimensions usable by sufficiency; it does not itself add checks. |
| Sufficiency | `{policyKind:"SUFFICIENCY_V0", requirements:[{requirementId:Id,operator:"MIN_ACCEPTED_OBSERVATIONS",minimum:Count} or {requirementId:Id,operator:"MIN_DISTINCT_VERIFIED_VALUES",dimension:Id,minimum:Count}]}`. Preserve declared order; require at least one unique requirement ID and minimum >= 1. Dimension must exist in relation policy and allowed diversity dimensions. |
| Aggregation | `{policyKind:"AGGREGATION_V0", reducer:"EXACT_MATCH"}` only. |
| Timing | `{policyKind:"TIMING_V0", observationTimeAuthority:"PROTOCOL_ACCEPTANCE", allowObservationCommitOverlap:boolean}`. This v0 replay profile uses protocol acceptance time for admission. Witness `observedAt` is an asserted report value and does not control admission. |

`CoreActionType` is exactly `CREATE_EVENT`, `ACTIVATE_EVENT`, `CANCEL_EVENT`, `BEGIN_FINALIZATION`, `ASSERT_EVENT_SCOPED_UNIQUENESS`, `ENROLL`, `ACCEPT_COMMITMENT`, `ACCEPT_REVEAL`, `DISQUALIFY`. `IntakeDecision` is `{sequence:Count, actionType:CoreActionType, actorId:Id, participationId:Id or null, decision:"ACCEPTED" or "REJECTED", authoritativeAt:Time, clientTimestamp:Time or null, recordRef:Id or Hash or null, reasonCodes:IdSet, input:J}`. Sequence begins at 1 and increases by exactly 1 for every processed protocol action in an Event, including rejected attempts represented in the replay history. It is authoritative and cannot be supplied or reordered by a client. The actor, affected participation and complete submitted input are explicit; acceptance/rejection reason codes are stable schema/profile codes. Only accepted actions create their corresponding immutable record. Admission windows use authoritativeAt, never clientTimestamp. A monotonic sequence resolves equal timestamps and race order. `LifecycleRecord.sequence` references the accepted lifecycle action's IntakeDecision sequence; it does not allocate another sequence. Every transition has exactly one accepted action record, and rejected lifecycle attempts appear only as IntakeDecisions.

Accepted IntakeDecisions have `reasonCodes: []`; rejected decisions have at least one code. The core codes are `EVENT_NOT_ACTIVE`, `ENROLLMENT_WINDOW_NOT_OPEN`, `ENROLLMENT_WINDOW_CLOSED`, `DUPLICATE_EVENT_UNIQUENESS_TOKEN`, `QUALIFICATION_NOT_ELIGIBLE`, `OBSERVATION_WINDOW_NOT_OPEN`, `OBSERVATION_WINDOW_CLOSED`, `COMMIT_WINDOW_NOT_OPEN`, `COMMIT_WINDOW_CLOSED`, `COMMITMENT_ALREADY_ACCEPTED`, `REVEAL_WINDOW_NOT_OPEN`, `REVEAL_WINDOW_CLOSED`, `COMMITMENT_OPENING_MISMATCH`, and `DUPLICATE_MATCHING_REVEAL`. For a matching reveal retained as INVALID_OBSERVATION, stable validation codes are `REPORT_NOT_OBJECT`, `REQUIRED_REPORT_PATH_MISSING`, `MATERIAL_CLAIM_PATH_MISSING`, and `MATERIAL_CLAIM_NULL`; list all applicable path/shape failures as an ASCII-sorted IdSet. A matching explicit abstention has no validation reason. Policy-defined non-core rejection codes MUST be pinned by the hashed policy that evaluates them. A rejected action does not create the record whose admission it requested.

`DisqualificationRecord` is `{eventId:Id, participationId:Id, sequence:Count, decidedAt:Time, reasonCode:Id, evidenceRefs:HashSet}`. It MUST match an accepted DISQUALIFY IntakeDecision at the same sequence and authoritativeAt; the decision actor MUST be in the pinned policy's disqualificationAuthorities. Before FINALIZING, a valid record excludes that participation's admitted Observation and participation from all finalization sets/graphs while retaining participation, uniqueness, snapshot, commitment, reveal and observation records in the replay history. The record and its authority/provenance are replay inputs. After FINALIZING no such record changes the frozen inputs.

`ClaimedObservationOutcome` is `{participationId:Id, sequence:Count, outcome:"ADMITTED_OBSERVATION" or "EXPLICIT_ABSTENTION" or "INVALID_OBSERVATION", reasonCodes:IdSet}` and must correspond one-to-one with matching RevealRecords. `ReplayBundle` has exactly these fields: `{protocolVersion:"powit-v0", eventSchema:EventSchema, policyDefinitions:[{policy:PolicyRef,definition:J}], eventDefinition:EventDefinition, lifecycle:LifecycleRecord[], uniquenessAssertions:EventScopedUniquenessAssertion[], participations:WitnessParticipation[], qualificationSnapshots:QualificationSnapshot[], commitments:CommitmentRecord[], reveals:RevealRecord[], intakeDecisions:IntakeDecision[], disqualifications:DisqualificationRecord[], claimedObservationOutcomes:ClaimedObservationOutcome[], claimedAdmittedObservations:Observation[], claimedRelationGraph:RelationGraph, claimedSufficiencyEvaluation:SufficiencyEvaluation, claimedAggregationResult:AggregationResult or null, claimedEpistemicState:EpistemicState}`. `policyDefinitions` contains every referenced definition exactly once (including upstream assurance-method definitions), sorted by policyId/version and hash-matched to its PolicyRef. `LifecycleRecord` is `{sequence:Count, from:EventState or null, to:EventState, authoritativeAt:Time}`. `eventSchema` and `eventDefinition` are canonical values, not hidden references. Arrays sort by protocol sequence or record identity as follows: lifecycle/intake by sequence; policy definitions by policyId/version; uniqueness by token; participation/snapshot/commit/reveal/disqualification by identity then sequence; claimed outcomes by sequence; claimed Observations by participationId. Their order is canonical and duplicates invalid. IntakeDecision sequences alone are unique and contiguous from 1; each LifecycleRecord points to exactly one accepted IntakeDecision of matching action type/time and from/to transition, and every accepted lifecycle action has exactly one corresponding LifecycleRecord. Claimed outputs are included for comparison but never trusted: a verifier recomputes admission, exclusion, graph, evaluations, aggregation and state, then requires byte equality with claims. At activation, lifecycle includes DRAFT→ACTIVE; at finalization, ACTIVE→FINALIZING. Bundle is frozen at finalizingAt and excludes Attestation and settlement. The full canonical bundle is hashed with POWIT_V0_REPLAY_INPUTS.

The policy references in EventSchema MUST resolve to the exact supported definitions above for this profile. Unsupported profiles cannot activate. This closes deterministic policy behavior without selecting a particular identity provider, transport signature, clock implementation, or correction/evidence-authentication authority.

### 11. Binding and validation checklist

Before finalization, verify all cross-record event, participation, schema, policy, time, evidence and set bindings. Verify exact policy definitions, not names alone. Re-derive inputs/evaluations; check all referenced hashes. Freeze a reproducible replay bundle, then construct the Attestation and compute H(ATTESTATION, value). No cycle is permitted: the replay bundle cannot include this Attestation or its hash, nor later settlement receipts. A correction may reference a prior Attestation.

Sorting is a representation rule, not evidence ordering or an authority tie-break. Required data unavailable to a verifier means incomplete verification, not assumed validity. Resource limits and access arrangements must be fixed by the selected profile without truncating accepted records silently.

## PROVISIONAL

Transport authentication, identity-provider cryptography, correction authority and evidence-authentication policy are not selected. External envelopes may authenticate canonical intake records, but do not change the deterministic replay profile. B05/B06 remain gated.

## OPEN QUESTION

B01-B04 are resolved for the supported first-finalization profile. B05/B06 gate optional corrections/authentication. Merkle proofs, a particular signature suite, cryptographic scoped-ID derivation, privacy transports and schema compatibility are separately tracked in [OPEN_QUESTIONS](POWIT_V0_OPEN_QUESTIONS.md).
