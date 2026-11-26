# Canonical lifecycle

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [terminology](../overview/terminology.md); [document-governance](../overview/document-governance.md)
Supersedes: None; historical revisions remain in Git

## Purpose

**v0 authority update (2026-09-22):** [The normative kernel specification](../powit/v0/POWIT_V0_SPEC.md) supersedes the earlier seed statements below where they differ. Its core objects, Event states, accepted-Observation rules, event uniqueness and classifier precedence are frozen; its named policy gates remain open. The older PUBLIC SETTLEMENT sequence describes formation plus delivery, not EventState or a prerequisite for epistemic classification. Historical proposals below are not independent v0 implementation choices.


Own the exact lifecycle wording reused elsewhere.

## CANONICAL

EVENT → ELIGIBLE WITNESSES → OBSERVE → COMMIT → REVEAL → CORRELATION ANALYSIS → AGGREGATION → ATTESTATION → PUBLIC SETTLEMENT

The sequence spans formation and delivery of a witnessing record. PoWit remains chain-independent. Correlation is separate from identity proofs and precedes aggregation; public settlement does not imply objective truth.

## PROVISIONAL

A future execution model may support retries, incomplete events and linked revisions while preserving the responsibilities of these stages.

## OPEN QUESTION

TODO: Q09: Define guards and incomplete paths. Q11: Define what constitutes public settlement in a concrete adapter.

## Related references

- [Specification overview](../overview/README.md)
- [Research register](../research/open-questions.md)
