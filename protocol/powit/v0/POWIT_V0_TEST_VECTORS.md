# PoWit v0 — conformance and byte vectors

Status: CANONICAL
Version: v0
Last reviewed: 2026-09-22
Depends on: [semantics](POWIT_V0_SPEC.md); [types](POWIT_V0_TYPES.md); [open questions](POWIT_V0_OPEN_QUESTIONS.md)
Supersedes: None; first explicitly scoped v0 vector set

## Purpose

Supply exact codec fixtures, conditional decision examples and complete deterministic ReplayBundle/Attestation vectors for the supported first-finalization profile. A hash matching this file is not evidence of physical truth or of upstream issuer honesty.

## CANONICAL

### V1-V4: classifier component vectors

These four small inputs isolate the classifier decision table. The full executable event fixtures follow under E2E-1 through E2E-4.

| Vector | Full classifier input | Exact expected state |
| --- | --- | --- |
| V1 CONCORDANT | admittedObservationIds=[w1,w2,w3,w4,w5]; sufficient=true; EXACT_MATCH=CONVERGENT | CONCORDANT |
| V2 SPLIT | admittedObservationIds=[w1,w2,w3,w4,w5]; sufficient=true; EXACT_MATCH=MATERIALLY_DIVIDED | SPLIT |
| V3 THIN | admittedObservationIds=[w1,w2,w3,w4,w5]; sufficient=false; EXACT_MATCH=CONVERGENT | THIN |
| V4 SILENT | admittedObservationIds=[]; sufficiency=false; aggregation not invoked | SILENT |

V3b changes only assessment to MATERIALLY_DIVIDED: still THIN. SILENT remains SILENT regardless of sufficiency because there are no admitted Observations; a valid schema's minimum requirements will in fact fail on the empty set. These small vectors fix precedence without replacing the full reducer executions below.

### Admission fixture and V5-V13

Use EventDefinition H03, candidate Observation H04, commitment H06, participation H07[0] and zero test salt. Before each independent vector, assume Event ACTIVE and a correctly authenticated scoped controller. The fixture qualification is:

```json
{
  "eventId": "event-1",
  "participationId": "w1",
  "schemaHash": "f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12",
  "policy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "evaluatedAt": 200,
  "relevantAt": 150,
  "claims": [],
  "eligible": true
}
```

H01 is a codec-only fixture and is not used by the full E2E vectors. The later fixtures pin supported policy definitions and their hash references.

| Vector | Complete change/action relative to fixture | Expected retained state and outcome |
| --- | --- | --- |
| V5 second commitment | H06 already accepted at 200; same controller resubmits H06 at 201 | Reject second commitment; exactly one original CommitmentRecord and snapshot; no mutation |
| V6 early reveal | H06 accepted at 200; reveal H04, null manifest, zero salt at 299 | Reject with REVEAL_WINDOW_NOT_OPEN; no RevealRecord/Observation; original commitment remains |
| V6b window boundary | Same reveal at 300 / at 400 in separate runs | At 300 timing permits verification; at 400 reject as late; acceptance at 300 still requires qualification/schema validation |
| V7 wrong salt | H06 accepted; reveal H04/null manifest at 300 with 32 bytes 0x01 (H15) | Opening mismatch; reject with COMMITMENT_OPENING_MISMATCH; no matching RevealRecord or Observation; retry with correct salt before 400 is not exhausted |
| V8 matching invalid report | Instead accept H17 at 200; reveal H16/null manifest with zero salt at 300 | Commitment matches; retain one INVALID_OBSERVATION RevealRecord with REPORT_NOT_OBJECT; no admitted Observation |
| V9 non-reveal | Accept H06 at 200; no reveal submitted; cutoff 400 | Commitment remains auditable; no RevealRecord/Observation; participant excluded from aggregation; classifier returns SILENT if this is the whole input |
| V10 prospective revocation | H06 and snapshot accepted at 200; ordinary issuer revocation at 250; correct reveal at 300; no event-time defect proven | Revocation alone cannot reject/remove reveal right; evaluate using preserved relevantAt=150 snapshot; final acceptance still depends on selected policies |
| V10b qualification defect | Same records, but listed authority proves invalidity at relevantAt=150 before cutoff / after cutoff | Before: exclude from finalization while preserving history. After: frozen inputs cannot mutate; correction requires B05 |
| V11 correlation failure | V1 classifier input except distinct organizations are not met | THIN despite convergence; no fractional vote weighting |
| V12 unknown relation | Pair (w1,w2), dimension=organization, status=UNKNOWN; diversity requirement fails | Never coerce to KNOWN_DISTINCT; meaningful reports yield THIN |
| V13 THIN precedence | Meaningful set [w1,w2]; sufficient=false; unanimous/CONVERGENT supplied result | THIN; agreement cannot repair insufficiency |

Further negative invariants: enrollment of the same underlying eligible human under a second witness class must not create a second participation (assurance fixture B04 required); ACTIVE cancellation after an accepted commitment remains forbidden even after disqualification; an invalid/missing signature cannot consume another person's slot; evidence's PASS result cannot create an Observation or establish occurrence; self-authentication is forbidden even across two account IDs.

### V14: immutable supersession

H13 is an exact wire-hash fixture. H14 changes only version to 2, supersedes to H13's actual hash and finalizingAt to 401. H13's canonical bytes and hash must remain unchanged. H14 must have its own distinct hash, same Event/schema binding, and predecessor version + 1. This fixes linkage/immutability only. A valid authorized correction, changed replay bundle and competing-successor behavior are **BLOCKED BY B05**. H14 is not permission to issue a correction.

### Exact hash fixtures H01-H20

Each entry supplies the full structured input, exact canonical JSON and expected lowercase hexadecimal digest. The exact preimage for every entry is ASCII(domain), one byte 00, then UTF-8 of the displayed canonical JSON **without the code-block newline**. Algorithm: SHA-256. Domain and string hex values remain literal strings as TYPES specifies. No omitted fields, ellipses or pseudo-hashes occur in these inputs.

H01 and its consumers are **wire-format fixtures only**, not a selected observation/relation/sufficiency/aggregation policy. H12 is not a replay bundle specification. Consequently H13/H14 prove Attestation hashing stability, not successful protocol execution. All referenced digests in H13/H14 are computed in the earlier entries; no all-zero stand-in hashes are used.

#### H01 — POWIT_V0_POLICY

A serialization fixture, not an accepted policy definition.

Full structured input:

```json
{
  "fixtureOnly": true,
  "note": "Not an executable policy"
}
```

Canonical JSON (one line):

```text
{"fixtureOnly":true,"note":"Not an executable policy"}
```

Expected SHA-256: `b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624`.

#### H02 — POWIT_V0_SCHEMA



Full structured input:

```json
{
  "protocolVersion": "powit-v0",
  "schemaId": "schema-1",
  "schemaVersion": "1",
  "observationSchema": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "witnessEligibilityPolicy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "requiredClaims": [],
  "relationPolicy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "relationalDiversityPolicy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "sufficiencyPolicy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "aggregationPolicy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "timingPolicy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "evidencePolicy": null,
  "authenticationPolicy": null,
  "challengePolicy": null
}
```

Canonical JSON (one line):

```text
{"aggregationPolicy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"authenticationPolicy":null,"challengePolicy":null,"evidencePolicy":null,"observationSchema":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"protocolVersion":"powit-v0","relationPolicy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"relationalDiversityPolicy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"requiredClaims":[],"schemaId":"schema-1","schemaVersion":"1","sufficiencyPolicy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"timingPolicy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"witnessEligibilityPolicy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"}}
```

Expected SHA-256: `f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12`.

#### H03 — POWIT_V0_EVENT



