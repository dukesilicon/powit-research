# Standalone release verification

Executed 26 November 2026, Africa/Lagos. Node 24.18.0; pnpm 11.25.0. No dependency install, feature changes or protocol edits.

The commands ran from the parent workspace using:

```text
pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false --dir docs/funding/epistemics-technical-2026-11-24/research-snapshot test
pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false --dir docs/funding/epistemics-technical-2026-11-24/research-snapshot verify
```

| Check | Result |
| --- | --- |
| Standalone kernel tests | Exit 0; 53 pass, 0 fail, 0 skip |
| Exported Record verification | Exit 0; all four reconstruct and replay; modified Attestation and claimed state rejected for each |
| Copied original source | 25 files byte-identical to recorded source; frozen definitions unchanged |
| File integrity | Every manifest-listed file verified before packaging and commit |

[Kernel execution log](evidence/2026-11-26/core.log) · [Record execution log](evidence/2026-11-26/records.log)

The four hashes remain:

| State | Attestation SHA-256 |
| --- | --- |
| CONCORDANT | `0088e00e861fe6cfb65b5f91881aa583f7b5204708241c73b9015f03ff0293ee` |
| SPLIT | `c19c1ac53ea15f279e4fe5d2f8a537c8aafc61b0d56b65e92e31927cea3dc34d` |
| THIN | `758652a08d992811631734eb45208569cfc2f8ea24c2b40d84af40f5f5e1d718` |
| SILENT | `8a88efede531fac29d7957c5e0b23cb914156ebf22ab39b0422dc5f2ee4d7d76` |

These are synthetic fixtures, not field events. Producer and verifier share the reference kernel. The broader runtime/settlement/adapter tests, typechecks and specification validator were not rerun today: their November 24 results, including all three validator errors, remain in [VERIFIED_ENGINEERING.md](VERIFIED_ENGINEERING.md). This release recheck adds packaging confidence, not new scientific or production assurance.
