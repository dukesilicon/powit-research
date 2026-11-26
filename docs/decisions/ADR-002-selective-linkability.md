# ADR-002: Selective linkability

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-17
Depends on: [terminology](../../protocol/overview/terminology.md); [document-governance](../../protocol/overview/document-governance.md)
Supersedes: None; historical revisions remain in Git

## Context

Private identity, cross-event analysis and persistent reputation have competing disclosure needs.

## Decision

Adopt selective linkability as the architectural direction: persistent private identity/reputation with scoped representations and minimum permitted linkage. No proof construction or opening mechanism is accepted by this ADR.

## Alternatives considered

Total public traceability and total unlinkability are the contrasting design directions described in the research notes. Detailed historical comparative evaluation is not recorded.

## Consequences

Scope, consent/authorization, reputation continuity and metadata exposure need explicit specifications. ZK is not an independence proof.

## Risks / tradeoffs

Overbroad scopes and powerful correlation authorities can expose unrelated history; weak linkage can limit abuse detection.

## Reconsider if

A threat analysis or proposed construction cannot meet the declared disclosure boundaries, or a changed use case requires different linkage.

## Provenance and unresolved work

Recorded during the 2026-09-17 governance pass from [existing specification](../../protocol/powit/identity/selective-linkability.md) and the explicit governance request. The original decision date and any unrecorded historical debate are unknown. This ADR records the direction at its stated status; it does not retrospectively claim an audit or implementation.

See [open questions](../../protocol/research/open-questions.md) for unselected mechanisms and [version policy](../../protocol/versions/README.md) for changes. A later contrary decision requires a linked superseding ADR; never erase this record's prior committed version.