Full structured input:

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "event-1",
  "schemaId": "schema-1",
  "schemaVersion": "1",
  "schemaHash": "f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12",
  "windows": {
    "enrollmentOpensAt": 0,
    "enrollmentClosesAt": 100,
    "observationOpensAt": 100,
    "observationClosesAt": 200,
    "commitOpensAt": 100,
    "commitClosesAt": 300,
    "revealOpensAt": 300,
    "revealClosesAt": 400
  },
  "configuration": {}
}
```

Canonical JSON (one line):

```text
{"configuration":{},"eventId":"event-1","protocolVersion":"powit-v0","schemaHash":"f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12","schemaId":"schema-1","schemaVersion":"1","windows":{"commitClosesAt":300,"commitOpensAt":100,"enrollmentClosesAt":100,"enrollmentOpensAt":0,"observationClosesAt":200,"observationOpensAt":100,"revealClosesAt":400,"revealOpensAt":300}}
```

Expected SHA-256: `f1892f6343a196b16b560742017812d5f5f1c061cf251343655fd2cae09461ab`.

#### H04 — POWIT_V0_OBSERVATION



Full structured input:

```json
{
  "eventId": "event-1",
  "witnessParticipationId": "w1",
  "observedAt": 150,
  "report": {
    "seen": true
  },
  "evidenceManifestHash": null
}
```

Canonical JSON (one line):

```text
{"eventId":"event-1","evidenceManifestHash":null,"observedAt":150,"report":{"seen":true},"witnessParticipationId":"w1"}
```

Expected SHA-256: `8e4df971fc7d45352caae06350caab0a299134c0556c15639b6d86652f336641`.

#### H05 — POWIT_V0_EVIDENCE_MANIFEST

An empty manifest is not null. H04/H06 explicitly bind no manifest.

Full structured input:

```json
{
  "eventId": "event-1",
  "witnessParticipationId": "w1",
  "artifacts": []
}
```

Canonical JSON (one line):

```text
{"artifacts":[],"eventId":"event-1","witnessParticipationId":"w1"}
```

Expected SHA-256: `3bc919256e81fb405f51f0c88d91f5f92c949b3f3084b95b342900881257bb0e`.

#### H06 — POWIT_V0_COMMIT

The zero salt is test-only. acceptedAt=200, reveal receivedAt=300 in the conditional admission vectors.

Full structured input:

```json
{
  "eventId": "event-1",
  "witnessParticipationId": "w1",
  "observationHash": "8e4df971fc7d45352caae06350caab0a299134c0556c15639b6d86652f336641",
  "evidenceManifestHash": null,
  "salt": "0000000000000000000000000000000000000000000000000000000000000000"
}
```

Canonical JSON (one line):

```text
{"eventId":"event-1","evidenceManifestHash":null,"observationHash":"8e4df971fc7d45352caae06350caab0a299134c0556c15639b6d86652f336641","salt":"0000000000000000000000000000000000000000000000000000000000000000","witnessParticipationId":"w1"}
```

Expected SHA-256: `d49425bee4a8cb9ddded153a687aaab3b834d668eb67ec00295e599195e6dc57`.

#### H07 — POWIT_V0_PARTICIPATION_SET



Full structured input:

```json
[
  {
    "eventId": "event-1",
    "participationId": "w1",
    "witnessClasses": [
      "observer"
    ],
    "enrolledAt": 50
  }
]
```

Canonical JSON (one line):

```text
[{"enrolledAt":50,"eventId":"event-1","participationId":"w1","witnessClasses":["observer"]}]
```

Expected SHA-256: `3475f6111b73c666dae14034af433ed7ac4189c9ead8878d856855997a68def7`.

#### H08 — POWIT_V0_OBSERVATION_SET



Full structured input:

```json
[
  {
    "eventId": "event-1",
    "witnessParticipationId": "w1",
    "observedAt": 150,
    "report": {
      "seen": true
    },
    "evidenceManifestHash": null
  }
]
```

Canonical JSON (one line):

```text
[{"eventId":"event-1","evidenceManifestHash":null,"observedAt":150,"report":{"seen":true},"witnessParticipationId":"w1"}]
```

Expected SHA-256: `a3ae2e5a943a965dd341a83475fbaec50ab17532ea4880d3760f7cf1ed0609c7`.

#### H09 — POWIT_V0_RELATION_GRAPH

Zero pairs for one participant; this does not establish sufficient independence.

Full structured input:

```json
{
  "eventId": "event-1",
  "policy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "participantIds": [
    "w1"
  ],
  "dimensions": [
    "organization"
  ],
  "relations": []
}
```

Canonical JSON (one line):

```text
{"dimensions":["organization"],"eventId":"event-1","participantIds":["w1"],"policy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"relations":[]}
```

Expected SHA-256: `258effd53afcbbebaf2c1cacebcc78492bdd2f59bf7e1c9281809576da987467`.

#### H10 — POWIT_V0_SUFFICIENCY

The supplied evaluation is a codec fixture, not a frozen sufficiency rule.

Full structured input:

```json
{
  "eventId": "event-1",
  "policy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "requirements": [
    {
      "requirementId": "fixture-check",
      "passed": true,
      "relationKeys": [],
      "details": {
        "fixtureOnly": true
      }
    }
  ],
  "sufficient": true
}
```

Canonical JSON (one line):

```text
{"eventId":"event-1","policy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"requirements":[{"details":{"fixtureOnly":true},"passed":true,"relationKeys":[],"requirementId":"fixture-check"}],"sufficient":true}
```

Expected SHA-256: `8f3f2e4dc0ba6ce27065b4829500ec0e27a2eb5e01619604193e18288d450d7a`.

#### H11 — POWIT_V0_AGGREGATION

No real reducer or meaningfulness rule is selected by this fixture.

Full structured input:

```json
{
  "eventId": "event-1",
  "policy": {
    "policyId": "fixture-only",
    "policyVersion": "1",
    "definitionHash": "b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624"
  },
  "meaningfulParticipationIds": [
    "w1"
  ],
  "assessment": "CONVERGENT",
  "result": {
    "fixtureOnly": true
  }
}
```

Canonical JSON (one line):

```text
{"assessment":"CONVERGENT","eventId":"event-1","meaningfulParticipationIds":["w1"],"policy":{"definitionHash":"b556aa3d6cc267b81fc43dce6c2d8fe52c89973a516c9656b3411a044792a624","policyId":"fixture-only","policyVersion":"1"},"result":{"fixtureOnly":true}}
```

Expected SHA-256: `d75cd552360b029fc3708cac2e8813d24ecdce0de74d42c4c4bf4e4619576b5e`.

#### H12 — POWIT_V0_REPLAY_INPUTS

Legacy codec-only input; not a ReplayBundle under the subsequently frozen policy profile.

Full structured input:

```json
{
  "fixtureOnly": true,
  "logicalCutoff": 400
}
```

Canonical JSON (one line):

```text
{"fixtureOnly":true,"logicalCutoff":400}
```

Expected SHA-256: `562f3406f68ab97c48a76f476a3df4e7857036fb4b9344b04a802bd361e737a6`.

#### H13 — POWIT_V0_ATTESTATION

Exact Attestation wire hash only. H01/H10-H12 are fixture-only; this is NOT a valid issued protocol Attestation.

Full structured input:

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "event-1",
  "eventHash": "f1892f6343a196b16b560742017812d5f5f1c061cf251343655fd2cae09461ab",
  "schemaHash": "f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12",
  "acceptedParticipationSetHash": "3475f6111b73c666dae14034af433ed7ac4189c9ead8878d856855997a68def7",
  "acceptedObservationSetHash": "a3ae2e5a943a965dd341a83475fbaec50ab17532ea4880d3760f7cf1ed0609c7",
  "relationGraphHash": "258effd53afcbbebaf2c1cacebcc78492bdd2f59bf7e1c9281809576da987467",
  "sufficiencyEvaluationHash": "8f3f2e4dc0ba6ce27065b4829500ec0e27a2eb5e01619604193e18288d450d7a",
  "aggregationResultHash": "d75cd552360b029fc3708cac2e8813d24ecdce0de74d42c4c4bf4e4619576b5e",
  "replayInputHash": "562f3406f68ab97c48a76f476a3df4e7857036fb4b9344b04a802bd361e737a6",
  "epistemicState": "CONCORDANT",
  "version": 1,
  "supersedes": null,
  "finalizingAt": 400
}
```

Canonical JSON (one line):

```text
{"acceptedObservationSetHash":"a3ae2e5a943a965dd341a83475fbaec50ab17532ea4880d3760f7cf1ed0609c7","acceptedParticipationSetHash":"3475f6111b73c666dae14034af433ed7ac4189c9ead8878d856855997a68def7","aggregationResultHash":"d75cd552360b029fc3708cac2e8813d24ecdce0de74d42c4c4bf4e4619576b5e","epistemicState":"CONCORDANT","eventHash":"f1892f6343a196b16b560742017812d5f5f1c061cf251343655fd2cae09461ab","eventId":"event-1","finalizingAt":400,"protocolVersion":"powit-v0","relationGraphHash":"258effd53afcbbebaf2c1cacebcc78492bdd2f59bf7e1c9281809576da987467","replayInputHash":"562f3406f68ab97c48a76f476a3df4e7857036fb4b9344b04a802bd361e737a6","schemaHash":"f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12","sufficiencyEvaluationHash":"8f3f2e4dc0ba6ce27065b4829500ec0e27a2eb5e01619604193e18288d450d7a","supersedes":null,"version":1}
```

Expected SHA-256: `d356615f8b1f524d31fadc941357c53539b92b310c8a5ebbbb3e9b34c4b6673f`.

#### H14 — POWIT_V0_ATTESTATION

Checks version/predecessor bytes only; does not authorize a correction or prove that its inputs changed legitimately.

Full structured input:

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "event-1",
  "eventHash": "f1892f6343a196b16b560742017812d5f5f1c061cf251343655fd2cae09461ab",
  "schemaHash": "f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12",
  "acceptedParticipationSetHash": "3475f6111b73c666dae14034af433ed7ac4189c9ead8878d856855997a68def7",
  "acceptedObservationSetHash": "a3ae2e5a943a965dd341a83475fbaec50ab17532ea4880d3760f7cf1ed0609c7",
  "relationGraphHash": "258effd53afcbbebaf2c1cacebcc78492bdd2f59bf7e1c9281809576da987467",
  "sufficiencyEvaluationHash": "8f3f2e4dc0ba6ce27065b4829500ec0e27a2eb5e01619604193e18288d450d7a",
  "aggregationResultHash": "d75cd552360b029fc3708cac2e8813d24ecdce0de74d42c4c4bf4e4619576b5e",
  "replayInputHash": "562f3406f68ab97c48a76f476a3df4e7857036fb4b9344b04a802bd361e737a6",
  "epistemicState": "CONCORDANT",
  "version": 2,
  "supersedes": "d356615f8b1f524d31fadc941357c53539b92b310c8a5ebbbb3e9b34c4b6673f",
  "finalizingAt": 401
}
```

Canonical JSON (one line):

```text
{"acceptedObservationSetHash":"a3ae2e5a943a965dd341a83475fbaec50ab17532ea4880d3760f7cf1ed0609c7","acceptedParticipationSetHash":"3475f6111b73c666dae14034af433ed7ac4189c9ead8878d856855997a68def7","aggregationResultHash":"d75cd552360b029fc3708cac2e8813d24ecdce0de74d42c4c4bf4e4619576b5e","epistemicState":"CONCORDANT","eventHash":"f1892f6343a196b16b560742017812d5f5f1c061cf251343655fd2cae09461ab","eventId":"event-1","finalizingAt":401,"protocolVersion":"powit-v0","relationGraphHash":"258effd53afcbbebaf2c1cacebcc78492bdd2f59bf7e1c9281809576da987467","replayInputHash":"562f3406f68ab97c48a76f476a3df4e7857036fb4b9344b04a802bd361e737a6","schemaHash":"f525956a0fbd1ecb70cbdb0face0ae95b1c5caf6ebc18bc196bcf775897d4c12","sufficiencyEvaluationHash":"8f3f2e4dc0ba6ce27065b4829500ec0e27a2eb5e01619604193e18288d450d7a","supersedes":"d356615f8b1f524d31fadc941357c53539b92b310c8a5ebbbb3e9b34c4b6673f","version":2}
```

Expected SHA-256: `72d700164d8b859e7a3d6ea066a3212f94733fb6329476018d8dd9a909f3ef92`.

#### H15 — POWIT_V0_COMMIT

Wrong-salt candidate for V7; MUST differ from H06.

Full structured input:

```json
{
  "eventId": "event-1",
  "witnessParticipationId": "w1",
  "observationHash": "8e4df971fc7d45352caae06350caab0a299134c0556c15639b6d86652f336641",
  "evidenceManifestHash": null,
  "salt": "0101010101010101010101010101010101010101010101010101010101010101"
}
```

Canonical JSON (one line):

```text
{"eventId":"event-1","evidenceManifestHash":null,"observationHash":"8e4df971fc7d45352caae06350caab0a299134c0556c15639b6d86652f336641","salt":"0101010101010101010101010101010101010101010101010101010101010101","witnessParticipationId":"w1"}
```

Expected SHA-256: `2f1ef00875fb1d5873e9bcb407d7a504fc61729e2b015cf724aab4867a54eefd`.

#### H16 — POWIT_V0_OBSERVATION

Hashable JCS, invalid Observation: report is not an object.

Full structured input:

```json
{
  "eventId": "event-1",
  "witnessParticipationId": "w1",
  "observedAt": 150,
  "report": "unstructured",
  "evidenceManifestHash": null
}
```

Canonical JSON (one line):

```text
{"eventId":"event-1","evidenceManifestHash":null,"observedAt":150,"report":"unstructured","witnessParticipationId":"w1"}
```

Expected SHA-256: `7df8f0f1e2d66aba1d8981d531540ad418da45a7d2a7635e7a33ed5c42b986d5`.

#### H17 — POWIT_V0_COMMIT

V8 matching reveal still fails Observation validation.

Full structured input:

```json
{
  "eventId": "event-1",
  "witnessParticipationId": "w1",
  "observationHash": "7df8f0f1e2d66aba1d8981d531540ad418da45a7d2a7635e7a33ed5c42b986d5",
  "evidenceManifestHash": null,
  "salt": "0000000000000000000000000000000000000000000000000000000000000000"
}
```

Canonical JSON (one line):

```text
{"eventId":"event-1","evidenceManifestHash":null,"observationHash":"7df8f0f1e2d66aba1d8981d531540ad418da45a7d2a7635e7a33ed5c42b986d5","salt":"0000000000000000000000000000000000000000000000000000000000000000","witnessParticipationId":"w1"}
```

Expected SHA-256: `32e2d889f8842169f780582ed86d006bd2e71fae5e062afc320e0cd2187cbd5b`.

#### H18 — POWIT_V0_OBSERVATION_SET

Empty observation set has a digest, not null.

Full structured input:

```json
[]
```

Canonical JSON (one line):

```text
[]
```

Expected SHA-256: `709851e709b045a0d9774b91b7f57598be466b669150cf09e6a591468516a984`.

#### H19 — POWIT_V0_PARTICIPATION_SET

Same JSON bytes as H18, different domain and digest.

Full structured input:

```json
[]
```

Canonical JSON (one line):

```text
[]
```

Expected SHA-256: `e0211efad7309cc345c31ab1a1bfddc4261e1f7e4a6cf4d7322c461791ebd29d`.

#### H20 — POWIT_V0_POLICY

JCS codec input only: UTF-16 sorting, integer-like property names, escapes, preserved Unicode and list ordering. Not a valid policy definition.

Full structured input:

```json
{
  "2": 2,
  "10": 10,
  "z": 1,
  "": "private-use",
  "😀": "supplementary",
  "a": [
    "é",
    "é",
    "line\nquote\"\\",
    null,
    true
  ]
}
```

Canonical JSON (one line):

```text
{"10":10,"2":2,"a":["é","é","line\nquote\"\\",null,true],"z":1,"😀":"supplementary","":"private-use"}
```

Expected SHA-256: `3f7a85254b490931b88be6142ce36b8ceea276a755668e1f4f85dd4ab157dc28`.

### Raw artifact digest A1

Full input: empty file, exactly zero bytes (hex representation is the empty string). Algorithm: SHA-256 over those raw bytes, without a domain or JSON encoding. Expected digest: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. byteLength=0. This verifies content bytes only, not artifact provenance.

### Canonicalization and ordering checks

Reorder H04's object properties or add JSON whitespace: canonical bytes and H04 stay identical. Reverse a list that is not declared a set: its order remains reversed and its digest changes. H20 preserves the distinct strings é and e plus combining accent; it does not normalize them. The supplementary-property key sorts before U+E000 under UTF-16; integer-like key 10 sorts before key 2.

An input participation set supplied as [w2,w1] must normalize by participationId to [w1,w2] before set hashing; duplicate w1 is invalid, not deduplicated. An omitted Relation for a required pair/dimension is invalid, not automatically KNOWN_DISTINCT. H18 and H19 exercise empty arrays and domain separation. H06/H15 exercise salt binding; changing event, participation, observation hash or manifest/null also changes the commitment input.

Reject duplicate object keys; lone surrogate strings; NaN/Infinity; fractional numbers; mathematical integers outside the safe-integer range; undefined members; uppercase hash hex; malformed salt length; absent required nullable fields; unsorted canonical set representations or duplicate record identities. Negative zero canonicalizes to 0. No parser may round an invalid number before this check.

### Calculation provenance

The values were calculated using Node built-in SHA-256 and direct JCS property serialization for this integer-only fixture corpus, and cross-checked independently with Python SHA-256 and UTF-16-key ordering. The temporary calculation tools are not a protocol kernel, schema validator or reducer and are not part of the runtime repository changes.

### E2E-1 through E2E-4: deterministic full finalization vectors

These four cases are full canonical replay bundles under the supported fixture policy profile above, with expected outputs recomputed from source records. They are test inputs, not production credentials or proof of physical truth. The assurance provider and issuer are explicit trusted fixture authorities. Every JSON block is the exact structured value hashed; canonicalization and domain-separated SHA-256 use TYPES §2. Derived outputs in the bundle are claims to compare, not authoritative inputs.

#### E2E-1 CONCORDANT → CONCORDANT

ReplayBundle full structured input (hash domain POWIT_V0_REPLAY_INPUTS):

```json
{
  "protocolVersion": "powit-v0",
  "eventSchema": {
    "protocolVersion": "powit-v0",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "observationSchema": {
      "policyId": "observation-1",
      "policyVersion": "1",
      "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
    },
    "witnessEligibilityPolicy": {
      "policyId": "eligibility-1",
      "policyVersion": "1",
      "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
    },
    "requiredClaims": [],
    "relationPolicy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "relationalDiversityPolicy": {
      "policyId": "diversity-1",
      "policyVersion": "1",
      "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
    },
    "sufficiencyPolicy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "aggregationPolicy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "timingPolicy": {
      "policyId": "timing-1",
      "policyVersion": "1",
      "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
    },
    "evidencePolicy": null,
    "authenticationPolicy": null,
    "challengePolicy": null
  },
  "policyDefinitions": [
    {
      "policy": {
        "policyId": "aggregation-1",
        "policyVersion": "1",
        "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
      },
      "definition": {
        "policyKind": "AGGREGATION_V0",
        "reducer": "EXACT_MATCH"
      }
    },
    {
      "policy": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "definition": {
        "policyKind": "UPSTREAM_ASSURANCE_METHOD_V0",
        "provider": "fixture-provider",
        "method": "controlled-deterministic-test-issuer"
      }
    },
    {
      "policy": {
        "policyId": "diversity-1",
        "policyVersion": "1",
        "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
      },
      "definition": {
        "policyKind": "RELATIONAL_DIVERSITY_V0",
        "distinctValueDimensions": [
          "organization"
        ]
      }
    },
    {
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "definition": {
        "policyKind": "WITNESS_ELIGIBILITY_V0",
        "assuranceProviders": [
          "fixture-provider"
        ],
        "acceptedAssuranceMethods": [
          {
            "policyId": "assurance-method-1",
            "policyVersion": "1",
            "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
          }
        ],
        "disqualificationAuthorities": [
          "fixture-provider"
        ]
      }
    },
    {
      "policy": {
        "policyId": "observation-1",
        "policyVersion": "1",
        "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
      },
      "definition": {
        "policyKind": "OBSERVATION_SCHEMA_V0",
        "requiredPaths": [
          [
            "occurred"
          ]
        ],
        "materialClaimPath": [
          "occurred"
        ],
        "abstentionPath": [
          "abstain"
        ]
      }
    },
    {
      "policy": {
        "policyId": "relations-1",
        "policyVersion": "1",
        "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
      },
      "definition": {
        "policyKind": "RELATION_CLAIM_VALUE_EQUALITY_V0",
        "dimensions": [
          {
            "dimensionId": "organization",
            "claimType": "organization",
            "claimPath": [
              "org"
            ],
            "valueType": "STRING",
            "normalization": "JCS_VALUE",
            "relevantAt": "QUALIFICATION_RELEVANT_AT",
            "acceptedVerificationPolicies": [
              {
                "policyId": "verification-1",
                "policyVersion": "1",
                "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
              }
            ]
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "sufficiency-1",
        "policyVersion": "1",
        "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
      },
      "definition": {
        "policyKind": "SUFFICIENCY_V0",
        "requirements": [
          {
            "requirementId": "minimum-observations",
            "operator": "MIN_ACCEPTED_OBSERVATIONS",
            "minimum": 3
          },
          {
            "requirementId": "distinct-organizations",
            "operator": "MIN_DISTINCT_VERIFIED_VALUES",
            "dimension": "organization",
            "minimum": 3
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "timing-1",
        "policyVersion": "1",
        "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
      },
      "definition": {
        "policyKind": "TIMING_V0",
        "observationTimeAuthority": "PROTOCOL_ACCEPTANCE",
        "allowObservationCommitOverlap": true
      }
    },
    {
      "policy": {
        "policyId": "verification-1",
        "policyVersion": "1",
        "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
      },
      "definition": {
        "policyKind": "CLAIM_VERIFICATION_V0",
        "issuerId": "fixture-issuer"
      }
    }
  ],
  "eventDefinition": {
    "protocolVersion": "powit-v0",
    "eventId": "e2e-1-concordant",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
    "windows": {
      "enrollmentOpensAt": 10,
      "enrollmentClosesAt": 100,
      "observationOpensAt": 100,
      "observationClosesAt": 300,
      "commitOpensAt": 100,
      "commitClosesAt": 300,
      "revealOpensAt": 300,
      "revealClosesAt": 400
    },
    "configuration": {}
  },
  "lifecycle": [
    {
      "sequence": 1,
      "from": null,
      "to": "DRAFT",
      "authoritativeAt": 0
    },
    {
      "sequence": 2,
      "from": "DRAFT",
      "to": "ACTIVE",
      "authoritativeAt": 0
    },
    {
      "sequence": 23,
      "from": "ACTIVE",
      "to": "FINALIZING",
      "authoritativeAt": 400
    }
  ],
  "uniquenessAssertions": [
    {
      "eventId": "e2e-1-concordant",
      "uniquenessToken": "token-1",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-1-concordant",
      "uniquenessToken": "token-2",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-1-concordant",
      "uniquenessToken": "token-3",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-1-concordant",
      "uniquenessToken": "token-4",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-1-concordant",
      "uniquenessToken": "token-5",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    }
  ],
  "participations": [
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w1",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "52f4bc62bda4cc4e5206715480435e655006c1f44bf71996d961215ef90122c1"
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w2",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "d112276cc3b8f05d51ed44b567a141e80ee9f8d36e307c61a88cbb484764bc99"
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w3",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "c6bb3c705669a82c6f7c63c9fe2291a8185da1aa5d0403452992a5d3cc59ee5c"
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w4",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "c4fe6a675e38d97989cc925a09bad1683f88f080b75620357c8d6330b18f9276"
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w5",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "09c7b52fb7dc0f2c407e4cf0dc18e85c9121c89b547b05eaa80b16b87b709250"
    }
  ],
  "qualificationSnapshots": [
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w1",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-1-concordant",
          "claimId": "claim-org-w1",
          "subjectParticipationId": "w1",
          "claimType": "organization",
          "value": {
            "org": "org-1"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w1",
            "proofRef": "proof-w1"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w2",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-1-concordant",
          "claimId": "claim-org-w2",
          "subjectParticipationId": "w2",
          "claimType": "organization",
          "value": {
            "org": "org-2"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w2",
            "proofRef": "proof-w2"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w3",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-1-concordant",
          "claimId": "claim-org-w3",
          "subjectParticipationId": "w3",
          "claimType": "organization",
          "value": {
            "org": "org-3"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w3",
            "proofRef": "proof-w3"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w4",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-1-concordant",
          "claimId": "claim-org-w4",
          "subjectParticipationId": "w4",
          "claimType": "organization",
          "value": {
            "org": "org-4"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w4",
            "proofRef": "proof-w4"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-1-concordant",
      "participationId": "w5",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-1-concordant",
          "claimId": "claim-org-w5",
          "subjectParticipationId": "w5",
          "claimType": "organization",
          "value": {
            "org": "org-5"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w5",
            "proofRef": "proof-w5"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    }
  ],
  "commitments": [
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w1",
      "commitmentHash": "19e6eec9418b1f6dacfadcf0ca50f7ab557f4f3a1596cd816dffbb7bdec8d85a",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-1-concordant",
        "participationId": "w1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-1-concordant",
            "claimId": "claim-org-w1",
            "subjectParticipationId": "w1",
            "claimType": "organization",
            "value": {
              "org": "org-1"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w1",
              "proofRef": "proof-w1"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w2",
      "commitmentHash": "8b011d910e4adb85679bbdad5d5b43cba9d2fe968e7bc4d69dd539e9db6b2fea",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-1-concordant",
        "participationId": "w2",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-1-concordant",
            "claimId": "claim-org-w2",
            "subjectParticipationId": "w2",
            "claimType": "organization",
            "value": {
              "org": "org-2"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w2",
              "proofRef": "proof-w2"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w3",
      "commitmentHash": "60dc96064f9c61a5281127bfc7d9c607d9f95a886206233e3689043c0080c90b",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-1-concordant",
        "participationId": "w3",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-1-concordant",
            "claimId": "claim-org-w3",
            "subjectParticipationId": "w3",
            "claimType": "organization",
            "value": {
              "org": "org-3"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w3",
              "proofRef": "proof-w3"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w4",
      "commitmentHash": "f4fdcbce9993a2946d47ea6da8b06d8eb15058524dcb9d5476e418210523ce43",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-1-concordant",
        "participationId": "w4",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-1-concordant",
            "claimId": "claim-org-w4",
            "subjectParticipationId": "w4",
            "claimType": "organization",
            "value": {
              "org": "org-4"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w4",
              "proofRef": "proof-w4"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w5",
      "commitmentHash": "9cac4c07ef8a34ff6d994c1aeb965a315be1ef3a58c950a4c6f7582588656ba8",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-1-concordant",
        "participationId": "w5",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-1-concordant",
            "claimId": "claim-org-w5",
            "subjectParticipationId": "w5",
            "claimType": "organization",
            "value": {
              "org": "org-5"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w5",
              "proofRef": "proof-w5"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    }
  ],
  "reveals": [
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w1",
      "candidateObservation": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w1",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w2",
      "candidateObservation": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w2",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w3",
      "candidateObservation": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w3",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w4",
      "candidateObservation": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w4",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w5",
      "candidateObservation": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w5",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    }
  ],
  "intakeDecisions": [
    {
      "sequence": 1,
      "actionType": "CREATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-1-concordant",
      "reasonCodes": [],
      "input": {
        "protocolVersion": "powit-v0",
        "eventId": "e2e-1-concordant",
        "schemaId": "fixture-schema",
        "schemaVersion": "1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "windows": {
          "enrollmentOpensAt": 10,
          "enrollmentClosesAt": 100,
          "observationOpensAt": 100,
          "observationClosesAt": 300,
          "commitOpensAt": 100,
          "commitClosesAt": 300,
          "revealOpensAt": 300,
          "revealClosesAt": 400
        },
        "configuration": {}
      }
    },
    {
      "sequence": 2,
      "actionType": "ACTIVATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-1-concordant",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant"
      }
    },
    {
      "sequence": 3,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "52f4bc62bda4cc4e5206715480435e655006c1f44bf71996d961215ef90122c1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "uniquenessToken": "token-1",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 4,
      "actionType": "ENROLL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "participationId": "w1",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "52f4bc62bda4cc4e5206715480435e655006c1f44bf71996d961215ef90122c1"
      }
    },
    {
      "sequence": 5,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "19e6eec9418b1f6dacfadcf0ca50f7ab557f4f3a1596cd816dffbb7bdec8d85a",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w1",
          "commitmentHash": "19e6eec9418b1f6dacfadcf0ca50f7ab557f4f3a1596cd816dffbb7bdec8d85a",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-1-concordant",
            "participationId": "w1",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-1-concordant",
                "claimId": "claim-org-w1",
                "subjectParticipationId": "w1",
                "claimType": "organization",
                "value": {
                  "org": "org-1"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w1",
                  "proofRef": "proof-w1"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w1",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w1",
          "observationHash": "ac18c142295eb5a6ce5c66c9d92de2653dfd507b306c46d3be1bc8881ed45ed5",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 6,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w1",
        "candidateObservation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w1",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 7,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "d112276cc3b8f05d51ed44b567a141e80ee9f8d36e307c61a88cbb484764bc99",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "uniquenessToken": "token-2",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 8,
      "actionType": "ENROLL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "participationId": "w2",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "d112276cc3b8f05d51ed44b567a141e80ee9f8d36e307c61a88cbb484764bc99"
      }
    },
    {
      "sequence": 9,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "8b011d910e4adb85679bbdad5d5b43cba9d2fe968e7bc4d69dd539e9db6b2fea",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w2",
          "commitmentHash": "8b011d910e4adb85679bbdad5d5b43cba9d2fe968e7bc4d69dd539e9db6b2fea",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-1-concordant",
            "participationId": "w2",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-1-concordant",
                "claimId": "claim-org-w2",
                "subjectParticipationId": "w2",
                "claimType": "organization",
                "value": {
                  "org": "org-2"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w2",
                  "proofRef": "proof-w2"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w2",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w2",
          "observationHash": "33665ce23c1ba859bc53ab2677b442fdf6ce97d85056345bb90d53a5af428780",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 10,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w2",
        "candidateObservation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w2",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 11,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "c6bb3c705669a82c6f7c63c9fe2291a8185da1aa5d0403452992a5d3cc59ee5c",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "uniquenessToken": "token-3",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 12,
      "actionType": "ENROLL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "participationId": "w3",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "c6bb3c705669a82c6f7c63c9fe2291a8185da1aa5d0403452992a5d3cc59ee5c"
      }
    },
    {
      "sequence": 13,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "60dc96064f9c61a5281127bfc7d9c607d9f95a886206233e3689043c0080c90b",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w3",
          "commitmentHash": "60dc96064f9c61a5281127bfc7d9c607d9f95a886206233e3689043c0080c90b",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-1-concordant",
            "participationId": "w3",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-1-concordant",
                "claimId": "claim-org-w3",
                "subjectParticipationId": "w3",
                "claimType": "organization",
                "value": {
                  "org": "org-3"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w3",
                  "proofRef": "proof-w3"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w3",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w3",
          "observationHash": "da4f4007acd718bafcf1e790d93bcc6a9853ba7b838794ed5d916c138c238ab3",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 14,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w3",
        "candidateObservation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w3",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 15,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "c4fe6a675e38d97989cc925a09bad1683f88f080b75620357c8d6330b18f9276",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "uniquenessToken": "token-4",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 16,
      "actionType": "ENROLL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "participationId": "w4",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "c4fe6a675e38d97989cc925a09bad1683f88f080b75620357c8d6330b18f9276"
      }
    },
    {
      "sequence": 17,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "f4fdcbce9993a2946d47ea6da8b06d8eb15058524dcb9d5476e418210523ce43",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w4",
          "commitmentHash": "f4fdcbce9993a2946d47ea6da8b06d8eb15058524dcb9d5476e418210523ce43",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-1-concordant",
            "participationId": "w4",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-1-concordant",
                "claimId": "claim-org-w4",
                "subjectParticipationId": "w4",
                "claimType": "organization",
                "value": {
                  "org": "org-4"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w4",
                  "proofRef": "proof-w4"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w4",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w4",
          "observationHash": "757d3f59ba6fc46fc74c9339c1d66d55c973b6b1d41ca9c254e117630218f006",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 18,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w4",
        "candidateObservation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w4",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 19,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "09c7b52fb7dc0f2c407e4cf0dc18e85c9121c89b547b05eaa80b16b87b709250",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "uniquenessToken": "token-5",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 20,
      "actionType": "ENROLL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "participationId": "w5",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "09c7b52fb7dc0f2c407e4cf0dc18e85c9121c89b547b05eaa80b16b87b709250"
      }
    },
    {
      "sequence": 21,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "9cac4c07ef8a34ff6d994c1aeb965a315be1ef3a58c950a4c6f7582588656ba8",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w5",
          "commitmentHash": "9cac4c07ef8a34ff6d994c1aeb965a315be1ef3a58c950a4c6f7582588656ba8",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-1-concordant",
            "participationId": "w5",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-1-concordant",
                "claimId": "claim-org-w5",
                "subjectParticipationId": "w5",
                "claimType": "organization",
                "value": {
                  "org": "org-5"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w5",
                  "proofRef": "proof-w5"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w5",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w5",
          "observationHash": "7bcf8f7a0716db80011a3068b2ff8aeca3389105c7a28b1bd72e8f00559b74ac",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 22,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant",
        "witnessParticipationId": "w5",
        "candidateObservation": {
          "eventId": "e2e-1-concordant",
          "witnessParticipationId": "w5",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 23,
      "actionType": "BEGIN_FINALIZATION",
      "actorId": "protocol-runtime",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 400,
      "clientTimestamp": null,
      "recordRef": "e2e-1-concordant",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-1-concordant"
      }
    }
  ],
  "disqualifications": [],
  "claimedObservationOutcomes": [
    {
      "participationId": "w1",
      "sequence": 6,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w2",
      "sequence": 10,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w3",
      "sequence": 14,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w4",
      "sequence": 18,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w5",
      "sequence": 22,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    }
  ],
  "claimedAdmittedObservations": [
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w1",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w2",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w3",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w4",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-1-concordant",
      "witnessParticipationId": "w5",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    }
  ],
  "claimedRelationGraph": {
    "eventId": "e2e-1-concordant",
    "policy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "participantIds": [
      "w1",
      "w2",
      "w3",
      "w4",
      "w5"
    ],
    "dimensions": [
      "organization"
    ],
    "relations": [
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w2",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w2"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w3",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w3"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w3",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w3"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w3",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w3",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w3",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w3",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w4",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w4",
          "claim-org-w5"
        ]
      }
    ],
    "conflicts": []
  },
  "claimedSufficiencyEvaluation": {
    "eventId": "e2e-1-concordant",
    "policy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "requirements": [
      {
        "requirementId": "minimum-observations",
        "operator": "MIN_ACCEPTED_OBSERVATIONS",
        "parameters": {
          "minimum": 3
        },
        "observedValue": 5,
        "passed": true,
        "claimIds": [],
        "relationKeys": []
      },
      {
        "requirementId": "distinct-organizations",
        "operator": "MIN_DISTINCT_VERIFIED_VALUES",
        "parameters": {
          "dimension": "organization",
          "minimum": 3
        },
        "observedValue": 5,
        "passed": true,
        "claimIds": [
          "claim-org-w1",
          "claim-org-w2",
          "claim-org-w3",
          "claim-org-w4",
          "claim-org-w5"
        ],
        "relationKeys": []
      }
    ],
    "overallSufficient": true
  },
  "claimedAggregationResult": {
    "eventId": "e2e-1-concordant",
    "policy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "reducer": "EXACT_MATCH",
    "materialClaimPath": [
      "occurred"
    ],
    "assessment": "CONVERGENT",
    "values": [
      {
        "canonicalValue": true,
        "observationCount": 5,
        "participationIds": [
          "w1",
          "w2",
          "w3",
          "w4",
          "w5"
        ]
      }
    ]
  },
  "claimedEpistemicState": "CONCORDANT"
}
```

Derived RelationGraph (POWIT_V0_RELATION_GRAPH):

```json
{
  "eventId": "e2e-1-concordant",
  "policy": {
    "policyId": "relations-1",
    "policyVersion": "1",
    "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
  },
  "participantIds": [
    "w1",
    "w2",
    "w3",
    "w4",
    "w5"
  ],
  "dimensions": [
    "organization"
  ],
  "relations": [
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w2",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w2"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w3",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w3"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w3",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w3"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w3",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w3",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w3",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w3",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w4",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w4",
        "claim-org-w5"
      ]
    }
  ],
  "conflicts": []
}
```

Derived SufficiencyEvaluation (POWIT_V0_SUFFICIENCY):

```json
{
  "eventId": "e2e-1-concordant",
  "policy": {
    "policyId": "sufficiency-1",
    "policyVersion": "1",
    "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
  },
  "requirements": [
    {
      "requirementId": "minimum-observations",
      "operator": "MIN_ACCEPTED_OBSERVATIONS",
      "parameters": {
        "minimum": 3
      },
      "observedValue": 5,
      "passed": true,
      "claimIds": [],
      "relationKeys": []
    },
    {
      "requirementId": "distinct-organizations",
      "operator": "MIN_DISTINCT_VERIFIED_VALUES",
      "parameters": {
        "dimension": "organization",
        "minimum": 3
      },
      "observedValue": 5,
      "passed": true,
      "claimIds": [
        "claim-org-w1",
        "claim-org-w2",
        "claim-org-w3",
        "claim-org-w4",
        "claim-org-w5"
      ],
      "relationKeys": []
    }
  ],
  "overallSufficient": true
}
```

Derived AggregationResult (POWIT_V0_AGGREGATION):

```json
{
  "eventId": "e2e-1-concordant",
  "policy": {
    "policyId": "aggregation-1",
    "policyVersion": "1",
    "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
  },
  "reducer": "EXACT_MATCH",
  "materialClaimPath": [
    "occurred"
  ],
  "assessment": "CONVERGENT",
  "values": [
    {
      "canonicalValue": true,
      "observationCount": 5,
      "participationIds": [
        "w1",
        "w2",
        "w3",
        "w4",
        "w5"
      ]
    }
  ]
}
```

Canonical Attestation input (POWIT_V0_ATTESTATION):

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "e2e-1-concordant",
  "eventHash": "66e7612cd090ac8364a205908d5edcdea003ee1d0e8c5748fc4941fb90c8b8b9",
  "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
  "acceptedParticipationSetHash": "7e234d71d7a26884f427bb48c265505454fe87bbe76d278628ac59537fb49bed",
  "acceptedObservationSetHash": "de6bb7ffd0922e813256ee786c29eef4898f056b32a060a89ed2d858dc6b8d14",
  "relationGraphHash": "a92cde985870e13cb315f0430b3a168ef91e1770ab46974c95e963431c398c71",
  "sufficiencyEvaluationHash": "481971263be68c9e854f88158b4d00736aedcb21de21260d33a8155d4e361135",
  "aggregationResultHash": "c054a9ec21f69a5c77481c9cb95c9e32603f90cf8ecb532b8446e558bf7d214e",
  "replayInputHash": "34a64e38054b88c2301ec2ef0d52d5f996c9578b58691cab476e2c0b09382fd8",
  "epistemicState": "CONCORDANT",
  "version": 1,
  "supersedes": null,
  "finalizingAt": 400
}
```

Exact hashes:

| Input | SHA-256 |
| --- | --- |
| EventSchema | `0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18` |
| EventDefinition | `66e7612cd090ac8364a205908d5edcdea003ee1d0e8c5748fc4941fb90c8b8b9` |
| accepted WitnessParticipation set | `7e234d71d7a26884f427bb48c265505454fe87bbe76d278628ac59537fb49bed` |
| admitted Observation set | `de6bb7ffd0922e813256ee786c29eef4898f056b32a060a89ed2d858dc6b8d14` |
| RelationGraph | `a92cde985870e13cb315f0430b3a168ef91e1770ab46974c95e963431c398c71` |
| SufficiencyEvaluation | `481971263be68c9e854f88158b4d00736aedcb21de21260d33a8155d4e361135` |
| AggregationResult | `c054a9ec21f69a5c77481c9cb95c9e32603f90cf8ecb532b8446e558bf7d214e` |
| ReplayBundle | `34a64e38054b88c2301ec2ef0d52d5f996c9578b58691cab476e2c0b09382fd8` |
| Attestation | `0088e00e861fe6cfb65b5f91881aa583f7b5204708241c73b9015f03ff0293ee` |

#### E2E-2 SPLIT → SPLIT

ReplayBundle full structured input (hash domain POWIT_V0_REPLAY_INPUTS):

```json
{
  "protocolVersion": "powit-v0",
  "eventSchema": {
    "protocolVersion": "powit-v0",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "observationSchema": {
      "policyId": "observation-1",
      "policyVersion": "1",
      "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
    },
    "witnessEligibilityPolicy": {
      "policyId": "eligibility-1",
      "policyVersion": "1",
      "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
    },
    "requiredClaims": [],
    "relationPolicy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "relationalDiversityPolicy": {
      "policyId": "diversity-1",
      "policyVersion": "1",
      "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
    },
    "sufficiencyPolicy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "aggregationPolicy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "timingPolicy": {
      "policyId": "timing-1",
      "policyVersion": "1",
      "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
    },
    "evidencePolicy": null,
    "authenticationPolicy": null,
    "challengePolicy": null
  },
  "policyDefinitions": [
    {
      "policy": {
        "policyId": "aggregation-1",
        "policyVersion": "1",
        "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
      },
      "definition": {
        "policyKind": "AGGREGATION_V0",
        "reducer": "EXACT_MATCH"
      }
    },
    {
      "policy": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "definition": {
        "policyKind": "UPSTREAM_ASSURANCE_METHOD_V0",
        "provider": "fixture-provider",
        "method": "controlled-deterministic-test-issuer"
      }
    },
    {
      "policy": {
        "policyId": "diversity-1",
        "policyVersion": "1",
        "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
      },
      "definition": {
        "policyKind": "RELATIONAL_DIVERSITY_V0",
        "distinctValueDimensions": [
          "organization"
        ]
      }
    },
    {
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "definition": {
        "policyKind": "WITNESS_ELIGIBILITY_V0",
        "assuranceProviders": [
          "fixture-provider"
        ],
        "acceptedAssuranceMethods": [
          {
            "policyId": "assurance-method-1",
            "policyVersion": "1",
            "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
          }
        ],
        "disqualificationAuthorities": [
          "fixture-provider"
        ]
      }
    },
    {
      "policy": {
        "policyId": "observation-1",
        "policyVersion": "1",
        "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
      },
      "definition": {
        "policyKind": "OBSERVATION_SCHEMA_V0",
        "requiredPaths": [
          [
            "occurred"
          ]
        ],
        "materialClaimPath": [
          "occurred"
        ],
        "abstentionPath": [
          "abstain"
        ]
      }
    },
    {
      "policy": {
        "policyId": "relations-1",
        "policyVersion": "1",
        "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
      },
      "definition": {
        "policyKind": "RELATION_CLAIM_VALUE_EQUALITY_V0",
        "dimensions": [
          {
            "dimensionId": "organization",
            "claimType": "organization",
            "claimPath": [
              "org"
            ],
            "valueType": "STRING",
            "normalization": "JCS_VALUE",
            "relevantAt": "QUALIFICATION_RELEVANT_AT",
            "acceptedVerificationPolicies": [
              {
                "policyId": "verification-1",
                "policyVersion": "1",
                "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
              }
            ]
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "sufficiency-1",
        "policyVersion": "1",
        "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
      },
      "definition": {
        "policyKind": "SUFFICIENCY_V0",
        "requirements": [
          {
            "requirementId": "minimum-observations",
            "operator": "MIN_ACCEPTED_OBSERVATIONS",
            "minimum": 3
          },
          {
            "requirementId": "distinct-organizations",
            "operator": "MIN_DISTINCT_VERIFIED_VALUES",
            "dimension": "organization",
            "minimum": 3
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "timing-1",
        "policyVersion": "1",
        "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
      },
      "definition": {
        "policyKind": "TIMING_V0",
        "observationTimeAuthority": "PROTOCOL_ACCEPTANCE",
        "allowObservationCommitOverlap": true
      }
    },
    {
      "policy": {
        "policyId": "verification-1",
        "policyVersion": "1",
        "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
      },
      "definition": {
        "policyKind": "CLAIM_VERIFICATION_V0",
        "issuerId": "fixture-issuer"
      }
    }
  ],
  "eventDefinition": {
    "protocolVersion": "powit-v0",
    "eventId": "e2e-2-split",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
    "windows": {
      "enrollmentOpensAt": 10,
      "enrollmentClosesAt": 100,
      "observationOpensAt": 100,
      "observationClosesAt": 300,
      "commitOpensAt": 100,
      "commitClosesAt": 300,
      "revealOpensAt": 300,
      "revealClosesAt": 400
    },
    "configuration": {}
  },
  "lifecycle": [
    {
      "sequence": 1,
      "from": null,
      "to": "DRAFT",
      "authoritativeAt": 0
    },
    {
      "sequence": 2,
      "from": "DRAFT",
      "to": "ACTIVE",
      "authoritativeAt": 0
    },
    {
      "sequence": 23,
      "from": "ACTIVE",
      "to": "FINALIZING",
      "authoritativeAt": 400
    }
  ],
  "uniquenessAssertions": [
    {
      "eventId": "e2e-2-split",
      "uniquenessToken": "token-1",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-2-split",
      "uniquenessToken": "token-2",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-2-split",
      "uniquenessToken": "token-3",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-2-split",
      "uniquenessToken": "token-4",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-2-split",
      "uniquenessToken": "token-5",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    }
  ],
  "participations": [
    {
      "eventId": "e2e-2-split",
      "participationId": "w1",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "63822143e11f7b96dcfbc75478d8fbbac57083ef9c4910e40efcb6bbf3bc50a9"
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w2",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "0fcbbec013e076ddac7c7cfb3ba3c15a8dec13bfb5a8190481e117d971ce89b9"
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w3",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "d028f6c413ec4f4b6bc6c92e1a92016415fab6b1e2409fb17d450753dee8143b"
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w4",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "f5d3f0493cbd00ed89513d86de4f3dbd57f99aa80cdea2dc7050b5d8a8d5de3b"
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w5",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "cb2e2cd1bf2f2c4e62baf17adbdd8bc21c5fb22ec1147da27dfc090fa7575c49"
    }
  ],
  "qualificationSnapshots": [
    {
      "eventId": "e2e-2-split",
      "participationId": "w1",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-2-split",
          "claimId": "claim-org-w1",
          "subjectParticipationId": "w1",
          "claimType": "organization",
          "value": {
            "org": "org-1"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w1",
            "proofRef": "proof-w1"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w2",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-2-split",
          "claimId": "claim-org-w2",
          "subjectParticipationId": "w2",
          "claimType": "organization",
          "value": {
            "org": "org-2"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w2",
            "proofRef": "proof-w2"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w3",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-2-split",
          "claimId": "claim-org-w3",
          "subjectParticipationId": "w3",
          "claimType": "organization",
          "value": {
            "org": "org-3"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w3",
            "proofRef": "proof-w3"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w4",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-2-split",
          "claimId": "claim-org-w4",
          "subjectParticipationId": "w4",
          "claimType": "organization",
          "value": {
            "org": "org-4"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w4",
            "proofRef": "proof-w4"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-2-split",
      "participationId": "w5",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-2-split",
          "claimId": "claim-org-w5",
          "subjectParticipationId": "w5",
          "claimType": "organization",
          "value": {
            "org": "org-5"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w5",
            "proofRef": "proof-w5"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    }
  ],
  "commitments": [
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w1",
      "commitmentHash": "0f0ee11be73e7d6301242b50b88c50497b52d1069de22e2bb31f98fa147e74b7",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-2-split",
        "participationId": "w1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-2-split",
            "claimId": "claim-org-w1",
            "subjectParticipationId": "w1",
            "claimType": "organization",
            "value": {
              "org": "org-1"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w1",
              "proofRef": "proof-w1"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w2",
      "commitmentHash": "6cecb48e7c0608492a8060fb72e796eb3c7007c8cc64dd348be9063347768fe7",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-2-split",
        "participationId": "w2",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-2-split",
            "claimId": "claim-org-w2",
            "subjectParticipationId": "w2",
            "claimType": "organization",
            "value": {
              "org": "org-2"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w2",
              "proofRef": "proof-w2"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w3",
      "commitmentHash": "971e6fce2dd999a1ed4c7a967244d2a45adfbd85602200171b9e4f81d90ffd19",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-2-split",
        "participationId": "w3",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-2-split",
            "claimId": "claim-org-w3",
            "subjectParticipationId": "w3",
            "claimType": "organization",
            "value": {
              "org": "org-3"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w3",
              "proofRef": "proof-w3"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w4",
      "commitmentHash": "79f14b613bc6f9f53c82cca458d864e7b0cc9d7555c4dbdbed6315ef07c45456",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-2-split",
        "participationId": "w4",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-2-split",
            "claimId": "claim-org-w4",
            "subjectParticipationId": "w4",
            "claimType": "organization",
            "value": {
              "org": "org-4"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w4",
              "proofRef": "proof-w4"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w5",
      "commitmentHash": "68dd046c2a1a712a3f4b2ac25e2e8b072cddc707a40169aadf4f7192299c0574",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-2-split",
        "participationId": "w5",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-2-split",
            "claimId": "claim-org-w5",
            "subjectParticipationId": "w5",
            "claimType": "organization",
            "value": {
              "org": "org-5"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w5",
              "proofRef": "proof-w5"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    }
  ],
  "reveals": [
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w1",
      "candidateObservation": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w1",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w2",
      "candidateObservation": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w2",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w3",
      "candidateObservation": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w3",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w4",
      "candidateObservation": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w4",
        "observedAt": 150,
        "report": {
          "occurred": false
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w5",
      "candidateObservation": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w5",
        "observedAt": 150,
        "report": {
          "occurred": false
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    }
  ],
  "intakeDecisions": [
    {
      "sequence": 1,
      "actionType": "CREATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-2-split",
      "reasonCodes": [],
      "input": {
        "protocolVersion": "powit-v0",
        "eventId": "e2e-2-split",
        "schemaId": "fixture-schema",
        "schemaVersion": "1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "windows": {
          "enrollmentOpensAt": 10,
          "enrollmentClosesAt": 100,
          "observationOpensAt": 100,
          "observationClosesAt": 300,
          "commitOpensAt": 100,
          "commitClosesAt": 300,
          "revealOpensAt": 300,
          "revealClosesAt": 400
        },
        "configuration": {}
      }
    },
    {
      "sequence": 2,
      "actionType": "ACTIVATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-2-split",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split"
      }
    },
    {
      "sequence": 3,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "63822143e11f7b96dcfbc75478d8fbbac57083ef9c4910e40efcb6bbf3bc50a9",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "uniquenessToken": "token-1",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 4,
      "actionType": "ENROLL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "participationId": "w1",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "63822143e11f7b96dcfbc75478d8fbbac57083ef9c4910e40efcb6bbf3bc50a9"
      }
    },
    {
      "sequence": 5,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "0f0ee11be73e7d6301242b50b88c50497b52d1069de22e2bb31f98fa147e74b7",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w1",
          "commitmentHash": "0f0ee11be73e7d6301242b50b88c50497b52d1069de22e2bb31f98fa147e74b7",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-2-split",
            "participationId": "w1",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-2-split",
                "claimId": "claim-org-w1",
                "subjectParticipationId": "w1",
                "claimType": "organization",
                "value": {
                  "org": "org-1"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w1",
                  "proofRef": "proof-w1"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w1",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w1",
          "observationHash": "55ff8ab1eaf561ce522a0e9ce3886da8f0531a6e7263a90b3578a9d84ef8b824",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 6,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w1",
        "candidateObservation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w1",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 7,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "0fcbbec013e076ddac7c7cfb3ba3c15a8dec13bfb5a8190481e117d971ce89b9",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "uniquenessToken": "token-2",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 8,
      "actionType": "ENROLL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "participationId": "w2",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "0fcbbec013e076ddac7c7cfb3ba3c15a8dec13bfb5a8190481e117d971ce89b9"
      }
    },
    {
      "sequence": 9,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "6cecb48e7c0608492a8060fb72e796eb3c7007c8cc64dd348be9063347768fe7",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w2",
          "commitmentHash": "6cecb48e7c0608492a8060fb72e796eb3c7007c8cc64dd348be9063347768fe7",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-2-split",
            "participationId": "w2",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-2-split",
                "claimId": "claim-org-w2",
                "subjectParticipationId": "w2",
                "claimType": "organization",
                "value": {
                  "org": "org-2"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w2",
                  "proofRef": "proof-w2"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w2",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w2",
          "observationHash": "54d7cef73dacff354745724d75252c48a4da2b51a718833af6c22de0ab8c6a6f",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 10,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w2",
        "candidateObservation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w2",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 11,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "d028f6c413ec4f4b6bc6c92e1a92016415fab6b1e2409fb17d450753dee8143b",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "uniquenessToken": "token-3",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 12,
      "actionType": "ENROLL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "participationId": "w3",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "d028f6c413ec4f4b6bc6c92e1a92016415fab6b1e2409fb17d450753dee8143b"
      }
    },
    {
      "sequence": 13,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "971e6fce2dd999a1ed4c7a967244d2a45adfbd85602200171b9e4f81d90ffd19",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w3",
          "commitmentHash": "971e6fce2dd999a1ed4c7a967244d2a45adfbd85602200171b9e4f81d90ffd19",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-2-split",
            "participationId": "w3",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-2-split",
                "claimId": "claim-org-w3",
                "subjectParticipationId": "w3",
                "claimType": "organization",
                "value": {
                  "org": "org-3"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w3",
                  "proofRef": "proof-w3"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w3",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w3",
          "observationHash": "3bc622a3cb593aa6ad1a83ab7f3b1aaf47c794e459050a217bc6f2a8a11e14d8",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 14,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w3",
        "candidateObservation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w3",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 15,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "f5d3f0493cbd00ed89513d86de4f3dbd57f99aa80cdea2dc7050b5d8a8d5de3b",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "uniquenessToken": "token-4",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 16,
      "actionType": "ENROLL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "participationId": "w4",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "f5d3f0493cbd00ed89513d86de4f3dbd57f99aa80cdea2dc7050b5d8a8d5de3b"
      }
    },
    {
      "sequence": 17,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "79f14b613bc6f9f53c82cca458d864e7b0cc9d7555c4dbdbed6315ef07c45456",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w4",
          "commitmentHash": "79f14b613bc6f9f53c82cca458d864e7b0cc9d7555c4dbdbed6315ef07c45456",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-2-split",
            "participationId": "w4",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-2-split",
                "claimId": "claim-org-w4",
                "subjectParticipationId": "w4",
                "claimType": "organization",
                "value": {
                  "org": "org-4"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w4",
                  "proofRef": "proof-w4"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w4",
          "observedAt": 150,
          "report": {
            "occurred": false
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w4",
          "observationHash": "a1491f8b759d98705950637a397b3af7f7c8c1add0da1e532f59b7f662ca769f",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 18,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w4",
        "candidateObservation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w4",
          "observedAt": 150,
          "report": {
            "occurred": false
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 19,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "cb2e2cd1bf2f2c4e62baf17adbdd8bc21c5fb22ec1147da27dfc090fa7575c49",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "uniquenessToken": "token-5",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 20,
      "actionType": "ENROLL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "participationId": "w5",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "cb2e2cd1bf2f2c4e62baf17adbdd8bc21c5fb22ec1147da27dfc090fa7575c49"
      }
    },
    {
      "sequence": 21,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "68dd046c2a1a712a3f4b2ac25e2e8b072cddc707a40169aadf4f7192299c0574",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w5",
          "commitmentHash": "68dd046c2a1a712a3f4b2ac25e2e8b072cddc707a40169aadf4f7192299c0574",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-2-split",
            "participationId": "w5",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-2-split",
                "claimId": "claim-org-w5",
                "subjectParticipationId": "w5",
                "claimType": "organization",
                "value": {
                  "org": "org-5"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w5",
                  "proofRef": "proof-w5"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w5",
          "observedAt": 150,
          "report": {
            "occurred": false
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w5",
          "observationHash": "7b88cfb173d6e9fd02ed937c9ed1f66c52332b94bb54d1cc8dbdb4e988992d5e",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 22,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split",
        "witnessParticipationId": "w5",
        "candidateObservation": {
          "eventId": "e2e-2-split",
          "witnessParticipationId": "w5",
          "observedAt": 150,
          "report": {
            "occurred": false
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 23,
      "actionType": "BEGIN_FINALIZATION",
      "actorId": "protocol-runtime",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 400,
      "clientTimestamp": null,
      "recordRef": "e2e-2-split",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-2-split"
      }
    }
  ],
  "disqualifications": [],
  "claimedObservationOutcomes": [
    {
      "participationId": "w1",
      "sequence": 6,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w2",
      "sequence": 10,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w3",
      "sequence": 14,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w4",
      "sequence": 18,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w5",
      "sequence": 22,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    }
  ],
  "claimedAdmittedObservations": [
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w1",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w2",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w3",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w4",
      "observedAt": 150,
      "report": {
        "occurred": false
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-2-split",
      "witnessParticipationId": "w5",
      "observedAt": 150,
      "report": {
        "occurred": false
      },
      "evidenceManifestHash": null
    }
  ],
  "claimedRelationGraph": {
    "eventId": "e2e-2-split",
    "policy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "participantIds": [
      "w1",
      "w2",
      "w3",
      "w4",
      "w5"
    ],
    "dimensions": [
      "organization"
    ],
    "relations": [
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w2",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w2"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w3",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w3"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w3",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w3"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w3",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w3",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w3",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w3",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w4",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_DISTINCT",
        "claimIds": [
          "claim-org-w4",
          "claim-org-w5"
        ]
      }
    ],
    "conflicts": []
  },
  "claimedSufficiencyEvaluation": {
    "eventId": "e2e-2-split",
    "policy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "requirements": [
      {
        "requirementId": "minimum-observations",
        "operator": "MIN_ACCEPTED_OBSERVATIONS",
        "parameters": {
          "minimum": 3
        },
        "observedValue": 5,
        "passed": true,
        "claimIds": [],
        "relationKeys": []
      },
      {
        "requirementId": "distinct-organizations",
        "operator": "MIN_DISTINCT_VERIFIED_VALUES",
        "parameters": {
          "dimension": "organization",
          "minimum": 3
        },
        "observedValue": 5,
        "passed": true,
        "claimIds": [
          "claim-org-w1",
          "claim-org-w2",
          "claim-org-w3",
          "claim-org-w4",
          "claim-org-w5"
        ],
        "relationKeys": []
      }
    ],
    "overallSufficient": true
  },
  "claimedAggregationResult": {
    "eventId": "e2e-2-split",
    "policy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "reducer": "EXACT_MATCH",
    "materialClaimPath": [
      "occurred"
    ],
    "assessment": "MATERIALLY_DIVIDED",
    "values": [
      {
        "canonicalValue": false,
        "observationCount": 2,
        "participationIds": [
          "w4",
          "w5"
        ]
      },
      {
        "canonicalValue": true,
        "observationCount": 3,
        "participationIds": [
          "w1",
          "w2",
          "w3"
        ]
      }
    ]
  },
  "claimedEpistemicState": "SPLIT"
}
```

Derived RelationGraph (POWIT_V0_RELATION_GRAPH):

```json
{
  "eventId": "e2e-2-split",
  "policy": {
    "policyId": "relations-1",
    "policyVersion": "1",
    "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
  },
  "participantIds": [
    "w1",
    "w2",
    "w3",
    "w4",
    "w5"
  ],
  "dimensions": [
    "organization"
  ],
  "relations": [
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w2",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w2"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w3",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w3"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w3",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w3"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w3",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w3",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w3",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w3",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w4",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_DISTINCT",
      "claimIds": [
        "claim-org-w4",
        "claim-org-w5"
      ]
    }
  ],
  "conflicts": []
}
```

Derived SufficiencyEvaluation (POWIT_V0_SUFFICIENCY):

```json
{
  "eventId": "e2e-2-split",
  "policy": {
    "policyId": "sufficiency-1",
    "policyVersion": "1",
    "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
  },
  "requirements": [
    {
      "requirementId": "minimum-observations",
      "operator": "MIN_ACCEPTED_OBSERVATIONS",
      "parameters": {
        "minimum": 3
      },
      "observedValue": 5,
      "passed": true,
      "claimIds": [],
      "relationKeys": []
    },
    {
      "requirementId": "distinct-organizations",
      "operator": "MIN_DISTINCT_VERIFIED_VALUES",
      "parameters": {
        "dimension": "organization",
        "minimum": 3
      },
      "observedValue": 5,
      "passed": true,
      "claimIds": [
        "claim-org-w1",
        "claim-org-w2",
        "claim-org-w3",
        "claim-org-w4",
        "claim-org-w5"
      ],
      "relationKeys": []
    }
  ],
  "overallSufficient": true
}
```

Derived AggregationResult (POWIT_V0_AGGREGATION):

```json
{
  "eventId": "e2e-2-split",
  "policy": {
    "policyId": "aggregation-1",
    "policyVersion": "1",
    "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
  },
  "reducer": "EXACT_MATCH",
  "materialClaimPath": [
    "occurred"
  ],
  "assessment": "MATERIALLY_DIVIDED",
  "values": [
    {
      "canonicalValue": false,
      "observationCount": 2,
      "participationIds": [
        "w4",
        "w5"
      ]
    },
    {
      "canonicalValue": true,
      "observationCount": 3,
      "participationIds": [
        "w1",
        "w2",
        "w3"
      ]
    }
  ]
}
```

Canonical Attestation input (POWIT_V0_ATTESTATION):

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "e2e-2-split",
  "eventHash": "fb7c37c1474ea0e787af27602d6a67b98dbbfd9e92f2893d5c3a3241cadfbd03",
  "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
  "acceptedParticipationSetHash": "3e09c3346effc8d144a57b19ef22707da2a030b2b22ebc746f7ae330bd50d411",
  "acceptedObservationSetHash": "b4b18c5bc4b3bac748330ff1475bcc65799b0afe2d79393e953f8c843f8eab7f",
  "relationGraphHash": "39cfb79619bcdfa9dd0f94889e46b93f9aa71edcb5647eff8328d4a930099bc6",
  "sufficiencyEvaluationHash": "9a0639dab8292d498bc3e120fc4ab40c7063407a3702a63a09fbafccb80edbb5",
  "aggregationResultHash": "0d415197612b0dbd7315e1593a6229a7aac1140207708763956a97abad2f91d9",
  "replayInputHash": "d948a0c333627d1a7d8a889d17f9941be9c890cfa71e60e688c5c0d8cc843f4c",
  "epistemicState": "SPLIT",
  "version": 1,
  "supersedes": null,
  "finalizingAt": 400
}
```

Exact hashes:

| Input | SHA-256 |
| --- | --- |
| EventSchema | `0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18` |
| EventDefinition | `fb7c37c1474ea0e787af27602d6a67b98dbbfd9e92f2893d5c3a3241cadfbd03` |
| accepted WitnessParticipation set | `3e09c3346effc8d144a57b19ef22707da2a030b2b22ebc746f7ae330bd50d411` |
| admitted Observation set | `b4b18c5bc4b3bac748330ff1475bcc65799b0afe2d79393e953f8c843f8eab7f` |
| RelationGraph | `39cfb79619bcdfa9dd0f94889e46b93f9aa71edcb5647eff8328d4a930099bc6` |
| SufficiencyEvaluation | `9a0639dab8292d498bc3e120fc4ab40c7063407a3702a63a09fbafccb80edbb5` |
| AggregationResult | `0d415197612b0dbd7315e1593a6229a7aac1140207708763956a97abad2f91d9` |
| ReplayBundle | `d948a0c333627d1a7d8a889d17f9941be9c890cfa71e60e688c5c0d8cc843f4c` |
| Attestation | `c19c1ac53ea15f279e4fe5d2f8a537c8aafc61b0d56b65e92e31927cea3dc34d` |

#### E2E-3 THIN → THIN

ReplayBundle full structured input (hash domain POWIT_V0_REPLAY_INPUTS):

```json
{
  "protocolVersion": "powit-v0",
  "eventSchema": {
    "protocolVersion": "powit-v0",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "observationSchema": {
      "policyId": "observation-1",
      "policyVersion": "1",
      "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
    },
    "witnessEligibilityPolicy": {
      "policyId": "eligibility-1",
      "policyVersion": "1",
      "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
    },
    "requiredClaims": [],
    "relationPolicy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "relationalDiversityPolicy": {
      "policyId": "diversity-1",
      "policyVersion": "1",
      "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
    },
    "sufficiencyPolicy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "aggregationPolicy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "timingPolicy": {
      "policyId": "timing-1",
      "policyVersion": "1",
      "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
    },
    "evidencePolicy": null,
    "authenticationPolicy": null,
    "challengePolicy": null
  },
  "policyDefinitions": [
    {
      "policy": {
        "policyId": "aggregation-1",
        "policyVersion": "1",
        "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
      },
      "definition": {
        "policyKind": "AGGREGATION_V0",
        "reducer": "EXACT_MATCH"
      }
    },
    {
      "policy": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "definition": {
        "policyKind": "UPSTREAM_ASSURANCE_METHOD_V0",
        "provider": "fixture-provider",
        "method": "controlled-deterministic-test-issuer"
      }
    },
    {
      "policy": {
        "policyId": "diversity-1",
        "policyVersion": "1",
        "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
      },
      "definition": {
        "policyKind": "RELATIONAL_DIVERSITY_V0",
        "distinctValueDimensions": [
          "organization"
        ]
      }
    },
    {
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "definition": {
        "policyKind": "WITNESS_ELIGIBILITY_V0",
        "assuranceProviders": [
          "fixture-provider"
        ],
        "acceptedAssuranceMethods": [
          {
            "policyId": "assurance-method-1",
            "policyVersion": "1",
            "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
          }
        ],
        "disqualificationAuthorities": [
          "fixture-provider"
        ]
      }
    },
    {
      "policy": {
        "policyId": "observation-1",
        "policyVersion": "1",
        "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
      },
      "definition": {
        "policyKind": "OBSERVATION_SCHEMA_V0",
        "requiredPaths": [
          [
            "occurred"
          ]
        ],
        "materialClaimPath": [
          "occurred"
        ],
        "abstentionPath": [
          "abstain"
        ]
      }
    },
    {
      "policy": {
        "policyId": "relations-1",
        "policyVersion": "1",
        "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
      },
      "definition": {
        "policyKind": "RELATION_CLAIM_VALUE_EQUALITY_V0",
        "dimensions": [
          {
            "dimensionId": "organization",
            "claimType": "organization",
            "claimPath": [
              "org"
            ],
            "valueType": "STRING",
            "normalization": "JCS_VALUE",
            "relevantAt": "QUALIFICATION_RELEVANT_AT",
            "acceptedVerificationPolicies": [
              {
                "policyId": "verification-1",
                "policyVersion": "1",
                "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
              }
            ]
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "sufficiency-1",
        "policyVersion": "1",
        "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
      },
      "definition": {
        "policyKind": "SUFFICIENCY_V0",
        "requirements": [
          {
            "requirementId": "minimum-observations",
            "operator": "MIN_ACCEPTED_OBSERVATIONS",
            "minimum": 3
          },
          {
            "requirementId": "distinct-organizations",
            "operator": "MIN_DISTINCT_VERIFIED_VALUES",
            "dimension": "organization",
            "minimum": 3
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "timing-1",
        "policyVersion": "1",
        "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
      },
      "definition": {
        "policyKind": "TIMING_V0",
        "observationTimeAuthority": "PROTOCOL_ACCEPTANCE",
        "allowObservationCommitOverlap": true
      }
    },
    {
      "policy": {
        "policyId": "verification-1",
        "policyVersion": "1",
        "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
      },
      "definition": {
        "policyKind": "CLAIM_VERIFICATION_V0",
        "issuerId": "fixture-issuer"
      }
    }
  ],
  "eventDefinition": {
    "protocolVersion": "powit-v0",
    "eventId": "e2e-3-thin",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
    "windows": {
      "enrollmentOpensAt": 10,
      "enrollmentClosesAt": 100,
      "observationOpensAt": 100,
      "observationClosesAt": 300,
      "commitOpensAt": 100,
      "commitClosesAt": 300,
      "revealOpensAt": 300,
      "revealClosesAt": 400
    },
    "configuration": {}
  },
  "lifecycle": [
    {
      "sequence": 1,
      "from": null,
      "to": "DRAFT",
      "authoritativeAt": 0
    },
    {
      "sequence": 2,
      "from": "DRAFT",
      "to": "ACTIVE",
      "authoritativeAt": 0
    },
    {
      "sequence": 23,
      "from": "ACTIVE",
      "to": "FINALIZING",
      "authoritativeAt": 400
    }
  ],
  "uniquenessAssertions": [
    {
      "eventId": "e2e-3-thin",
      "uniquenessToken": "token-1",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-3-thin",
      "uniquenessToken": "token-2",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-3-thin",
      "uniquenessToken": "token-3",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-3-thin",
      "uniquenessToken": "token-4",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-3-thin",
      "uniquenessToken": "token-5",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    }
  ],
  "participations": [
    {
      "eventId": "e2e-3-thin",
      "participationId": "w1",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "85870676ee6967388c1f6caf38f8cb1db5a74abc123c3585fda5a26d97989928"
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w2",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "39a070f27999e88a6e1e8248a238fc3804d0b481b53b0aaef75532d80dc22091"
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w3",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "f94aea3059114f0dc220bc9fd5f7784f2d692fb000365ca7feff8602f4550a23"
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w4",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "22a6d93420861f53607335fd12c8b79e03e62e7115f94c8e92e915772dc67861"
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w5",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "de7b7683b3bb07086d94c81751f2b5103343e6fe4792fca08984eea14b10d722"
    }
  ],
  "qualificationSnapshots": [
    {
      "eventId": "e2e-3-thin",
      "participationId": "w1",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-3-thin",
          "claimId": "claim-org-w1",
          "subjectParticipationId": "w1",
          "claimType": "organization",
          "value": {
            "org": "org-shared"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w1",
            "proofRef": "proof-w1"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w2",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-3-thin",
          "claimId": "claim-org-w2",
          "subjectParticipationId": "w2",
          "claimType": "organization",
          "value": {
            "org": "org-shared"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w2",
            "proofRef": "proof-w2"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w3",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-3-thin",
          "claimId": "claim-org-w3",
          "subjectParticipationId": "w3",
          "claimType": "organization",
          "value": {
            "org": "org-shared"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w3",
            "proofRef": "proof-w3"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w4",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-3-thin",
          "claimId": "claim-org-w4",
          "subjectParticipationId": "w4",
          "claimType": "organization",
          "value": {
            "org": "org-shared"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w4",
            "proofRef": "proof-w4"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    },
    {
      "eventId": "e2e-3-thin",
      "participationId": "w5",
      "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "evaluatedAt": 200,
      "relevantAt": 150,
      "claims": [
        {
          "eventId": "e2e-3-thin",
          "claimId": "claim-org-w5",
          "subjectParticipationId": "w5",
          "claimType": "organization",
          "value": {
            "org": "org-shared"
          },
          "credential": {
            "issuerId": "fixture-issuer",
            "credentialRef": "credential-w5",
            "proofRef": "proof-w5"
          },
          "provenance": "CREDENTIAL",
          "verificationState": "VERIFIED",
          "verificationPolicy": {
            "policyId": "verification-1",
            "policyVersion": "1",
            "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
          },
          "validFrom": 0,
          "validUntil": 1000
        }
      ],
      "eligible": true
    }
  ],
  "commitments": [
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w1",
      "commitmentHash": "e6a6fcd85c3d218ad497b0ba4469099ab3198e04f3c33507c7e75c60c5f6e178",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-3-thin",
        "participationId": "w1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-3-thin",
            "claimId": "claim-org-w1",
            "subjectParticipationId": "w1",
            "claimType": "organization",
            "value": {
              "org": "org-shared"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w1",
              "proofRef": "proof-w1"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w2",
      "commitmentHash": "4438bc81e2498fe875d5411525b22531096daf759434ddb722c64bb286ecc3ff",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-3-thin",
        "participationId": "w2",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-3-thin",
            "claimId": "claim-org-w2",
            "subjectParticipationId": "w2",
            "claimType": "organization",
            "value": {
              "org": "org-shared"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w2",
              "proofRef": "proof-w2"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w3",
      "commitmentHash": "f4c90f857e12379463de3b14f3df51d51cbbdf57513d8aab5acab68c246d8d55",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-3-thin",
        "participationId": "w3",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-3-thin",
            "claimId": "claim-org-w3",
            "subjectParticipationId": "w3",
            "claimType": "organization",
            "value": {
              "org": "org-shared"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w3",
              "proofRef": "proof-w3"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w4",
      "commitmentHash": "c10ee4454ca985b2b7ccd1ee334e55cac06a3fbacf1c8009cad679a319a5f648",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-3-thin",
        "participationId": "w4",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-3-thin",
            "claimId": "claim-org-w4",
            "subjectParticipationId": "w4",
            "claimType": "organization",
            "value": {
              "org": "org-shared"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w4",
              "proofRef": "proof-w4"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w5",
      "commitmentHash": "4aaf3134d7c0cc292d2c403ad5c55022dd105490fe07be06686b2c1e2ca7b826",
      "acceptedAt": 200,
      "qualificationSnapshot": {
        "eventId": "e2e-3-thin",
        "participationId": "w5",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "policy": {
          "policyId": "eligibility-1",
          "policyVersion": "1",
          "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
        },
        "evaluatedAt": 200,
        "relevantAt": 150,
        "claims": [
          {
            "eventId": "e2e-3-thin",
            "claimId": "claim-org-w5",
            "subjectParticipationId": "w5",
            "claimType": "organization",
            "value": {
              "org": "org-shared"
            },
            "credential": {
              "issuerId": "fixture-issuer",
              "credentialRef": "credential-w5",
              "proofRef": "proof-w5"
            },
            "provenance": "CREDENTIAL",
            "verificationState": "VERIFIED",
            "verificationPolicy": {
              "policyId": "verification-1",
              "policyVersion": "1",
              "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
            },
            "validFrom": 0,
            "validUntil": 1000
          }
        ],
        "eligible": true
      }
    }
  ],
  "reveals": [
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w1",
      "candidateObservation": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w1",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w2",
      "candidateObservation": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w2",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w3",
      "candidateObservation": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w3",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w4",
      "candidateObservation": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w4",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w5",
      "candidateObservation": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w5",
        "observedAt": 150,
        "report": {
          "occurred": true
        },
        "evidenceManifestHash": null
      },
      "evidenceManifest": null,
      "salt": "0000000000000000000000000000000000000000000000000000000000000000",
      "receivedAt": 300,
      "validation": "ADMITTED_OBSERVATION",
      "validationReasons": []
    }
  ],
  "intakeDecisions": [
    {
      "sequence": 1,
      "actionType": "CREATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-3-thin",
      "reasonCodes": [],
      "input": {
        "protocolVersion": "powit-v0",
        "eventId": "e2e-3-thin",
        "schemaId": "fixture-schema",
        "schemaVersion": "1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "windows": {
          "enrollmentOpensAt": 10,
          "enrollmentClosesAt": 100,
          "observationOpensAt": 100,
          "observationClosesAt": 300,
          "commitOpensAt": 100,
          "commitClosesAt": 300,
          "revealOpensAt": 300,
          "revealClosesAt": 400
        },
        "configuration": {}
      }
    },
    {
      "sequence": 2,
      "actionType": "ACTIVATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-3-thin",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin"
      }
    },
    {
      "sequence": 3,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "85870676ee6967388c1f6caf38f8cb1db5a74abc123c3585fda5a26d97989928",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "uniquenessToken": "token-1",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 4,
      "actionType": "ENROLL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "participationId": "w1",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "85870676ee6967388c1f6caf38f8cb1db5a74abc123c3585fda5a26d97989928"
      }
    },
    {
      "sequence": 5,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "e6a6fcd85c3d218ad497b0ba4469099ab3198e04f3c33507c7e75c60c5f6e178",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w1",
          "commitmentHash": "e6a6fcd85c3d218ad497b0ba4469099ab3198e04f3c33507c7e75c60c5f6e178",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-3-thin",
            "participationId": "w1",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-3-thin",
                "claimId": "claim-org-w1",
                "subjectParticipationId": "w1",
                "claimType": "organization",
                "value": {
                  "org": "org-shared"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w1",
                  "proofRef": "proof-w1"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w1",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w1",
          "observationHash": "cec4b181aa7f90e6a2b365360ea1a913acf2caced281ffe5cf48e8d5609106d4",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 6,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w1",
        "candidateObservation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w1",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 7,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "39a070f27999e88a6e1e8248a238fc3804d0b481b53b0aaef75532d80dc22091",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "uniquenessToken": "token-2",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 8,
      "actionType": "ENROLL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "participationId": "w2",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "39a070f27999e88a6e1e8248a238fc3804d0b481b53b0aaef75532d80dc22091"
      }
    },
    {
      "sequence": 9,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "4438bc81e2498fe875d5411525b22531096daf759434ddb722c64bb286ecc3ff",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w2",
          "commitmentHash": "4438bc81e2498fe875d5411525b22531096daf759434ddb722c64bb286ecc3ff",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-3-thin",
            "participationId": "w2",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-3-thin",
                "claimId": "claim-org-w2",
                "subjectParticipationId": "w2",
                "claimType": "organization",
                "value": {
                  "org": "org-shared"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w2",
                  "proofRef": "proof-w2"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w2",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w2",
          "observationHash": "bd0ee32df4ecff1b8cf54ee205b955e48c25f442320f889fb090f12caf86fc60",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 10,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w2",
        "candidateObservation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w2",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 11,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "f94aea3059114f0dc220bc9fd5f7784f2d692fb000365ca7feff8602f4550a23",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "uniquenessToken": "token-3",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 12,
      "actionType": "ENROLL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "participationId": "w3",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "f94aea3059114f0dc220bc9fd5f7784f2d692fb000365ca7feff8602f4550a23"
      }
    },
    {
      "sequence": 13,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "f4c90f857e12379463de3b14f3df51d51cbbdf57513d8aab5acab68c246d8d55",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w3",
          "commitmentHash": "f4c90f857e12379463de3b14f3df51d51cbbdf57513d8aab5acab68c246d8d55",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-3-thin",
            "participationId": "w3",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-3-thin",
                "claimId": "claim-org-w3",
                "subjectParticipationId": "w3",
                "claimType": "organization",
                "value": {
                  "org": "org-shared"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w3",
                  "proofRef": "proof-w3"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w3",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w3",
          "observationHash": "a4c199f5f9f0651adac5f22a4c770534b3a56472f0934f35cc36382b5c2d2023",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 14,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w3",
        "candidateObservation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w3",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 15,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "22a6d93420861f53607335fd12c8b79e03e62e7115f94c8e92e915772dc67861",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "uniquenessToken": "token-4",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 16,
      "actionType": "ENROLL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "participationId": "w4",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "22a6d93420861f53607335fd12c8b79e03e62e7115f94c8e92e915772dc67861"
      }
    },
    {
      "sequence": 17,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "c10ee4454ca985b2b7ccd1ee334e55cac06a3fbacf1c8009cad679a319a5f648",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w4",
          "commitmentHash": "c10ee4454ca985b2b7ccd1ee334e55cac06a3fbacf1c8009cad679a319a5f648",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-3-thin",
            "participationId": "w4",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-3-thin",
                "claimId": "claim-org-w4",
                "subjectParticipationId": "w4",
                "claimType": "organization",
                "value": {
                  "org": "org-shared"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w4",
                  "proofRef": "proof-w4"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w4",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w4",
          "observationHash": "c98ba488a431fbc97548a75a1e86d65769dadd81ae94cad36597842ddf674d80",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 18,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w4",
        "candidateObservation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w4",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 19,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "de7b7683b3bb07086d94c81751f2b5103343e6fe4792fca08984eea14b10d722",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "uniquenessToken": "token-5",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 20,
      "actionType": "ENROLL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "participationId": "w5",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "de7b7683b3bb07086d94c81751f2b5103343e6fe4792fca08984eea14b10d722"
      }
    },
    {
      "sequence": 21,
      "actionType": "ACCEPT_COMMITMENT",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 200,
      "clientTimestamp": 999999,
      "recordRef": "4aaf3134d7c0cc292d2c403ad5c55022dd105490fe07be06686b2c1e2ca7b826",
      "reasonCodes": [],
      "input": {
        "commitment": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w5",
          "commitmentHash": "4aaf3134d7c0cc292d2c403ad5c55022dd105490fe07be06686b2c1e2ca7b826",
          "acceptedAt": 200,
          "qualificationSnapshot": {
            "eventId": "e2e-3-thin",
            "participationId": "w5",
            "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
            "policy": {
              "policyId": "eligibility-1",
              "policyVersion": "1",
              "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
            },
            "evaluatedAt": 200,
            "relevantAt": 150,
            "claims": [
              {
                "eventId": "e2e-3-thin",
                "claimId": "claim-org-w5",
                "subjectParticipationId": "w5",
                "claimType": "organization",
                "value": {
                  "org": "org-shared"
                },
                "credential": {
                  "issuerId": "fixture-issuer",
                  "credentialRef": "credential-w5",
                  "proofRef": "proof-w5"
                },
                "provenance": "CREDENTIAL",
                "verificationState": "VERIFIED",
                "verificationPolicy": {
                  "policyId": "verification-1",
                  "policyVersion": "1",
                  "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
                },
                "validFrom": 0,
                "validUntil": 1000
              }
            ],
            "eligible": true
          }
        },
        "observation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w5",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "preimage": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w5",
          "observationHash": "9e68aa617dd551beb2d452a762cbc4965d5441eb79b4b794aaa6892364a89d28",
          "evidenceManifestHash": null,
          "salt": "0000000000000000000000000000000000000000000000000000000000000000"
        }
      }
    },
    {
      "sequence": 22,
      "actionType": "ACCEPT_REVEAL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 300,
      "clientTimestamp": null,
      "recordRef": "reveal-w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin",
        "witnessParticipationId": "w5",
        "candidateObservation": {
          "eventId": "e2e-3-thin",
          "witnessParticipationId": "w5",
          "observedAt": 150,
          "report": {
            "occurred": true
          },
          "evidenceManifestHash": null
        },
        "evidenceManifest": null,
        "salt": "0000000000000000000000000000000000000000000000000000000000000000",
        "receivedAt": 300,
        "validation": "ADMITTED_OBSERVATION",
        "validationReasons": []
      }
    },
    {
      "sequence": 23,
      "actionType": "BEGIN_FINALIZATION",
      "actorId": "protocol-runtime",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 400,
      "clientTimestamp": null,
      "recordRef": "e2e-3-thin",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-3-thin"
      }
    }
  ],
  "disqualifications": [],
  "claimedObservationOutcomes": [
    {
      "participationId": "w1",
      "sequence": 6,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w2",
      "sequence": 10,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w3",
      "sequence": 14,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w4",
      "sequence": 18,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    },
    {
      "participationId": "w5",
      "sequence": 22,
      "outcome": "ADMITTED_OBSERVATION",
      "reasonCodes": []
    }
  ],
  "claimedAdmittedObservations": [
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w1",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w2",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w3",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w4",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    },
    {
      "eventId": "e2e-3-thin",
      "witnessParticipationId": "w5",
      "observedAt": 150,
      "report": {
        "occurred": true
      },
      "evidenceManifestHash": null
    }
  ],
  "claimedRelationGraph": {
    "eventId": "e2e-3-thin",
    "policy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "participantIds": [
      "w1",
      "w2",
      "w3",
      "w4",
      "w5"
    ],
    "dimensions": [
      "organization"
    ],
    "relations": [
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w2",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w2"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w3",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w3"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w1",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w1",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w3",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w3"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w2",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w2",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w3",
        "rightParticipationId": "w4",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w3",
          "claim-org-w4"
        ]
      },
      {
        "leftParticipationId": "w3",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w3",
          "claim-org-w5"
        ]
      },
      {
        "leftParticipationId": "w4",
        "rightParticipationId": "w5",
        "dimension": "organization",
        "status": "KNOWN_RELATED",
        "claimIds": [
          "claim-org-w4",
          "claim-org-w5"
        ]
      }
    ],
    "conflicts": []
  },
  "claimedSufficiencyEvaluation": {
    "eventId": "e2e-3-thin",
    "policy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "requirements": [
      {
        "requirementId": "minimum-observations",
        "operator": "MIN_ACCEPTED_OBSERVATIONS",
        "parameters": {
          "minimum": 3
        },
        "observedValue": 5,
        "passed": true,
        "claimIds": [],
        "relationKeys": []
      },
      {
        "requirementId": "distinct-organizations",
        "operator": "MIN_DISTINCT_VERIFIED_VALUES",
        "parameters": {
          "dimension": "organization",
          "minimum": 3
        },
        "observedValue": 1,
        "passed": false,
        "claimIds": [
          "claim-org-w1",
          "claim-org-w2",
          "claim-org-w3",
          "claim-org-w4",
          "claim-org-w5"
        ],
        "relationKeys": []
      }
    ],
    "overallSufficient": false
  },
  "claimedAggregationResult": {
    "eventId": "e2e-3-thin",
    "policy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "reducer": "EXACT_MATCH",
    "materialClaimPath": [
      "occurred"
    ],
    "assessment": "CONVERGENT",
    "values": [
      {
        "canonicalValue": true,
        "observationCount": 5,
        "participationIds": [
          "w1",
          "w2",
          "w3",
          "w4",
          "w5"
        ]
      }
    ]
  },
  "claimedEpistemicState": "THIN"
}
```

Derived RelationGraph (POWIT_V0_RELATION_GRAPH):

```json
{
  "eventId": "e2e-3-thin",
  "policy": {
    "policyId": "relations-1",
    "policyVersion": "1",
    "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
  },
  "participantIds": [
    "w1",
    "w2",
    "w3",
    "w4",
    "w5"
  ],
  "dimensions": [
    "organization"
  ],
  "relations": [
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w2",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w2"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w3",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w3"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w1",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w1",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w3",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w3"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w2",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w2",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w3",
      "rightParticipationId": "w4",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w3",
        "claim-org-w4"
      ]
    },
    {
      "leftParticipationId": "w3",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w3",
        "claim-org-w5"
      ]
    },
    {
      "leftParticipationId": "w4",
      "rightParticipationId": "w5",
      "dimension": "organization",
      "status": "KNOWN_RELATED",
      "claimIds": [
        "claim-org-w4",
        "claim-org-w5"
      ]
    }
  ],
  "conflicts": []
}
```

Derived SufficiencyEvaluation (POWIT_V0_SUFFICIENCY):

```json
{
  "eventId": "e2e-3-thin",
  "policy": {
    "policyId": "sufficiency-1",
    "policyVersion": "1",
    "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
  },
  "requirements": [
    {
      "requirementId": "minimum-observations",
      "operator": "MIN_ACCEPTED_OBSERVATIONS",
      "parameters": {
        "minimum": 3
      },
      "observedValue": 5,
      "passed": true,
      "claimIds": [],
      "relationKeys": []
    },
    {
      "requirementId": "distinct-organizations",
      "operator": "MIN_DISTINCT_VERIFIED_VALUES",
      "parameters": {
        "dimension": "organization",
        "minimum": 3
      },
      "observedValue": 1,
      "passed": false,
      "claimIds": [
        "claim-org-w1",
        "claim-org-w2",
        "claim-org-w3",
        "claim-org-w4",
        "claim-org-w5"
      ],
      "relationKeys": []
    }
  ],
  "overallSufficient": false
}
```

Derived AggregationResult (POWIT_V0_AGGREGATION):

```json
{
  "eventId": "e2e-3-thin",
  "policy": {
    "policyId": "aggregation-1",
    "policyVersion": "1",
    "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
  },
  "reducer": "EXACT_MATCH",
  "materialClaimPath": [
    "occurred"
  ],
  "assessment": "CONVERGENT",
  "values": [
    {
      "canonicalValue": true,
      "observationCount": 5,
      "participationIds": [
        "w1",
        "w2",
        "w3",
        "w4",
        "w5"
      ]
    }
  ]
}
```

Canonical Attestation input (POWIT_V0_ATTESTATION):

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "e2e-3-thin",
  "eventHash": "bc119d37bf038fc8f1ea859fc2db72f27e6cdc3c78f663138c7c65139611b5b7",
  "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
  "acceptedParticipationSetHash": "64c216ba6517aa6bad818fc4dedffd0967365759f8646d308c253dcbe1161c0f",
  "acceptedObservationSetHash": "500f190758bec8ef2a774edfa42c9bfaa228fc4f8527dca92a2459331a0a9c8a",
  "relationGraphHash": "6f86f7547741d9a292e4f39ac3cf6969eb431a822e101db09574366f595c3440",
  "sufficiencyEvaluationHash": "b26cad631afa364850e87ee6e922f6976050495b7643a316090067f661d6858c",
  "aggregationResultHash": "895e282b79d09434e1950e2e960cac44e4a14eab74c90b2558d9b46ddabe3273",
  "replayInputHash": "b1071e4dc392798e61ae1fe96ada0c568ec47d51cb48e16f049bc46a1b1afb62",
  "epistemicState": "THIN",
  "version": 1,
  "supersedes": null,
  "finalizingAt": 400
}
```

