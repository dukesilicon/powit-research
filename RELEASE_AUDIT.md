# Research release audit

26 November 2026 · Dedicated PoWit research snapshot

## Inclusion boundary

The release preserves 25 selected original files byte for byte: kernel source/tests, wire types, four v0 specification documents, terminology, governance, canonical lifecycle and ADR-001 through ADR-008. SOURCE_MANIFEST.json records their hashes. It adds reproduction scripts, four synthetic Records, research documentation, execution evidence and license files. Nine clearly labelled scope notes resolve 22 references to intentionally omitted parent-repository context without changing the original source or pretending that those notes are canonical documents.

The release excludes the parent Git history, website, participant app, runtime deployment, private stores/manifests, actual participant data, credentials, environment files, acquired media, source conversations, private funding correspondence and paused assurance work. Only the explicit release file list enters the dedicated repository. No third-party dependency binaries or artwork are bundled.

## Audit results

- All 25 original source hashes match the earlier manifest and current parent source. The four frozen v0 definitions are unchanged.
- No unresolved local Markdown file or heading links remain. Context notes are explicitly enumerated in SOURCE_LINKS.json; they do not claim to contain the omitted originals. External license URLs were retrieved successfully; every historical external standards link was not independently availability-tested.
- Scans found no private-key blocks, common provider tokens, JWT-like credentials, email addresses or local user paths in release material. Forbidden credential/configuration/store paths and unexpected source files were checked against the allowlist.
- Original fixture salts, opaque tokens, issuer identifiers and digests are intentionally disclosed synthetic test data, not live credentials. Runtime test logs contain results rather than protected openings.
- No incompatible third-party license notice was detected in selected source. No preexisting license/attribution notice was removed. The official Apache 2.0 and CC BY 4.0 texts are bundled unmodified with source URLs and byte hashes recorded in the audit data.
- The founder explicitly confirmed authority and absence of incompatible third-party rights for this included snapshot on 26 November. This audit does not independently establish chain of title or the absence of every possible secret.

Machine-readable results are in [RELEASE_AUDIT.json](RELEASE_AUDIT.json). [RELEASE_MANIFEST.json](RELEASE_MANIFEST.json) is the exact file/hash inventory, excluding itself to avoid circular hashing. It is an integrity manifest, not a digital signature.

## Verification and preserved limits

The November 26 standalone run passed 53 tests with no skips; all four exported Records reconstruct and replay, and altered output claims are rejected. See [RELEASE_VERIFICATION.md](RELEASE_VERIFICATION.md). The November 24 broader 94-test result retains its original date and scope. No new field, production, B06 authentication, personhood or epistemic-superiority result is claimed.

All three documented parent specification-validator failures remain in the engineering report and original logs. The old 24 November candidate is preserved in the private preparation archive, including its earlier undecided-license status. Current terms and scope are in [LICENSE.md](LICENSE.md).

The release is prepared for a dedicated GitHub repository, not a publication of the broader THOTH project. GitHub access and visibility are recorded in the external handoff, so a local audit is not mistaken for proof of public availability.
