# Verified engineering status

24 November 2026 · Local research evidence · No production-readiness or field-validation claim

## Result and source scope

**94 tests passed after forced dependency rebuilds: 53 core, 36 runtime, two settlement and three Solana adapter tests. None failed or skipped.** Five package typechecks and repository boundary checking passed. The exported snapshot separately passed its 53 kernel tests and all four Record reconstructions/replays, including rejection of altered Attestations and claimed states. The full specification validation failed with three documentation errors described below.

Tested primary source: branch `codex/witnessing-chamber`, HEAD `6298f49aa4128e51edd44e8dac6457e72e1e8c8a`, **101 preexisting dirty paths**. The included source manifest identifies the actual copied bytes; this is not a clean-commit claim. The separately inspected homepage worktree was `codex/thoth-record-continuation`, HEAD `7db1d133d145393b4912171cd784f6bcc24f5ee2`, with 104 dirty paths. No homepage code, design or performance test was part of this commission.

Node 24.18.0; pnpm 11.25.0; existing installed TypeScript toolchain. No new dependencies installed. The repository declares pnpm 11.19.0; the available runner was used with explicit management overrides. The publication date is Africa/Lagos. Exact original command records and baseline hashes remain in the private preparation dossier; release-safe execution logs are in [evidence](evidence/RESULTS.json).

## Commands and outcomes

All original-workspace pnpm commands used the prefix `pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false` from the repository root. The filter commands execute their package's declared script.

| Command after that prefix | Actual result | Evidence |
| --- | --- | --- |
| `check:boundaries` | Exit 0 | [Log](evidence/boundaries.log) |
| `check:spec` | Exit 1 before validator execution: configured Python launcher could not execute | [Initial failure](evidence/spec.log) |
| `--filter @thoth/powit-core test` | 53 pass, 0 fail, 0 skip | [Log](evidence/core.log) |
| `--filter @thoth/runtime test` | 36 pass, 0 fail, 0 skip | [Log](evidence/runtime.log) |
| `--filter @thoth/settlement test` | 2 pass, 0 fail, 0 skip | [Log](evidence/settlement.log) |
| `--filter @thoth/solana test` | 3 pass, 0 fail, 0 skip | [Log](evidence/solana-adapter.log) |
| `--filter @thoth/powit-types --filter @thoth/powit-core --filter @thoth/runtime --filter @thoth/settlement --filter @thoth/solana typecheck` | Exit 0, all five packages | [Log](evidence/typecheck.log) |
| `exec turbo run test --force --filter=@thoth/powit-core --filter=@thoth/runtime --filter=@thoth/settlement --filter=@thoth/solana` | Exit 0; 8 successful tasks, 0 cached; fresh dependency builds and all 94 tests | [Authoritative rebuilt run](evidence/rebuilt-e2e.log) |

The direct package tests preceded the rebuild and could have consumed earlier compiled dependencies. The forced rebuild/test run is the controlling result for the combined engineering claim; both sets of logs are retained without double-counting tests.

Using the available bundled Python executable, `scripts/validate_spec.py` then ran and reported 109 active documents, 25 required terms, 79 historical hashes, 25 source files checked, none absent, and **three errors**. [Executed validator output](evidence/spec-bundled-python.log)

Snapshot commands, with the same pnpm prefix and `--dir docs/funding/epistemics-technical-2026-11-24/research-snapshot`, were `test` and `verify`. Both exited 0. These are separate packaging checks, not additional unique protocol-test coverage. [Kernel result](evidence/snapshot-core.log), [Record result](evidence/snapshot-records.log)

## Requested capability coverage