Exact hashes:

| Input | SHA-256 |
| --- | --- |
| EventSchema | `0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18` |
| EventDefinition | `bc119d37bf038fc8f1ea859fc2db72f27e6cdc3c78f663138c7c65139611b5b7` |
| accepted WitnessParticipation set | `64c216ba6517aa6bad818fc4dedffd0967365759f8646d308c253dcbe1161c0f` |
| admitted Observation set | `500f190758bec8ef2a774edfa42c9bfaa228fc4f8527dca92a2459331a0a9c8a` |
| RelationGraph | `6f86f7547741d9a292e4f39ac3cf6969eb431a822e101db09574366f595c3440` |
| SufficiencyEvaluation | `b26cad631afa364850e87ee6e922f6976050495b7643a316090067f661d6858c` |
| AggregationResult | `895e282b79d09434e1950e2e960cac44e4a14eab74c90b2558d9b46ddabe3273` |
| ReplayBundle | `b1071e4dc392798e61ae1fe96ada0c568ec47d51cb48e16f049bc46a1b1afb62` |
| Attestation | `758652a08d992811631734eb45208569cfc2f8ea24c2b40d84af40f5f5e1d718` |

#### E2E-4 SILENT → SILENT

ReplayBundle full structured input (hash domain POWIT_V0_REPLAY_INPUTS):

