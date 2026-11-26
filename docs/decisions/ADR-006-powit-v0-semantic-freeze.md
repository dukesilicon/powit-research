# ADR-006: PoWit v0 semantic and wire-format freeze

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [v0 SPEC](../../protocol/powit/v0/POWIT_V0_SPEC.md); [v0 TYPES](../../protocol/powit/v0/POWIT_V0_TYPES.md); [governance](../../protocol/overview/document-governance.md)
Supersedes: ADR-004's unresolved state-precedence boundary and earlier provisional object/encoding directions, only as enumerated below

## Context

The explicit 2026-09-22 specification-freeze request supplies decisions that were open in the September 17 seeds. No later deliberate normative repository decision was found at inspected HEAD 7802286. Existing applications and frontend implementations are not semantic authorities.

## Decision

Freeze the supplied v0 semantics in [SPEC](../../protocol/powit/v0/POWIT_V0_SPEC.md), the exact representation decisions in [TYPES](../../protocol/powit/v0/POWIT_V0_TYPES.md), and their scoped [vectors](../../protocol/powit/v0/POWIT_V0_TEST_VECTORS.md). Keep missing executable policy decisions as explicit implementation gates in [OPEN_QUESTIONS](../../protocol/powit/v0/POWIT_V0_OPEN_QUESTIONS.md).

This supersedes the older open THIN/SILENT boundary and state precedence; candidate Witness / Identity object grouping; unresolved event-scoped participation/observation cardinalities; multi-action uniqueness scope as a v0 option; and suggestions of automatic correlation weighting. It adds the five Event states, immutable qualification/commitment handling, evidence-specific Authenticator and accepted-Observation semantics. Retain ADR-004's disagreement principle. Public settlement remains the broader formation/delivery lifecycle's last stage, not an Event state or condition for computing epistemic state.

Under the request to freeze exact formats, select JCS/SHA-256 with an integer-restricted JSON profile, explicit NUL-delimited domains, lowercase digests, half-open millisecond windows, opaque scoped IDs, explicit nulls, complete pairwise relation records and flat sorted-array set hashes. No Merkle tree or automatic clustering rule is selected. Authentication results are PASS/FAIL/INDETERMINATE; role eligibility/diversity is still open. These are new documented format decisions, not invented historical decisions.

## Alternatives considered

Leaving canonical bytes undefined would prevent independent hash reproduction. Concatenating unframed strings would be ambiguous. Merkle trees would add unrequested tree/proof choices; full-data flat digests suffice for this representation. Inventing the candidate reducers or relation rules would contradict the task's explicit restraint. No comparative benchmark or cryptographic audit is claimed.

## Consequences

The four v0 documents govern the kernel where earlier seeds differ. Terminology and entry points identify this scope; old Git history and frozen `protocol/versions/v0` remain unchanged. This is a **semantic freeze with open policy gates**, not merely a wording revision and not an implementation-ready release. The old design snapshot labeled v0 and the new `powit-v0` wire profile are distinct artifacts.

The envelope and codec vectors are implementable, but B01-B04 must close before a complete first-finalization kernel begins. B05/B06 gate optional correction/authentication capabilities. No runtime, app, package, chain or wallet code is introduced.

## Risks / tradeoffs

Complete pairwise graphs grow quadratically; profile limits remain a required deployment decision. Integer-only JSON requires schema-defined strings for decimals. Plain hashes can reveal low-entropy private data through guessing. Policy references without their definitions cannot support replay. Flat set digests do not supply efficient membership proofs. Codec fixtures do not establish epistemic correctness.

## Reconsider if

Interoperability vectors reveal a byte mismatch, accepted policy requirements cannot fit the frozen envelopes, or a later profile needs different representation/scale. Record a versioned compatibility decision and preserve prior bytes; never silently reinterpret an ACTIVE Event or existing Attestation.

## Provenance

Authority: the user's explicit “POWIT V0 — FREEZE THE NORMATIVE PROTOCOL SPECIFICATION” request, applied against HEAD 7802286. The prior context handoff is consistent, but this decision does not require conversational memory. Technical serialization reference: [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785). [The conflict/readiness register](../../protocol/powit/v0/POWIT_V0_OPEN_QUESTIONS.md) records inspected sources, exact supersessions and open questions.
