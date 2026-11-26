# ADR-001: PoWit / Thoth separation

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-17
Depends on: [terminology](../../protocol/overview/terminology.md); [document-governance](../../protocol/overview/document-governance.md)
Supersedes: None; historical revisions remain in Git

## Context

The hierarchy separates a generic witnessing primitive from reusable infrastructure and downstream applications.

## Decision

Keep PoWit generic and chain-independent. Thoth supplies reusable network, infrastructure, application and economic facilities. Applications specialize schemas; VoteLedger is removable without breaking generic types.

## Alternatives considered

Application-first coupling and treating PoWit as Thoth are rejected by the explicit hierarchy. No detailed historical option evaluation is available.

## Consequences

Generic documents and types cannot require application credentials, identifiers or fields. Application mappings remain downstream.

## Risks / tradeoffs

Maintaining explicit interfaces requires care and may initially leave more fields unresolved.

## Reconsider if

New accepted requirements demonstrate a genuine generic dependency; preserve the deletion test and record a superseding ADR.

## Provenance and unresolved work

Recorded during the 2026-09-17 governance pass from [existing specification](../../protocol/overview/conceptual-hierarchy.md) and the explicit governance request. The original decision date and any unrecorded historical debate are unknown. This ADR records the direction at its stated status; it does not retrospectively claim an audit or implementation.

See [open questions](../../protocol/research/open-questions.md) for unselected mechanisms and [version policy](../../protocol/versions/README.md) for changes. A later contrary decision requires a linked superseding ADR; never erase this record's prior committed version.
