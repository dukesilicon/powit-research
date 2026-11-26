# Document governance

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-17
Depends on: [terminology](terminology.md)
Supersedes: None; historical revisions remain in Git

## Purpose

Define enforceable metadata, authority and change discipline.

## CANONICAL

Every active major specification document begins with the metadata convention below, immediately after its title. Dependencies use relative Markdown links. Status is exactly CANONICAL, PROVISIONAL or OPEN QUESTION.

```text
Status: CANONICAL
Version: v0
Last reviewed: YYYY-MM-DD
Depends on: [Terminology](terminology.md)
Supersedes: None
```

Version identifies the semantic baseline, not a claim that every current file equals the frozen snapshot. A document revision may occur within v0. Last reviewed records actual review; never fabricate a historical review date. Use 'Not recorded' for an imported historical document that has not been reviewed.

The header classifies the governing proposition of the document. Explicit CANONICAL, PROVISIONAL and OPEN QUESTION sections classify individual claims and override that broad classification; a CANONICAL header never promotes a provisional subsection. ADR Context/Decision/Consequences describe the stated decision status; speculative mechanisms must remain marked.

Terminology owns definitions; topic pages own specialized semantics; invariants own cross-layer constraints; ADRs record rationale; the research register owns unresolved issue identifiers. STATUS.md is an index, not another semantic authority. Current explicit project decisions can supersede earlier prose but must be recorded with impact and provenance.

Change procedure:

1. Identify affected terms, invariants, schemas, examples and consumers.
2. Mark the proposal provisional and link open questions; record rationale in an ADR for consequential choices.
3. Obtain explicit acceptance from the project decision authority and record that evidence. This pass does not invent a committee or voting threshold.
4. Classify version impact, update dependent documents and the status index, and keep historical snapshots intact.
5. Run the documentation validator and review semantic boundaries before committing.

Supersedes identifies a replaced document/decision or exact prior revision. A routine edit does not claim to supersede the entire protocol. Frozen versions/v0 files, the source-capture manifest and the historical website spec are archival exceptions: do not retrofit current review dates or headers into them. Their classification is explicit in STATUS.md.

## PROVISIONAL

Future governance may introduce formal reviewers or approval thresholds, but none are specified yet. Structural validation can catch drift signals; it cannot establish cryptographic security or semantic correctness.

## OPEN QUESTION

Q15: Define formal authority and review processes. Q14: Define independent audit requirements. Unresolved issues need a question ID, owning document, current status and evidence required to close them.