| Capability | Existing implementation and fresh check | Limit |
| --- | --- | --- |
| Event lifecycle | Guarded activation/cancellation; input freeze; retry identity; late-intake rejection; core E1 and runtime finalization-boundary tests | Operator time and authority are trusted; no distributed consensus proof |
| Participation and qualification | Token reuse and duplicate commitment rejection; immutable snapshots; prospective revocation; pre-freeze disqualification | Fixture/development providers do not prove personhood, physical presence or truthful affiliation |
| Commitment and revelation | Window checks; salt/payload binding; incorrect opening retry; malformed metadata atomicity | Runtime receives plaintext report/salt before reveal; no guarantee of independent production |
| Observation admission | Invalid report, abstention and meaningful negative report remain distinct; exclusion retains history | Schema appropriateness is not established by passing validation |
| Attestation generation | Five-participant session; immutable canonical outputs; accepted-set and derived-output digests | Same implementation is producer and replay reference |
| Disagreement and insufficient evidence | Four frozen E2E states; UNKNOWN and conflicting claims; THIN precedence; EXACT_MATCH retains distinct values | No universal independence or truth probability; agreement is not objective truth |
| Evidence provenance | H01–H20 canonical representations; raw byte hashing; null/empty-manifest commitment distinction; media transport integrity/access regressions | **Partial only**. B06 authentication and evidence admission remain disabled; media tests are synthetic fixtures, not authenticated field footage |
| Deterministic replay | Full journal reexecution, restart preservation, altered input/output rejection; four exported Record checks | Protected inputs must be available; not a separately authored verifier or external audit |
| Settlement boundary | Eight-field record binding, restricted-material verification, adapter binary/PDA/tamper tests | No new validator/on-chain execution; UNSUBMITTED examples |

## Preserved failures and limits

The validator's exact errors were:

```text
docs/decisions/README.md: broken link ../../../Bright%20Workspace/STATE_HANDOFF.md
protocol/research/assurance/EXISTING_STATE.md: missing from STATUS.md
protocol/research/assurance/EXISTING_STATE.md: broken link ../../../research/assurance/evidence/baseline.json
```

The handoff file exists and was read; its encoded-space link is reported broken by this validator. The paused assurance assessment and missing baseline reference predate this commission. None was silently rewritten, indexed as accepted specification, or reported as a passing check. The research candidate omits that paused work and the operational ADR index; the full-repository errors still remain part of the engineering status.

A new export helper initially used an incorrect relative import and failed with `ERR_MODULE_NOT_FOUND` before generating any Records. Only the helper path was corrected, then all four existing demonstration outputs were generated and independently checked. This preparation error was not a kernel defect. An initial search also referenced nonexistent `protocol/vectors` and `tsconfig.base.json`; actual vectors and per-package configs were subsequently located. Chat retrieval rejected requests above its 10-turn limit; successful bounded excerpts did not recover the original strategy file. These unsuccessful discovery steps supplied no validation evidence.

No local-validator, public-chain, browser, physical-device, load, human-participant, provenance-authentication or comparative epistemic run occurred. No new Lean/Bend assurance work was resumed. Existing source was not repaired to make tests pass.

## Earlier work and artifact recovery

The September v0 documents and ADR-006/007 define the frozen profile; ADR-008 defines settlement/availability. The current repository also contains runtime orchestration, protected replay storage, Chamber demonstrations, participant UI and a Rust settlement program. Architecture and October handovers establish their historical scope, not current public delivery.

The October 14 checkpoint reports core/runtime boundary repairs and its dated test results. The October 21 integration report records local HTTP delivery and four downloaded synthetic Records. Existing October 20/21 synthetic JSON downloads and private Chamber stores were located. The newly generated examples avoid copying visitor records or protected stores into a public candidate. Their canonical identities reproduce the existing frozen E2E vectors.

The founder identifies the October 27 strategy file and explicitly restated its objective and five-stage sequence in this commission. Original file bytes remain unrecovered; the latest founder clarification, not an invented archive, supplies the application's governing scope.

## Milestone contribution

This session refreshes bounded L01 engineering evidence and supplies inspectable local artifacts supporting L07 reproducible outcomes. It does not close either entire launch gate, founder visual acceptance, accepted-media delivery, public hosting or L09 release. The funding application can use the accomplishments paragraph now without waiting for a public GitHub repository, provided it describes this as a locally verified research candidate and uses only links actually accessible to its evaluator.