```json
{
  "protocolVersion": "powit-v0",
  "eventSchema": {
    "protocolVersion": "powit-v0",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "observationSchema": {
      "policyId": "observation-1",
      "policyVersion": "1",
      "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
    },
    "witnessEligibilityPolicy": {
      "policyId": "eligibility-1",
      "policyVersion": "1",
      "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
    },
    "requiredClaims": [],
    "relationPolicy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "relationalDiversityPolicy": {
      "policyId": "diversity-1",
      "policyVersion": "1",
      "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
    },
    "sufficiencyPolicy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "aggregationPolicy": {
      "policyId": "aggregation-1",
      "policyVersion": "1",
      "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
    },
    "timingPolicy": {
      "policyId": "timing-1",
      "policyVersion": "1",
      "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
    },
    "evidencePolicy": null,
    "authenticationPolicy": null,
    "challengePolicy": null
  },
  "policyDefinitions": [
    {
      "policy": {
        "policyId": "aggregation-1",
        "policyVersion": "1",
        "definitionHash": "4a9fe3d36cc3d62f095fec226f247f71ee895b32d5575eab22c75398e8e50d10"
      },
      "definition": {
        "policyKind": "AGGREGATION_V0",
        "reducer": "EXACT_MATCH"
      }
    },
    {
      "policy": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "definition": {
        "policyKind": "UPSTREAM_ASSURANCE_METHOD_V0",
        "provider": "fixture-provider",
        "method": "controlled-deterministic-test-issuer"
      }
    },
    {
      "policy": {
        "policyId": "diversity-1",
        "policyVersion": "1",
        "definitionHash": "a9ef31f0bdb2ce33a82a0902d210f7c51a782e5e192564dbe02f9d2859e37ba2"
      },
      "definition": {
        "policyKind": "RELATIONAL_DIVERSITY_V0",
        "distinctValueDimensions": [
          "organization"
        ]
      }
    },
    {
      "policy": {
        "policyId": "eligibility-1",
        "policyVersion": "1",
        "definitionHash": "9c17a8bb9bfa4879853534710fbb641c0220538965a13a71cb7f5b8e6d77df83"
      },
      "definition": {
        "policyKind": "WITNESS_ELIGIBILITY_V0",
        "assuranceProviders": [
          "fixture-provider"
        ],
        "acceptedAssuranceMethods": [
          {
            "policyId": "assurance-method-1",
            "policyVersion": "1",
            "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
          }
        ],
        "disqualificationAuthorities": [
          "fixture-provider"
        ]
      }
    },
    {
      "policy": {
        "policyId": "observation-1",
        "policyVersion": "1",
        "definitionHash": "267ad88d8574883e8456487d559bb96586846fbcfba7d865320bf29f87e08657"
      },
      "definition": {
        "policyKind": "OBSERVATION_SCHEMA_V0",
        "requiredPaths": [
          [
            "occurred"
          ]
        ],
        "materialClaimPath": [
          "occurred"
        ],
        "abstentionPath": [
          "abstain"
        ]
      }
    },
    {
      "policy": {
        "policyId": "relations-1",
        "policyVersion": "1",
        "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
      },
      "definition": {
        "policyKind": "RELATION_CLAIM_VALUE_EQUALITY_V0",
        "dimensions": [
          {
            "dimensionId": "organization",
            "claimType": "organization",
            "claimPath": [
              "org"
            ],
            "valueType": "STRING",
            "normalization": "JCS_VALUE",
            "relevantAt": "QUALIFICATION_RELEVANT_AT",
            "acceptedVerificationPolicies": [
              {
                "policyId": "verification-1",
                "policyVersion": "1",
                "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
              }
            ]
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "sufficiency-1",
        "policyVersion": "1",
        "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
      },
      "definition": {
        "policyKind": "SUFFICIENCY_V0",
        "requirements": [
          {
            "requirementId": "minimum-observations",
            "operator": "MIN_ACCEPTED_OBSERVATIONS",
            "minimum": 3
          },
          {
            "requirementId": "distinct-organizations",
            "operator": "MIN_DISTINCT_VERIFIED_VALUES",
            "dimension": "organization",
            "minimum": 3
          }
        ]
      }
    },
    {
      "policy": {
        "policyId": "timing-1",
        "policyVersion": "1",
        "definitionHash": "29efab2aa14fa56901e399eeaedd8390e149b4b42481892d0a4f6a66e7297fd3"
      },
      "definition": {
        "policyKind": "TIMING_V0",
        "observationTimeAuthority": "PROTOCOL_ACCEPTANCE",
        "allowObservationCommitOverlap": true
      }
    },
    {
      "policy": {
        "policyId": "verification-1",
        "policyVersion": "1",
        "definitionHash": "f14cf084721b80ac8f1918e331880a73e128b487172dcb29c880ef36523929b7"
      },
      "definition": {
        "policyKind": "CLAIM_VERIFICATION_V0",
        "issuerId": "fixture-issuer"
      }
    }
  ],
  "eventDefinition": {
    "protocolVersion": "powit-v0",
    "eventId": "e2e-4-silent",
    "schemaId": "fixture-schema",
    "schemaVersion": "1",
    "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
    "windows": {
      "enrollmentOpensAt": 10,
      "enrollmentClosesAt": 100,
      "observationOpensAt": 100,
      "observationClosesAt": 300,
      "commitOpensAt": 100,
      "commitClosesAt": 300,
      "revealOpensAt": 300,
      "revealClosesAt": 400
    },
    "configuration": {}
  },
  "lifecycle": [
    {
      "sequence": 1,
      "from": null,
      "to": "DRAFT",
      "authoritativeAt": 0
    },
    {
      "sequence": 2,
      "from": "DRAFT",
      "to": "ACTIVE",
      "authoritativeAt": 0
    },
    {
      "sequence": 13,
      "from": "ACTIVE",
      "to": "FINALIZING",
      "authoritativeAt": 400
    }
  ],
  "uniquenessAssertions": [
    {
      "eventId": "e2e-4-silent",
      "uniquenessToken": "token-1",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-4-silent",
      "uniquenessToken": "token-2",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-4-silent",
      "uniquenessToken": "token-3",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-4-silent",
      "uniquenessToken": "token-4",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    },
    {
      "eventId": "e2e-4-silent",
      "uniquenessToken": "token-5",
      "assuranceProvider": "fixture-provider",
      "assuranceMethod": {
        "policyId": "assurance-method-1",
        "policyVersion": "1",
        "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
      },
      "assertedAt": 50,
      "validUntil": 500
    }
  ],
  "participations": [
    {
      "eventId": "e2e-4-silent",
      "participationId": "w1",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "36457a1f2c95aaf32da1776b5a00d251a73ef48b717a37c1051d4a0f355f43c3"
    },
    {
      "eventId": "e2e-4-silent",
      "participationId": "w2",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "6f28178edb8c703082ca30ccf16ee477640407074ed475513fe543e665817b93"
    },
    {
      "eventId": "e2e-4-silent",
      "participationId": "w3",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "0148da1417c3e284dc02bd2fa438d686edc0d6b74cbdf7a8faf0e8ebee12b756"
    },
    {
      "eventId": "e2e-4-silent",
      "participationId": "w4",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "0fbdce9072a6fae58d17d2ed861f9523fb75c5764037ca3a63341f864d35ad46"
    },
    {
      "eventId": "e2e-4-silent",
      "participationId": "w5",
      "witnessClasses": [
        "observer"
      ],
      "enrolledAt": 50,
      "uniquenessAssertionHash": "ef6544caa56902df617452a7f1699b5f78a5846485e16a614b550ebd1df4f58b"
    }
  ],
  "qualificationSnapshots": [],
  "commitments": [],
  "reveals": [],
  "intakeDecisions": [
    {
      "sequence": 1,
      "actionType": "CREATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-4-silent",
      "reasonCodes": [],
      "input": {
        "protocolVersion": "powit-v0",
        "eventId": "e2e-4-silent",
        "schemaId": "fixture-schema",
        "schemaVersion": "1",
        "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
        "windows": {
          "enrollmentOpensAt": 10,
          "enrollmentClosesAt": 100,
          "observationOpensAt": 100,
          "observationClosesAt": 300,
          "commitOpensAt": 100,
          "commitClosesAt": 300,
          "revealOpensAt": 300,
          "revealClosesAt": 400
        },
        "configuration": {}
      }
    },
    {
      "sequence": 2,
      "actionType": "ACTIVATE_EVENT",
      "actorId": "event-authority",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 0,
      "clientTimestamp": null,
      "recordRef": "e2e-4-silent",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent"
      }
    },
    {
      "sequence": 3,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "36457a1f2c95aaf32da1776b5a00d251a73ef48b717a37c1051d4a0f355f43c3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "uniquenessToken": "token-1",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 4,
      "actionType": "ENROLL",
      "actorId": "actor-1",
      "participationId": "w1",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w1",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "participationId": "w1",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "36457a1f2c95aaf32da1776b5a00d251a73ef48b717a37c1051d4a0f355f43c3"
      }
    },
    {
      "sequence": 5,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "6f28178edb8c703082ca30ccf16ee477640407074ed475513fe543e665817b93",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "uniquenessToken": "token-2",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 6,
      "actionType": "ENROLL",
      "actorId": "actor-2",
      "participationId": "w2",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w2",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "participationId": "w2",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "6f28178edb8c703082ca30ccf16ee477640407074ed475513fe543e665817b93"
      }
    },
    {
      "sequence": 7,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "0148da1417c3e284dc02bd2fa438d686edc0d6b74cbdf7a8faf0e8ebee12b756",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "uniquenessToken": "token-3",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 8,
      "actionType": "ENROLL",
      "actorId": "actor-3",
      "participationId": "w3",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w3",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "participationId": "w3",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "0148da1417c3e284dc02bd2fa438d686edc0d6b74cbdf7a8faf0e8ebee12b756"
      }
    },
    {
      "sequence": 9,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "0fbdce9072a6fae58d17d2ed861f9523fb75c5764037ca3a63341f864d35ad46",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "uniquenessToken": "token-4",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 10,
      "actionType": "ENROLL",
      "actorId": "actor-4",
      "participationId": "w4",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w4",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "participationId": "w4",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "0fbdce9072a6fae58d17d2ed861f9523fb75c5764037ca3a63341f864d35ad46"
      }
    },
    {
      "sequence": 11,
      "actionType": "ASSERT_EVENT_SCOPED_UNIQUENESS",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "ef6544caa56902df617452a7f1699b5f78a5846485e16a614b550ebd1df4f58b",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "uniquenessToken": "token-5",
        "assuranceProvider": "fixture-provider",
        "assuranceMethod": {
          "policyId": "assurance-method-1",
          "policyVersion": "1",
          "definitionHash": "6c3939f9581d59ea5cc3a6a6fe6555a6f81f3db0d56fe0c4c8a10687bb3c9317"
        },
        "assertedAt": 50,
        "validUntil": 500
      }
    },
    {
      "sequence": 12,
      "actionType": "ENROLL",
      "actorId": "actor-5",
      "participationId": "w5",
      "decision": "ACCEPTED",
      "authoritativeAt": 50,
      "clientTimestamp": null,
      "recordRef": "w5",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent",
        "participationId": "w5",
        "witnessClasses": [
          "observer"
        ],
        "enrolledAt": 50,
        "uniquenessAssertionHash": "ef6544caa56902df617452a7f1699b5f78a5846485e16a614b550ebd1df4f58b"
      }
    },
    {
      "sequence": 13,
      "actionType": "BEGIN_FINALIZATION",
      "actorId": "protocol-runtime",
      "participationId": null,
      "decision": "ACCEPTED",
      "authoritativeAt": 400,
      "clientTimestamp": null,
      "recordRef": "e2e-4-silent",
      "reasonCodes": [],
      "input": {
        "eventId": "e2e-4-silent"
      }
    }
  ],
  "disqualifications": [],
  "claimedObservationOutcomes": [],
  "claimedAdmittedObservations": [],
  "claimedRelationGraph": {
    "eventId": "e2e-4-silent",
    "policy": {
      "policyId": "relations-1",
      "policyVersion": "1",
      "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
    },
    "participantIds": [],
    "dimensions": [
      "organization"
    ],
    "relations": [],
    "conflicts": []
  },
  "claimedSufficiencyEvaluation": {
    "eventId": "e2e-4-silent",
    "policy": {
      "policyId": "sufficiency-1",
      "policyVersion": "1",
      "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
    },
    "requirements": [
      {
        "requirementId": "minimum-observations",
        "operator": "MIN_ACCEPTED_OBSERVATIONS",
        "parameters": {
          "minimum": 3
        },
        "observedValue": 0,
        "passed": false,
        "claimIds": [],
        "relationKeys": []
      },
      {
        "requirementId": "distinct-organizations",
        "operator": "MIN_DISTINCT_VERIFIED_VALUES",
        "parameters": {
          "dimension": "organization",
          "minimum": 3
        },
        "observedValue": 0,
        "passed": false,
        "claimIds": [],
        "relationKeys": []
      }
    ],
    "overallSufficient": false
  },
  "claimedAggregationResult": null,
  "claimedEpistemicState": "SILENT"
}
```

