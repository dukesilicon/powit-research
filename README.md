# Proof of Witness

Proof of Witness (PoWit) is a protocol for producing an inspectable record of event-scoped observations, qualification decisions, relationships and disagreements. Its reference kernel binds committed and revealed reports to a reproducible Attestation. It verifies how the protocol record was formed; it does not establish objective truth, prove human uniqueness or eliminate collusion.

PoWit is the primitive beneath THOTH, the company and prospective human-provenance network. Applications specialize the protocol; VoteLedger is the first application, not the parent architecture.

This dedicated research repository contains the initial-finalization kernel, frozen specifications, tests, synthetic Records and research documentation. It intentionally excludes the broader THOTH codebase, private data, website, operational service and deployment credentials.

## Start here

- [Technical publication](PUBLICATION.md): the problem, architecture, results and scientific questions.
- [Verified engineering report](VERIFIED_ENGINEERING.md): exact commands, coverage and preserved failures.
- [Complete synthetic SPLIT Record](examples/SPLIT.json) and [all four example Records](examples/INDEX.json).
- [Reproduction instructions](#reproduce-the-results).
- [Known limitations](KNOWN_LIMITATIONS.md).
- [Research programme and funding options](PROGRAMME.md).
- [Release audit](RELEASE_AUDIT.md) and [November 26 standalone verification](RELEASE_VERIFICATION.md).

## What has been verified

On **24 November 2026**, the broader local workspace passed 94 rebuilt tests: 53 kernel, 36 runtime, two settlement and three adapter tests, with no skips. That is historical engineering evidence, not a claim that all four packages are included here. This repository includes the 53 kernel tests and full synthetic inputs for CONCORDANT, SPLIT, THIN and SILENT.

On **26 November 2026**, the standalone kernel suite and four Record reconstructions/replays were rerun for this release; results are recorded in [release verification](RELEASE_VERIFICATION.md). The full parent repository's three documentation-validator errors remain disclosed. No production readiness, real human Witness Event, public chain transaction, completed evidence-authentication workflow or demonstrated epistemic improvement is claimed.

## Reproduce the results

Requirements: Node.js **24 or later**. pnpm is convenient but optional. No dependency installation, service, account, wallet, key or network request is needed.

From this repository root:

```sh
node --experimental-strip-types packages/powit-core/test/core.test.ts
node --experimental-strip-types scripts/verify-records.mjs
node scripts/verify-files.mjs
```

Equivalent commands are `pnpm test`, `pnpm verify` and `pnpm verify:files`. The tested environment used Node 24.18.0 and pnpm 11.25.0; workspace runner overrides used for the original execution appear in the report.

Expected: **53 passing tests**, **four valid Records**, altered claims rejected, and all manifest-listed files matching SHA-256. The Record verifier reconstructs sessions from the retained action journal, replays the serialized bundles, and compares Attestations and hashes. It does not trust the saved verification flag. Producer and verifier use the same reference implementation; this is not a second implementation or external audit.

The runtime uses Node's TypeScript type erasure. Type-only package imports disappear; executable imports are local files or Node built-ins. This standalone suite does not typecheck; the five-package TypeScript checks in the engineering report were run in the parent workspace on November 24.

## Read the outcomes carefully

| State | Meaning |
| --- | --- |
| CONCORDANT | Admitted reports converge and meet the declared sufficiency policy. Agreement does not establish truth. |
| SPLIT | Admitted reports differ despite sufficient declared witness structure. There is no majority winner. |
| THIN | Reports were admitted, but the declared witness structure is insufficient. |
| SILENT | No Observation was admitted. This does not establish non-occurrence. |

All included Records are **synthetic fixtures**, not real human witnessing. The SPLIT example preserves three affirmative and two negative reports; its hash is `c19c1ac53ea15f279e4fe5d2f8a537c8aafc61b0d56b65e92e31927cea3dc34d`. Settlement remains UNSUBMITTED.

## Specification and provenance

The [v0 specification](protocol/powit/v0/POWIT_V0_SPEC.md), [wire types](protocol/powit/v0/POWIT_V0_TYPES.md), [vectors](protocol/powit/v0/POWIT_V0_TEST_VECTORS.md) and [readiness register](protocol/powit/v0/POWIT_V0_OPEN_QUESTIONS.md) are preserved byte for byte. B05 corrections and B06 evidence authentication remain unsupported. Upstream personhood/claim providers remain trust boundaries; the development runtime is not blind to reports before reveal.

[SOURCE_MANIFEST.json](SOURCE_MANIFEST.json) identifies the copied source bytes from the dirty parent checkout. [RELEASE_MANIFEST.json](RELEASE_MANIFEST.json) identifies this release's files. These hashes detect changes; they are not publisher signatures. Context references intentionally outside the selected snapshot lead to explicit release-scope notes listed in [SOURCE_LINKS.json](SOURCE_LINKS.json), rather than silently importing unrelated THOTH material.

## Research funding

The current Epistemics Fund request is **$25,000 for three months**, with **$15,000 as a viable reduced-scope option** and **$0 existing funding**. The programme proceeds from engineering verification and an independently inspectable Record to one bounded consented Witness Event, operational/adversarial iteration, then comparative epistemic evaluation when operationally ready. Human Passport is a parallel strategic priority outside this application. Funding would support empirical validation, not imply that the preexisting engineering was produced by the grant.

## Licenses

Code is licensed under [Apache 2.0](LICENSES/Apache-2.0.txt). Specifications and research documentation are licensed under [CC BY 4.0](LICENSES/CC-BY-4.0.txt). See [LICENSE.md](LICENSE.md) for the exact file scopes and [NOTICE](NOTICE) for attribution. The founder confirmed authority to release the included research snapshot on 26 November 2026. This does not license excluded THOTH material or imply independent verification of ownership history.
