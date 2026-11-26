import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { Attestation, ReplayBundle } from '@thoth/powit-types';
import { canonicalize, deriveFinalization, parseJsonStrict, PowitEventSession, rawSha256, replayEvent, structuredHash, verifyAttestation } from '../src/index.ts';
import './session-boundary.test.ts';

const documentation = readFileSync(new URL('../../../protocol/powit/v0/POWIT_V0_TEST_VECTORS.md', import.meta.url), 'utf8');
const codecSections = [...documentation.matchAll(/#### (H\d{2}) — (POWIT_V0_[A-Z_]+)\n([\s\S]*?)(?=\n#### H\d{2}|\n### Raw artifact)/g)];
const e2eSections = [...documentation.matchAll(/#### (E2E-[1-4] [^\n]+)\n([\s\S]*?)(?=\n#### E2E-|\n### Edge-case)/g)];
function jsonBlock(section: string, label: string): unknown {
  const rest = section.split(label)[1]; assert.ok(rest, `Missing ${label}`);
  const match = /```json\n([\s\S]*?)\n```/.exec(rest); assert.ok(match, `Missing JSON after ${label}`);
  return parseJsonStrict(match[1]);
}
function digest(section: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^\\| ${escaped} \\| (?:\\x60([0-9a-f]{64})\\x60|null \\(NOT_INVOKED\\)) \\|$`, 'm').exec(section);
  assert.ok(match, `Missing digest for ${label}`); return match[1] ?? null;
}
const vectors = e2eSections.map(([, title, section]) => ({ title, section, bundle: jsonBlock(section, 'ReplayBundle full structured input') as ReplayBundle }));

test('H01-H20 match documented canonical bytes and SHA-256 domains', () => {
  assert.equal(codecSections.length, 20);
  for (const [, name, domain, section] of codecSections) {
    const input = jsonBlock(section, 'Full structured input:');
    const canonical = /Canonical JSON \(one line\):\n\n```text\n([\s\S]*?)\n```/.exec(section)?.[1];
    assert.ok(canonical, `${name} canonical text`);
    const expected = /Expected SHA-256: `([a-f0-9]{64})`/.exec(section)?.[1];
    assert.ok(expected, `${name} digest`);
    assert.equal(canonicalize(input), canonical, `${name} canonical`);
    assert.equal(structuredHash(domain as Parameters<typeof structuredHash>[0], input), expected, `${name} hash`);
  }
  assert.equal(rawSha256(new Uint8Array()), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('strict parser rejects duplicate keys, rounded unsafe integers and lone surrogates', () => {
  assert.throws(() => parseJsonStrict('{"a":1,"a":2}'));
  assert.throws(() => parseJsonStrict('{"n":9007199254740992}'));
  assert.throws(() => parseJsonStrict('{"n":9007199254740991.1}'));
  assert.throws(() => parseJsonStrict('{"s":"\\ud800"}'));
  assert.equal(canonicalize(parseJsonStrict('{"2":2,"10":10,"n":-0,"a":1.0}')), '{"10":10,"2":2,"a":1,"n":0}');
});

for (const { title, section, bundle } of vectors) {
  test(`${title}: independent replay reproduces every documented digest`, () => {
    const output = replayEvent(bundle);
    assert.equal(output.attestation.epistemicState, title.split(' ')[1]);
    assert.equal(output.attestationHash, digest(section, 'Attestation'));
    assert.equal(output.attestation.replayInputHash, digest(section, 'ReplayBundle'));
    assert.equal(output.attestation.eventHash, digest(section, 'EventDefinition'));
    assert.equal(output.attestation.schemaHash, digest(section, 'EventSchema'));
    assert.equal(output.attestation.acceptedParticipationSetHash, digest(section, 'accepted WitnessParticipation set'));
    assert.equal(output.attestation.acceptedObservationSetHash, digest(section, 'admitted Observation set'));
    assert.equal(output.attestation.relationGraphHash, digest(section, 'RelationGraph'));
    assert.equal(output.attestation.sufficiencyEvaluationHash, digest(section, 'SufficiencyEvaluation'));
    assert.equal(output.attestation.aggregationResultHash, digest(section, 'AggregationResult'));
    const expectedAttestation = jsonBlock(section, 'Canonical Attestation input') as Attestation;
    assert.equal(canonicalize(output.attestation), canonicalize(expectedAttestation));
    assert.deepEqual(verifyAttestation(bundle, expectedAttestation, output.attestationHash).reasonCodes, []);
  });
}

test('five-participant local execution, freeze, replay and verification', () => {
  const fixture = vectors[0].bundle;
  let now = 0;
  const session = new PowitEventSession(fixture.eventSchema, fixture.policyDefinitions, { now: () => now });
  for (const recorded of fixture.intakeDecisions) {
    now = recorded.authoritativeAt;
    const result = session.submit({ actionType: recorded.actionType, actorId: recorded.actorId, participationId: recorded.participationId, input: recorded.input, clientTimestamp: recorded.clientTimestamp });
    assert.equal(canonicalize(result), canonicalize(recorded));
  }
  assert.equal(session.participations.length, 5);
  assert.equal(session.qualificationSnapshots.length, 5);
  assert.equal(session.commitments.length, 5);
  assert.equal(session.reveals.length, 5);
  assert.equal(session.admittedObservations.length, 5);
  const produced = session.finalizeEvent();
  assert.equal(produced.attestation.epistemicState, 'CONCORDANT');
  assert.equal(produced.attestationHash, replayEvent(produced.bundle).attestationHash);
  assert.equal(verifyAttestation(produced.bundle, produced.attestation, produced.attestationHash).valid, true);
  assert.deepEqual(session.finalizeEvent().attestation, produced.attestation);
});

test('altered replay inputs and claimed outputs fail verification', () => {
  const base = vectors[0].bundle;
  const alteredInput = structuredClone(base);
  alteredInput.intakeDecisions[4].input = { changed: true };
  assert.equal(verifyAttestation(alteredInput).valid, false);
  const alteredOutput = structuredClone(base);
  alteredOutput.claimedRelationGraph.relations[0].status = 'UNKNOWN';
  assert.equal(verifyAttestation(alteredOutput).valid, false);
  const valid = replayEvent(base);
  const badAttestation = { ...valid.attestation, epistemicState: 'SPLIT' as const };
  assert.deepEqual(verifyAttestation(base, badAttestation).reasonCodes, ['ATTESTATION_MISMATCH']);
  assert.deepEqual(verifyAttestation(base, valid.attestation, '0'.repeat(64)).reasonCodes, ['ATTESTATION_HASH_MISMATCH']);
  assert.equal(valid.attestationHash, structuredHash('POWIT_V0_ATTESTATION', valid.attestation));
});

function prefix(count: number): { session: PowitEventSession; setTime: (value: number) => void } {
  const fixture = vectors[0].bundle;
  let now = 0;
  const session = new PowitEventSession(fixture.eventSchema, fixture.policyDefinitions, { now: () => now });
  for (const action of fixture.intakeDecisions.slice(0, count)) {
    now = action.authoritativeAt;
    session.submit({ actionType: action.actionType, actorId: action.actorId, participationId: action.participationId, input: action.input, clientTimestamp: action.clientTimestamp });
  }
  return { session, setTime: value => { now = value; } };
}
function actionAt(index: number) {
  const row = vectors[0].bundle.intakeDecisions[index];
  return { actionType: row.actionType, actorId: row.actorId, participationId: row.participationId, input: structuredClone(row.input), clientTimestamp: row.clientTimestamp };
}
function reportPair(report: unknown, validation: 'ADMITTED_OBSERVATION' | 'EXPLICIT_ABSTENTION' | 'INVALID_OBSERVATION', validationReasons: string[] = []) {
  const commit = actionAt(4);
  const reveal = actionAt(5);
  const body = commit.input as { commitment: any; observation: any; preimage: any };
  body.observation.report = report;
  body.preimage.observationHash = structuredHash('POWIT_V0_OBSERVATION', body.observation);
  body.commitment.commitmentHash = structuredHash('POWIT_V0_COMMIT', body.preimage);
  const opening = reveal.input as any;
  opening.candidateObservation.report = report;
  opening.validation = validation;
  opening.validationReasons = validationReasons;
  return { commit, reveal };
}

test('duplicate token and second commitment are rejected without replacing records', () => {
  const enrollment = prefix(4);
  enrollment.setTime(50);
  const duplicate = actionAt(2);
  duplicate.actorId = 'actor-6'; duplicate.participationId = 'w6';
  const duplicateDecision = enrollment.session.submit(duplicate);
  assert.equal(duplicateDecision.decision, 'REJECTED');
  assert.deepEqual(duplicateDecision.reasonCodes, ['DUPLICATE_EVENT_UNIQUENESS_TOKEN']);
  assert.equal(enrollment.session.uniquenessAssertions.length, 1);
  assert.equal(enrollment.session.participations.length, 1);
  const committed = prefix(5); committed.setTime(201);
  const second = committed.session.submit(actionAt(4));
  assert.deepEqual(second.reasonCodes, ['COMMITMENT_ALREADY_ACCEPTED']);
  assert.equal(committed.session.commitments.length, 1);
});

test('reveal windows, wrong salt and altered payload cannot consume the reveal slot', () => {
  const { session, setTime } = prefix(5);
  setTime(299); assert.deepEqual(session.submit(actionAt(5)).reasonCodes, ['REVEAL_WINDOW_NOT_OPEN']);
  setTime(400); assert.deepEqual(session.submit(actionAt(5)).reasonCodes, ['REVEAL_WINDOW_CLOSED']);
  setTime(300);
  const wrongSalt = actionAt(5); (wrongSalt.input as any).salt = '01'.repeat(32);
  assert.deepEqual(session.submit(wrongSalt).reasonCodes, ['COMMITMENT_OPENING_MISMATCH']);
  const changed = actionAt(5); (changed.input as any).candidateObservation.report.occurred = false;
  assert.deepEqual(session.submit(changed).reasonCodes, ['COMMITMENT_OPENING_MISMATCH']);
  assert.equal(session.reveals.length, 0);
  assert.equal(session.submit(actionAt(5)).decision, 'ACCEPTED');
  assert.deepEqual(session.submit(actionAt(5)).reasonCodes, ['DUPLICATE_MATCHING_REVEAL']);
  assert.equal(session.reveals.length, 1);
});

test('matching schema-invalid, explicit abstention and negative reports stay distinct', () => {
  for (const [report, validation, reasons, admitted] of [
    [null, 'INVALID_OBSERVATION', ['REPORT_NOT_OBJECT'], 0],
    [{ occurred: null, abstain: true }, 'EXPLICIT_ABSTENTION', [], 0],
    [{ occurred: false }, 'ADMITTED_OBSERVATION', [], 1],
  ] as const) {
    const { session, setTime } = prefix(4);
    const pair = reportPair(report, validation, [...reasons]);
    setTime(200); assert.equal(session.submit(pair.commit).decision, 'ACCEPTED');
    setTime(300); assert.equal(session.submit(pair.reveal).decision, 'ACCEPTED');
    assert.equal(session.reveals.length, 1);
    assert.equal(session.admittedObservations.length, admitted);
    assert.equal(session.observationOutcomes[0].outcome, validation);
  }
});

test('non-reveal stays SILENT; prospective revocation does not rewrite a snapshot', () => {
  const { session, setTime } = prefix(5);
  const original = canonicalize(session.qualificationSnapshots[0]);
  const changedInput = actionAt(4).input as any;
  changedInput.commitment.qualificationSnapshot.claims[0].validUntil = 151;
  assert.equal(canonicalize(session.qualificationSnapshots[0]), original);
  setTime(400);
  const begin = actionAt(22); assert.equal(begin.actionType, 'BEGIN_FINALIZATION');
  assert.equal(session.submit(begin).decision, 'ACCEPTED');
  assert.equal(session.finalizeEvent().attestation.epistemicState, 'SILENT');
});

test('pre-finalization disqualification preserves history and excludes contribution', () => {
  const { session, setTime } = prefix(6);
  setTime(350);
  const decision = session.submit({ actionType: 'DISQUALIFY', actorId: 'fixture-provider', participationId: 'w1', input: {
    eventId: vectors[0].bundle.eventDefinition.eventId, participationId: 'w1', sequence: 7,
    decidedAt: 350, reasonCode: 'event-time-defect', evidenceRefs: [],
  } });
  assert.equal(decision.decision, 'ACCEPTED');
  setTime(400); assert.equal(session.submit(actionAt(22)).decision, 'ACCEPTED');
  const final = session.finalizeEvent();
  assert.equal(final.attestation.epistemicState, 'SILENT');
  assert.equal(session.reveals.length, 1);
  assert.equal(session.admittedObservations.length, 1);
  assert.equal(final.bundle.claimedAdmittedObservations.length, 0);
  assert.equal(verifyAttestation(final.bundle, final.attestation, final.attestationHash).valid, true);
});

test('missing/conflicting claims remain UNKNOWN; failed diversity gives THIN', () => {
  const base = vectors[0].bundle;
  const profiles = prefix(0).session.profile;
  const admitted = base.claimedAdmittedObservations;
  const missing = structuredClone(base.qualificationSnapshots);
  missing[4].claims = [];
  const first = deriveFinalization(base.eventDefinition.eventId, profiles, base.participations, admitted, missing, new Set());
  assert.equal(first.relationGraph.relations.filter(r => r.status === 'UNKNOWN').length, 4);
  assert.equal(first.sufficiencyEvaluation.requirements[1].observedValue, 4);
  const conflicted = structuredClone(base.qualificationSnapshots);
  const extra = structuredClone(conflicted[4].claims[0]);
  extra.claimId = 'claim-org-w5-extra'; extra.value = { org: 'another-org' };
  conflicted[4].claims.push(extra); conflicted[4].claims.sort((a, b) => a.claimId.localeCompare(b.claimId));
  const second = deriveFinalization(base.eventDefinition.eventId, profiles, base.participations, admitted, conflicted, new Set());
  assert.equal(second.relationGraph.conflicts.length, 1);
  assert.equal(second.relationGraph.relations.filter(r => r.status === 'UNKNOWN').length, 4);
  const thin = structuredClone(base.qualificationSnapshots);
  thin[0].claims[0].value = { org: 'org-1' }; thin[1].claims[0].value = { org: 'org-1' };
  thin[2].claims[0].value = { org: 'org-2' }; thin[3].claims[0].value = { org: 'org-2' }; thin[4].claims = [];
  const third = deriveFinalization(base.eventDefinition.eventId, profiles, base.participations, admitted, thin, new Set());
  assert.equal(third.sufficiencyEvaluation.requirements[1].observedValue, 2);
  assert.equal(third.aggregationResult?.assessment, 'CONVERGENT');
  assert.equal(third.epistemicState, 'THIN');
});

test('client timestamp cannot bypass closed commitment window; sequence is authoritative', () => {
  const { session, setTime } = prefix(4);
  const late = actionAt(4); late.clientTimestamp = 150;
  setTime(300);
  assert.deepEqual(session.submit(late).reasonCodes, ['COMMIT_WINDOW_CLOSED']);
  const malformed = structuredClone(vectors[0].bundle);
  malformed.intakeDecisions[1].sequence = 1;
  assert.deepEqual(verifyAttestation(malformed).reasonCodes, ['INVALID_INTAKE']);
  assert.equal(session.intakeDecisions[session.intakeDecisions.length - 1].sequence, 5);
});

test('active configuration, history views and finalized Attestation cannot mutate the kernel', () => {
  const fixture = vectors[0].bundle;
  const { session } = prefix(fixture.intakeDecisions.length);
  const before = session.finalizeEvent();
  const definition = session.definition!;
  definition.windows.revealClosesAt = 1;
  const readBack = session.attestation!;
  readBack.epistemicState = 'SPLIT';
  const visible = session.reveals;
  visible.length = 0;
  assert.equal(session.definition!.windows.revealClosesAt, 400);
  assert.equal(session.attestation!.epistemicState, 'CONCORDANT');
  assert.equal(session.reveals.length, 5);
  assert.equal(session.finalizeEvent().attestationHash, before.attestationHash);
  assert.throws(() => { session.schema.schemaId = 'changed'; });
});

test('nonempty requiredClaims is rejected until its eligibility rule is specified', () => {
  const fixture = vectors[0].bundle;
  const schema = structuredClone(fixture.eventSchema);
  schema.requiredClaims = ['organization'];
  assert.throws(() => new PowitEventSession(schema, fixture.policyDefinitions, { now: () => 0 }), /Nonempty requiredClaims/);
});

test('timing profile cannot disable the overlap required by commit-time report admission', () => {
  const fixture = vectors[0].bundle;
  const definitions = structuredClone(fixture.policyDefinitions);
  const timing = definitions.find(row => row.policy.policyId === fixture.eventSchema.timingPolicy.policyId)!;
  (timing.definition as { allowObservationCommitOverlap: boolean }).allowObservationCommitOverlap = false;
  timing.policy.definitionHash = structuredHash('POWIT_V0_POLICY', timing.definition);
  const schema = structuredClone(fixture.eventSchema);
  schema.timingPolicy = structuredClone(timing.policy);
  assert.throws(() => new PowitEventSession(schema, definitions, { now: () => 0 }), /Nonoverlapping observation/);
});

test('event lifecycle permits guarded cancellation and rejects mutation after activation', () => {
  const cancellable = prefix(4);
  cancellable.setTime(60);
  const cancel = cancellable.session.submit({ actionType: 'CANCEL_EVENT', actorId: 'event-authority', participationId: null, input: { eventId: vectors[0].bundle.eventDefinition.eventId } });
  assert.equal(cancel.decision, 'ACCEPTED');
  assert.equal(cancellable.session.state, 'CANCELLED');
  cancellable.setTime(200);
  assert.deepEqual(cancellable.session.submit(actionAt(4)).reasonCodes, ['EVENT_NOT_ACTIVE']);
  const committed = prefix(5);
  committed.setTime(201);
  assert.throws(() => committed.session.submit({ actionType: 'CANCEL_EVENT', actorId: 'event-authority', participationId: null, input: { eventId: vectors[0].bundle.eventDefinition.eventId } }), /Cancellation guard/);
  assert.equal(committed.session.state, 'ACTIVE');
});

test('evidence null differs from an explicit empty manifest in commitment opening', () => {
  const { session, setTime } = prefix(4);
  setTime(200); assert.equal(session.submit(actionAt(4)).decision, 'ACCEPTED');
  setTime(300);
  const withManifest = actionAt(5);
  (withManifest.input as any).evidenceManifest = { eventId: vectors[0].bundle.eventDefinition.eventId, witnessParticipationId: 'w1', artifacts: [] };
  assert.deepEqual(session.submit(withManifest).reasonCodes, ['COMMITMENT_OPENING_MISMATCH']);
  assert.equal(session.reveals.length, 0);
});
