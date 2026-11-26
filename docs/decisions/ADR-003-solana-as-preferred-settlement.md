# ADR-003: Solana as preferred settlement

Status: PROVISIONAL
Version: v0
Last reviewed: 2026-09-17
Depends on: [terminology](../../protocol/overview/terminology.md); [document-governance](../../protocol/overview/document-governance.md)
Supersedes: None; historical revisions remain in Git

## Context

The current documents name Solana as the preferred settlement direction while requiring chain-independent PoWit semantics.

## Decision

Retain Solana as the current preferred implementation target. Do not embed its account layout or transaction types in generic PoWit semantics. This is a revisable preference, not a completed integration or permanent chain requirement.

## Alternatives considered

No documented comparative chain evaluation is available. This record does not invent alternatives, benchmarks or selection history.

## Consequences

Settlement work can investigate a Solana adapter; generic attestations and provenance remain meaningful without it.

## Risks / tradeoffs

Availability, authority, finality, upgrade behavior, fees and storage policy still need evaluation; a prototype may accidentally leak chain-specific details upward.

## Reconsider if

Evidence shows the target cannot meet accepted delivery, availability or privacy requirements, or an explicit project decision changes the preference.

## Provenance and unresolved work

Recorded during the 2026-09-17 governance pass from [existing specification](../../protocol/powit/settlement/solana.md) and the explicit governance request. The original decision date and any unrecorded historical debate are unknown. This ADR records the direction at its stated status; it does not retrospectively claim an audit or implementation.

See [open questions](../../protocol/research/open-questions.md) for unselected mechanisms and [version policy](../../protocol/versions/README.md) for changes. A later contrary decision requires a linked superseding ADR; never erase this record's prior committed version.