Derived RelationGraph (POWIT_V0_RELATION_GRAPH):

```json
{
  "eventId": "e2e-4-silent",
  "policy": {
    "policyId": "relations-1",
    "policyVersion": "1",
    "definitionHash": "2daac105dce8b68896e4af1169e66ee7a1ee3b60497a9ded9a5c1371d4937360"
  },
  "participantIds": [],
  "dimensions": [
    "organization"
  ],
  "relations": [],
  "conflicts": []
}
```

Derived SufficiencyEvaluation (POWIT_V0_SUFFICIENCY):

```json
{
  "eventId": "e2e-4-silent",
  "policy": {
    "policyId": "sufficiency-1",
    "policyVersion": "1",
    "definitionHash": "edb6d241076b2bc81e2d7bd5718f79f57ef81d88228ea7b378506644cdc5d584"
  },
  "requirements": [
    {
      "requirementId": "minimum-observations",
      "operator": "MIN_ACCEPTED_OBSERVATIONS",
      "parameters": {
        "minimum": 3
      },
      "observedValue": 0,
      "passed": false,
      "claimIds": [],
      "relationKeys": []
    },
    {
      "requirementId": "distinct-organizations",
      "operator": "MIN_DISTINCT_VERIFIED_VALUES",
      "parameters": {
        "dimension": "organization",
        "minimum": 3
      },
      "observedValue": 0,
      "passed": false,
      "claimIds": [],
      "relationKeys": []
    }
  ],
  "overallSufficient": false
}
```

