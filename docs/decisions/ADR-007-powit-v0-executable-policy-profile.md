# ADR-007: PoWit v0 executable initial-finalization policy profile

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [v0 SPEC](../../protocol/powit/v0/POWIT_V0_SPEC.md); [v0 TYPES](../../protocol/powit/v0/POWIT_V0_TYPES.md); [v0 vectors](../../protocol/powit/v0/POWIT_V0_TEST_VECTORS.md); [ADR-006](ADR-006-powit-v0-semantic-freeze.md)
Supersedes: ADR-006 readiness statement that B01-B04 block initial finalization; no unrelated decision

## Context

ADR-006 intentionally froze supported structure while leaving four policy gates open. The follow-on project decision explicitly selects an initial reducer, abstention boundary, relationship rule, sufficiency operators, event-scoped uniqueness input, authoritative intake order/time, qualification-defect treatment and a deterministic replay bundle. Corrections and evidence-authentication decisions remain outside this profile.

## Decision

Resolve B01-B04 for initial finalization as specified in the v0 documents:

- An Observation is a meaningful admitted structured report. A schema's explicit abstention marker yields an auditable RevealRecord and no Observation; `false` remains a meaningful negative report unless exactly marked as abstention.
- EXACT_MATCH is the only v0 reducer. The schema selects a material path; JCS bytes define equality. Preserve every distinct value and count, with no winner.
- CLAIM_VALUE_EQUALITY derives pairwise relations from verified, relevant-time, conflict-free canonical claim values. Missing or conflicting knowledge remains UNKNOWN. No connected-component inference or missing-edge independence.
- Sufficiency is a nonempty ordered conjunction of MIN_ACCEPTED_OBSERVATIONS and MIN_DISTINCT_VERIFIED_VALUES, each threshold at least one. Unknown/conflicted values do not count.
- PoWit consumes an opaque event-scoped uniqueness assertion, enforcing one token per Event. Provider cryptography and human uniqueness derivation remain upstream.
- The execution environment assigns authoritative time and contiguous per-Event sequence to accepted and rejected actions. Client timestamps do not admit actions. Pre-finalization qualification defects exclude contributions while preserving the complete record history.
- A canonical ReplayBundle carries the exact schema/policies, lifecycle, uniqueness assertions, participations, snapshots, commitments, reveals, intake decisions, disqualifications and claimed outputs. Independent replay recomputes and compares outputs before accepting an Attestation.

## Alternatives considered

Keeping B01-B04 open would prevent an initial kernel implementation. Selecting additional reducers or automatic correlation scoring would exceed the given decisions and add arbitrary epistemic policy. Making human uniqueness a PoWit cryptographic mechanism would entangle the primitive with an unresolved identity system. Trusting cached graph/evaluation fields would weaken independent replay.

## Consequences

An independent implementation can build the initial-finalization kernel against this profile without selecting epistemic rules. It consumes trusted provider assertions and verified-claim results; it does not prove that a person is globally unique or that an issuer's fact is true. B05 is required for corrections/supersession. B06 is required if evidence authentication is enabled. Deployment still chooses provider roots, transport authentication, clock service, resource/access controls and operational security.

The E2E vector corpus supplies complete five-participant inputs and exact Attestation hashes for CONCORDANT, SPLIT and THIN, plus a complete SILENT case. Edge mutations exercise duplicates, abstention, negative reports, missing/conflicted claims, UNKNOWN, timestamps, order and pre-finalization disqualification. No runtime or application code is introduced.

## Risks / tradeoffs

EXACT_MATCH handles only exact canonical agreement; measurement tolerance or richer tallies require a later profile. Verified claim values expose relation metadata to replay verifiers. Flat complete relation graphs grow quadratically. A trusted upstream provider can issue false uniqueness assertions, and the kernel cannot detect prior human coordination. Full replay requires access to protected inputs.

## Reconsider if

Interoperability vectors reveal incompatible policy output, a valid use case requires a new reducer or sufficiency operator, or a later privacy profile needs different claim disclosure. Such a change requires a versioned decision and cannot rewrite existing Attestations.

## Provenance

Authority: the user's explicit “RESOLVE THE FOUR IMPLEMENTATION-BLOCKING POLICY QUESTIONS” request applied to base commit `9588a301b2bf82894d8095a88ddf287dfc2a5a5b`.
