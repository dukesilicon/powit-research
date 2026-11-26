# ADR-005: Independence versus reputation

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-17
Depends on: [terminology](../../protocol/overview/terminology.md); [document-governance](../../protocol/overview/document-governance.md)
Supersedes: None; historical revisions remain in Git

## Context

The specification describes independence as relational and event-specific, reputation as historical and persistent; both are contextual.

## Decision

Keep independence and reputation distinct concepts and assessment bases. Historical standing must not replace evidence about current observation dependencies.

## Alternatives considered

One combined universal trust score is rejected by the current principles. No detailed historical scoring experiments are documented.

## Consequences

Aggregation proposals must explain separately how history and current dependencies affect interpretation.

## Risks / tradeoffs

History can itself be biased or derived from circular agreement; hidden relationships remain difficult to detect.

## Reconsider if

New evidence motivates a different representation while retaining the distinct semantics; any proposed merger needs explicit reconsideration, not implementation convenience.

## Provenance and unresolved work

Recorded during the 2026-09-17 governance pass from [existing specification](../../protocol/powit/reputation/reputation-vs-independence.md) and the explicit governance request. The original decision date and any unrecorded historical debate are unknown. This ADR records the direction at its stated status; it does not retrospectively claim an audit or implementation.

See [open questions](../../protocol/research/open-questions.md) for unselected mechanisms and [version policy](../../protocol/versions/README.md) for changes. A later contrary decision requires a linked superseding ADR; never erase this record's prior committed version.
