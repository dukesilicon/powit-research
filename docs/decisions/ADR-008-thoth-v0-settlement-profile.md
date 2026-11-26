# ADR-008: Thoth v0 settlement and restricted verification-material availability

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-23
Depends on: [PoWit v0 types](../../protocol/powit/v0/POWIT_V0_TYPES.md); [PoWit v0 semantics](../../protocol/powit/v0/POWIT_V0_SPEC.md); [Thoth settlement profile](../../protocol/powit/settlement/THOTH_V0_SETTLEMENT_PROFILE.md); [ADR-003](ADR-003-solana-as-preferred-settlement.md)
Supersedes: Provisional settlement-mechanism suggestions for the Thoth v0 delivery layer; does not supersede ADR-003's preferred-chain status or PoWit v0 semantics

## Context

PoWit v0 already produces an immutable Attestation and hashes its canonical ReplayBundle as `replayInputHash`. The Thoth MVP retains the ReplayBundle encrypted. A future Solana adapter needs a chain-independent commitment and an honest statement of who can obtain the material required for independent replay. Settlement must consume, never form or revise, the epistemic result.

## Decision

Adopt the exact eight-field [ThothSettlementRecordV0](../../protocol/powit/settlement/THOTH_V0_SETTLEMENT_PROFILE.md) for an already finalized Attestation. Its `replayBundleHash` is the existing `POWIT_V0_REPLAY_INPUTS` digest of the canonical plaintext ReplayBundle and must equal the Attestation's `replayInputHash`. Its initial `verificationAvailabilityProfile` is `RESTRICTED_REPLAY`: authorized verifiers can obtain and replay the canonical bundle, but public replay is not promised. Storage encryption and settlement receipts do not enter either PoWit hash. Keep settlement and verification-material availability separate from CONCORDANT/SPLIT/THIN/SILENT.

## Alternatives considered

Hashing ciphertext would make nonce/key rotation change protocol identity. Publishing the entire ReplayBundle would expose protected witness inputs without an accepted disclosure policy. Anchoring only the Attestation hash would permit integrity comparison but would omit an explicit verification-material commitment and availability claim. Repeating the complete Attestation in the settlement record would add public data without improving replay verification.

## Consequences

An adapter can publish and recover one chain-independent commitment without choosing epistemic rules. A verifier with authorized bundle access can recompute both hashes and replay PoWit. Immutable records for later Attestation versions can coexist with earlier records; settlement does not authorize corrections. This is an additive Thoth delivery-profile decision within v0, not a PoWit kernel/wire revision or a rewrite of the frozen historical snapshot.

## Risks / tradeoffs

Restricted access limits who can independently replay. If Thoth loses or withholds the bundle, verification material is unavailable even though the Attestation and settlement record remain historically unchanged. Public Event IDs and hashes can correlate records. A valid settlement commitment does not prove witness independence, issuer honesty, objective truth, correction authority or EvidenceArtifact authenticity.

## Reconsider if

A reviewed disclosure model supports public or encrypted replay, the selected chain cannot faithfully preserve/recover the eight-field commitment, or a different verification-material availability guarantee is explicitly accepted. A new profile version and ADR must preserve existing records.

## Provenance and unresolved work

Authority: the user's explicit “FREEZE THE V0 SETTLEMENT AND VERIFICATION-AVAILABILITY PROFILE” request applied to base commit `fa757f37298117d759c9b07e9c4abf38d018a5c0`. B05 correction authorization, B06 EvidenceArtifact authentication, deployment retention/access, and chain-specific finality/authority/account layout remain unresolved. [ADR-003](ADR-003-solana-as-preferred-settlement.md) retains Solana as a preferred target, not a generic protocol dependency.