Canonical Attestation input (POWIT_V0_ATTESTATION):

```json
{
  "protocolVersion": "powit-v0",
  "eventId": "e2e-4-silent",
  "eventHash": "4b294bbd8227e4a1f777841471d63b565eddad0183e2fae6e15bc75c831f1446",
  "schemaHash": "0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18",
  "acceptedParticipationSetHash": "e0211efad7309cc345c31ab1a1bfddc4261e1f7e4a6cf4d7322c461791ebd29d",
  "acceptedObservationSetHash": "709851e709b045a0d9774b91b7f57598be466b669150cf09e6a591468516a984",
  "relationGraphHash": "f3b67e62735230d7265f72246ce8e1b35c0d7b47a2b0aa6d1af709cc1348795a",
  "sufficiencyEvaluationHash": "69949e1bff1043a0c6d49b2c3b05e8b089d17ad644b6a3833a851b785b0003cf",
  "aggregationResultHash": null,
  "replayInputHash": "063c3121fcb2f1d4e7295c8e4ad361099123018d542e29de1266fdda91de623e",
  "epistemicState": "SILENT",
  "version": 1,
  "supersedes": null,
  "finalizingAt": 400
}
```

Exact hashes:

| Input | SHA-256 |
| --- | --- |
| EventSchema | `0c326be5ddd1941128f34bc011530f03a04109b19ac87c90622c9b045fe0bc18` |
| EventDefinition | `4b294bbd8227e4a1f777841471d63b565eddad0183e2fae6e15bc75c831f1446` |
| accepted WitnessParticipation set | `e0211efad7309cc345c31ab1a1bfddc4261e1f7e4a6cf4d7322c461791ebd29d` |
| admitted Observation set | `709851e709b045a0d9774b91b7f57598be466b669150cf09e6a591468516a984` |
| RelationGraph | `f3b67e62735230d7265f72246ce8e1b35c0d7b47a2b0aa6d1af709cc1348795a` |
| SufficiencyEvaluation | `69949e1bff1043a0c6d49b2c3b05e8b089d17ad644b6a3833a851b785b0003cf` |
| AggregationResult | null (NOT_INVOKED) |
| ReplayBundle | `063c3121fcb2f1d4e7295c8e4ad361099123018d542e29de1266fdda91de623e` |
| Attestation | `8a88efede531fac29d7957c5e0b23cb914156ebf22ab39b0422dc5f2ee4d7d76` |

