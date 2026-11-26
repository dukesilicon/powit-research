# PoWit v0 — decision and readiness register

Status: OPEN QUESTION
Version: v0
Last reviewed: 2026-09-22
Depends on: [semantics](POWIT_V0_SPEC.md); [types](POWIT_V0_TYPES.md); [earlier register](../../research/open-questions.md)
Supersedes: Earlier Q01-Q16 subquestions only to the extent explicitly resolved below

## Purpose

Track the four resolved first-finalization policy questions and the remaining optional/production decisions. The deterministic v0 policy profile is specified in SPEC/TYPES and exercised by complete replay fixtures. An initial-finalization kernel can now be built; corrections and evidence authentication remain out of scope.

## CANONICAL

### Inspection and authority

The prior freeze inspected HEAD `7802286` and committed the four-document kernel as `9588a301b2bf82894d8095a88ddf287dfc2a5a5b`. This resolution pass starts from that commit with a clean worktree. Existing apps are independent frontend surfaces, not protocol authorities.

Reviewed the protocol README, systems charter, information-architecture handover, governance/version policy, terminology, core event/witness/observation/attestation/lifecycle/aggregation documents, identity/eligibility/nullifier/ZK documents, independence/correlation and reputation boundaries, schemas, settlement/Solana, evidence/network/market boundaries, security/supersession, object model, invariants, state machine, historical consistency audit, Q01-Q16 and ADR-001 through ADR-005. Reviewed downstream application scope/mapping as historical context; no application credential or result field is imported into the primitive. Inspected workspace scripts, documentation validator and boundary checks. Historical snapshot records remain unchanged.

### Reconciliation with earlier documents

| Earlier source | Difference | Disposition |
| --- | --- | --- |
| epistemic-states, terminology, invariants C06, ADR-004, charter and protocol AGENTS | THIN/SILENT overlap and sparse conflict precedence were open | Prior freeze set zero meaningful observations → SILENT; this task refines the term: zero admitted non-abstention Observations → SILENT; nonempty insufficiency → THIN; sufficient convergence/division → CONCORDANT/SPLIT |
| object-model, Event/Observation/Attestation seeds, invariants P01-P03 | Core objects and cardinalities were candidates | Exact core set now includes WitnessParticipation; one schema per Event, one Event/participation per accepted Observation |
| nullifiers, invariants P04 | Event or multi-action scope and revision behavior left open | One opaque uniqueness token is consumed once per Event; the identity provider's proof/derivation remains upstream; no repeat commitment or contribution |
| aggregation, research Q02 | Weighting remained an open direction | Automatic correlation weighting and universal independence/truth scalars excluded from v0 |
| reference state machine / Q09 | No executable Event enum or guards | Five Event states and specified freeze/window/cancellation guards now normative |
| canonical-lifecycle, settlement model, invariants C12 | Conceptual lifecycle includes PUBLIC SETTLEMENT | Retain it as formation-plus-delivery narrative; settlement is outside EventState and cannot change completed epistemic classification |
| general Observation definition | Could denote an unvalidated report or proposed revision | In v0 Observation means admitted, meaningful structured report. A matching explicit abstention remains only a RevealRecord; negative real-world values remain meaningful unless exactly marked as abstention |
| identity/eligibility and evidence seeds | No snapshot revocation rule or Authenticator role | Immutable qualification at commitment; prospective revocation; narrowly scoped provenance authenticator, never a replacement witness |
| old snapshot, consistency audit and example | Record earlier open questions and illustrative local rules | Historical/illustrative only; do not rewrite frozen files or promote the example's reducers into v0 |

These are explicit supersessions/extensions of older material, not unresolved competing authorities. [ADR-006](../../../docs/decisions/ADR-006-powit-v0-semantic-freeze.md) records the initial freeze; [ADR-007](../../../docs/decisions/ADR-007-powit-v0-executable-policy-profile.md) resolves the four implementation gates. Earlier ADR principles separating layers, protecting scoped privacy, preserving disagreement and separating reputation/independence remain in force. Solana remains a preferred external integration.

### Resolved in this pass

The initial freeze established the core objects and state/cardinality boundaries. This pass freezes Observation admission/abstention semantics, EXACT_MATCH, deterministic claim equality relations, two sufficiency operators, event-scoped opaque-token uniqueness consumption, authoritative event ordering/time, pre-finalization disqualification exclusion and the exact ReplayBundle.

Mechanical decisions retained from the initial freeze: half-open millisecond windows; opaque ASCII IDs/versions; required nullable fields; JCS with safe-integer numeric profile; SHA-256 with NUL-delimited domains; 32-byte salts represented as lowercase hex; complete pairwise relation representation; sorted flat set hashes; exact immutable Attestation envelope. This pass adds exact policy definition shapes and replay decisions while leaving upstream human-proof cryptography unspecified.

### Four-view critical review

| View | Ambiguity/attack identified | Resolution or remaining gate |
| --- | --- | --- |
| Implementer | Claim paths, exact equality, requirement order, abstention and empty inputs could be filled differently | Exact supported policy profile, result envelopes and four full replay/Attestation vectors are now fixed |
| Adversarial witness | Duplicate token, client timestamp, duplicate classes, abstention misread as negative, or issuer conflict could change the accepted set | Atomic event-token uniqueness, protocol time/sequence, explicit abstention marker, negative false remains data, conflicts become UNKNOWN, disqualification records preserve history |
| Independent verifier | A precomputed graph/output could be trusted instead of derived | Replay bundle binds policies, lifecycle, all inputs and claimed outputs; verifier recomputes and requires canonical equality; full Attestation hashes are supplied |
| Future Thoth | Wallet linkage, chain-specific fields or a frozen human-ID method could constrain privacy/ZK | Uniqueness token is opaque and event scoped; provider derivation stays upstream; no wallet/global identifier or chain object; reputation and fractional weights stay out |

