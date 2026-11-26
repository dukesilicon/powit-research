# ADR-004: Disagreement preservation

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [terminology](../../protocol/overview/terminology.md); [document-governance](../../protocol/overview/document-governance.md)
Supersedes: None; historical revisions remain in Git

## Context

The state-boundary/precedence deferrals in this record are superseded by [ADR-006](ADR-006-powit-v0-semantic-freeze.md). The disagreement-preservation decision remains in force; historical wording below records its original scope.

Witnesses are imperfect sensors and observations can differ materially even with valid credentials.

## Decision

Preserve conflicting observations and their assessment basis. Keep CONCORDANT, SPLIT, THIN and SILENT; do not infer non-occurrence from SILENT. No conflict threshold or precedence rule is selected.

## Alternatives considered

Forced binary resolution or silent majority collapse conflicts with the current specification. Historical debates and quantitative comparisons are not documented.

## Consequences

Attestation and settlement must retain disagreement and limitations. Claim-level assessments may be useful but their record shape remains provisional.

## Risks / tradeoffs

Preserving conflict can defer downstream action; sparse disagreement and the THIN/SILENT boundary remain unresolved.

## Reconsider if

A proposed representational change preserves the same evidential distinctions and is explicitly reviewed; convenience alone is insufficient.

## Provenance and unresolved work

Recorded during the 2026-09-17 governance pass from [existing specification](../../protocol/powit/epistemic-states.md) and the explicit governance request. The original decision date and any unrecorded historical debate are unknown. This ADR records the direction at its stated status; it does not retrospectively claim an audit or implementation.

See [open questions](../../protocol/research/open-questions.md) for unselected mechanisms and [version policy](../../protocol/versions/README.md) for changes. A later contrary decision requires a linked superseding ADR; never erase this record's prior committed version.