### Edge-case replay checks

The following deterministic mutations use the complete E2E-1 bundle as their base, apply the listed mutation to its canonical inputs, then recompute all derived outputs and hashes under TYPES. They are outcome fixtures; no additional digest is claimed here. For every case, update affected IntakeDecision sequences contiguously, keep arrays in required sort order, update claimed outputs, and do not treat cached outputs as authority.

| Case | Exact input mutation | Required result |
| --- | --- | --- |
| Duplicate event token | Add an ASSERT_EVENT_SCOPED_UNIQUENESS action after the accepted token-1 assertion, carrying the same Event and token for a new actor; set decision REJECTED and reason DUPLICATE_EVENT_UNIQUENESS_TOKEN; create no assertion, participation, snapshot or commitment from it. | No sixth participation; original token holder and history unchanged.
| Explicit abstention | For w5 set report.occurred=null and report.abstain=true in observation, commitment preimage, commitment hash, reveal input and corresponding records. Keep required path /occurred resolvable. Mark EXPLICIT_ABSTENTION with no reasons. | Four admitted Observations; w5 remains in reveal audit, not accepted sets. State CONCORDANT.
| Negative observation | Use the E2E-2 false values at /occurred; omit abstain:true. | Each false is an admitted meaningful Observation. Mixed canonical values yield MATERIALLY_DIVIDED; with sufficiency true state SPLIT.
| Missing relation claim | Remove w5's organization Claim from its QualificationSnapshot; keep qualification eligible because requiredClaims is empty. The commitment preimage is unchanged; update the snapshot in the commitment and intake input. | Every w5/other participant organization edge is UNKNOWN; other four verified values still meet threshold 3. State CONCORDANT.
| Conflicting relation claims | Add a second w5 VERIFIED organization Claim, valid at relevantAt=150, with a different canonical /org value and accepted verificationPolicy. | Add one RelationConflict containing both claim IDs; every w5 edge on that dimension is UNKNOWN. Four other unique values satisfy threshold; state CONCORDANT.
| UNKNOWN fails diversity | Set w1 and w2 organization to org-1, w3 and w4 to org-2, and omit w5's organization claim. Keep all five report /occurred:true. | Known distinct verified value count is 2; UNKNOWN does not count toward minimum 3; all answers converge but state THIN.
| Client timestamp at late boundary | For w5 set commit IntakeDecision authoritativeAt to commitClosesAt (300), clientTimestamp to 150, decision REJECTED and reason COMMIT_WINDOW_CLOSED. Retain the rejected full attempt input and omit accepted snapshot/commit/reveal/outcome/Observation records. | Client time cannot rescue a late action. Four other observations are replayed; state CONCORDANT.
| Sequence ordering | In E2E-1, multiple actions share each authoritative timestamp. Replay using the recorded contiguous IntakeDecision sequence; a bundle with reordered arrays or duplicate/gapped sequence is invalid. | Replaying the canonical order yields E2E-1 exactly; array order cannot replace sequence authority.
| Pre-finalization disqualification | Add a w5 DisqualificationRecord authorized by fixture-provider after its admitted reveal and before FINALIZING; add the intake entry and shift finalizing sequence. | Keep w5's participation, snapshot, commitment, reveal and admitted Observation in replay history, but exclude it from finalization sets and graph. Four unique organizations remain; state CONCORDANT.

The full input bundle, policy definitions, fixture profile and all base hashes are in E2E-1. These mutations specify exactly which values change; every result is obtained by replay, not by directly assigning an epistemic state.

## PROVISIONAL

The supported kernel profile freezes EXACT_MATCH only. ENUM_DISTRIBUTION, NUMERIC_RANGE, THRESHOLD and STRUCTURED_TALLY remain future candidates. The five-human vectors use clearly identified fixture issuers; their fixture trust roots do not prescribe production identity infrastructure. Corrections and authentication remain disabled unless B05/B06 are resolved.

## OPEN QUESTION

See [the readiness register](POWIT_V0_OPEN_QUESTIONS.md). The four initial-finalization vectors include full replay bundles, policy-derived outputs and exact Attestation hashes. Optional correction and evidence-authentication capabilities remain blocked pending B05/B06.