Additional checks: a matching but invalid report never becomes an Observation; missing claims do not become KNOWN_DISTINCT; a complete one-person graph does not establish adequate diversity; null evidence and empty manifest are different commitments; unauthorized successor links do not prove authority; missing private data means limited verification, not a successful replay.

## PROVISIONAL

The supported kernel profile freezes EXACT_MATCH only. ENUM_DISTRIBUTION, NUMERIC_RANGE, THRESHOLD and STRUCTURED_TALLY remain future candidates. The five-human vectors use clearly identified fixture issuers; their fixture trust roots do not prescribe production identity infrastructure. Corrections and authentication remain disabled unless B05/B06 are resolved.

## OPEN QUESTION

### RESOLVED FIRST-FINALIZATION QUESTIONS

| ID | Exact decision needed | Evidence required to close / affected vectors |
| --- | --- | --- |
| ID | Resolved decision | Frozen result |
| --- | --- | --- |
| B01 | Observation validation, meaningfulness, reducer and materiality | Observation means an admitted structured report, with an exact material path and optional separate boolean-true abstention path. Abstention produces only a RevealRecord. `false` remains a claim value. EXACT_MATCH compares JCS canonical values, preserves counts, and never chooses a majority. |
| B02 | Claim-to-relation derivation | CLAIM_VALUE_EQUALITY over verified, relevant-time, conflict-free values; equal/different → RELATED/DISTINCT, otherwise UNKNOWN. Pairwise edges are complete; missing edges do not imply independence. |
| B03 | Sufficiency | Nonempty ordered conjunction of MIN_ACCEPTED_OBSERVATIONS and MIN_DISTINCT_VERIFIED_VALUES only; thresholds >=1; zero requirements invalid; no graph-component inference or weighting. |
| B04 | Upstream uniqueness boundary, intake and replay | Opaque event-scoped token consumed at most once; provider/method pinned by policy. Protocol authoritative times and contiguous per-event sequence govern admissions; replay bundle contains exact policies, lifecycle, records, decisions and claimed outputs to recompute. Event-time defect before freeze excludes with preserved provenance. |

These decisions resolve B01-B04 for an implementation of initial finalization. The kernel treats provider-issued uniqueness assertions and verified claims as trusted, policy-pinned inputs; production choice and cryptographic assurance are deployment responsibilities, not proof that the underlying assertions are true.

### BLOCKING OPTIONAL CAPABILITIES / NEEDS ADR

| ID | Decision | Scope |
| --- | --- | --- |
| B05 | Challenge standing, authorization, deadlines, required evidence, correction input changes, same-schema policy, competing successors and canonical-current selection | Required before creating/accepting superseding Attestations; not needed for an initial-finalization-only profile. Immutable linking/version rules alone do not close this question. |
| B06 | Authenticator enrollment, human non-self-authentication proof, required diversity, result combination, evidence validity/privacy/access/withholding policy | Required when evidence/authentication is enabled; not required for a schema with evidencePolicy/authenticationPolicy null. |
| A01 | Schema-version evolution, identifier governance, compatibility between future wire/policy versions | Do not revise an ACTIVE Event in place. New version semantics require a deliberate decision, not copying the old hash. |
| A02 | Production publication signatures, audit/resource limits, retention and verifiable access boundaries | Required before production assurance claims; not an excuse to invent a signature/key system in this task. |

### DEFERRED POST-V0

Exact scoped participant/nullifier derivation, ZK, cross-event privacy/correlation, private reputation, decentralized discovery, advanced proof-of-location, automated collusion detection, token/staking/slashing economics, governance courts and prediction markets remain deferred. The frozen event entitlement must survive later mechanisms. Merkle membership proofs are deferred; full-data flat hashes already have exact rules. Signature suites and chain receipts require their own profiles. Raw artifact content addressing does not resolve evidence authenticity or disclosure.

### APPLICATION-SPECIFIC

Domain observations, witness classes, accepted credential issuers, relevant claim dimensions, thresholds and domain evidence provenance requirements belong to reviewed schema profiles. Application-specific does not mean unspecified: an executing schema still needs deterministic definitions compatible with B01-B06. No application defines generic PoWit cardinalities or state semantics.

### Readiness answers

**Could an independent implementation agent now build the initial-finalization PoWit v0 kernel without inventing protocol or epistemic semantics? Yes**, for schemas using the policy profile frozen here, with corrections and evidence authentication disabled. The core consumes opaque uniqueness assertions and policy-verified claims as inputs; it does not create civil-human proof or issuer truth.

**Remaining gates:** B05 (challenge standing, correction authorization, competing successors and current selection) is required before correction/supersession behavior is implemented. B06 (Authenticator qualification/diversity, non-self-authentication, evidence admission/privacy and result combination) is required only if evidence authentication is enabled. Production deployments also need a chosen trusted identity/claim assurance provider, signature/transport boundary and operational resource/access policy. Those deployment choices do not change the deterministic v0 kernel inputs/outputs. ZK, reputation, economics and Solana do not block initial finalization. The existing Q01-Q16 register remains broader research history; this document records the exact closures and residual scope.
