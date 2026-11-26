import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { CoreActionType, J, ReplayBundle } from '@thoth/powit-types';
import { canonicalize, parseJsonStrict, PowitEventSession, ProtocolError, rawSha256, replayEvent,
  structuredHash, verifyAttestation, type Action } from '../src/index.ts';

// Read the unchanged canonical fixtures directly; no replacement vectors or file rollback.
const document = readFileSync(new URL('../../../protocol/powit/v0/POWIT_V0_TEST_VECTORS.md', import.meta.url), 'utf8');
const fixtures = [...document.matchAll(/#### (E2E-[1-4] [^\n]+)\n([\s\S]*?)(?=\n#### E2E-|\n### Edge-case)/g)]
  .map(([, title, section]) => {
    const block = /```json\n([\s\S]*?)\n```/.exec(section.split('ReplayBundle full structured input')[1]);
    assert.ok(block); return { title, bundle: parseJsonStrict(block[1]) as ReplayBundle };
  });
assert.equal(fixtures.length, 4);
const actionTypes: CoreActionType[] = ['CREATE_EVENT', 'ACTIVATE_EVENT', 'CANCEL_EVENT', 'BEGIN_FINALIZATION',
  'ASSERT_EVENT_SCOPED_UNIQUENESS', 'ENROLL', 'ACCEPT_COMMITMENT', 'ACCEPT_REVEAL', 'DISQUALIFY'];

function action(row: ReplayBundle['intakeDecisions'][number]): Action {
  return { actionType: row.actionType, actorId: row.actorId, participationId: row.participationId,
    input: structuredClone(row.input), clientTimestamp: row.clientTimestamp, recordRef: row.recordRef };
}
function prefix(bundle: ReplayBundle, count: number) {
  let now = 0; let clockReads = 0;
  const session = new PowitEventSession(bundle.eventSchema, bundle.policyDefinitions, { now: () => { clockReads++; return now; } });
  for (const row of bundle.intakeDecisions.slice(0, count)) {
    now = row.authoritativeAt; assert.equal(canonicalize(session.submit(action(row))), canonicalize(row));
  }
  return { session, setTime: (value: number) => { now = value; }, clockReads: () => clockReads };
}
function visible(session: PowitEventSession) {
  return { definition: session.definition, state: session.state, finalizingAt: session.finalizingAt,
    attestation: session.attestation, lifecycle: session.lifecycle, uniquenessAssertions: session.uniquenessAssertions,
    participations: session.participations, qualificationSnapshots: session.qualificationSnapshots,
    commitments: session.commitments, reveals: session.reveals, intakeDecisions: session.intakeDecisions,
    disqualifications: session.disqualifications, observationOutcomes: session.observationOutcomes,
    admittedObservations: session.admittedObservations };
}
const bytesHash = (value: unknown) => rawSha256(new TextEncoder().encode(canonicalize(value)));
function unchanged(session: PowitEventSession, before: ReturnType<typeof visible>) {
  assert.equal(session.intakeDecisions.length, before.intakeDecisions.length, 'canonical action sequence/cutoff');
  assert.equal(session.reveals.length, before.reveals.length, 'matching reveal entitlement');
  assert.equal(session.admittedObservations.length, before.admittedObservations.length, 'admitted Observation count');
  assert.equal(bytesHash(visible(session)), bytesHash(before), 'all canonical retained bytes and logical state');
}
function lateAction(type: CoreActionType, bundle: ReplayBundle, now: number, sequence: number): Action {
  const recorded = bundle.intakeDecisions.find(row => row.actionType === type);
  if (recorded) return action(recorded);
  const authority = (bundle.policyDefinitions.find(row => (row.definition as Record<string, J>).policyKind === 'WITNESS_ELIGIBILITY_V0')!
    .definition as Record<string, J>).disqualificationAuthorities as string[];
  return type === 'CANCEL_EVENT'
    ? { actionType: type, actorId: 'event-authority', participationId: null, input: { eventId: bundle.eventDefinition.eventId } }
    : { actionType: type, actorId: authority[0], participationId: bundle.participations[0].participationId,
      input: { eventId: bundle.eventDefinition.eventId, participationId: bundle.participations[0].participationId,
        sequence, decidedAt: now, reasonCode: 'event-time-defect', evidenceRefs: [] } };
}
function refusesWithoutAcceptance(session: PowitEventSession, input: Action) {
  let refusal = false;
  try { refusal = session.submit(input).decision === 'REJECTED'; }
  catch (error) { assert.ok(error instanceof ProtocolError); refusal = true; }
  assert.equal(refusal, true, 'late input cannot be accepted');
}

for (const phase of ['FINALIZING', 'ATTESTED'] as const) for (const type of actionTypes) {
  test(`E1 ${type} after ${phase} preserves cutoff, frozen bytes and all four Attestation identities`, () => {
    for (const fixture of fixtures) {
      const { session, setTime, clockReads } = prefix(fixture.bundle, fixture.bundle.intakeDecisions.length);
      const expected = replayEvent(fixture.bundle);
      if (phase === 'ATTESTED') assert.equal(session.finalizeEvent().attestationHash, expected.attestationHash);
      const before = visible(session); const frozen = session.buildReplayBundle();
      const logicalTime = session.finalizingAt; const reads = clockReads(); setTime(900000);
      refusesWithoutAcceptance(session, lateAction(type, fixture.bundle, 900000, before.intakeDecisions.length + 1));
      assert.equal(clockReads(), reads, 'frozen operational refusal must not read a fresh acceptance time');
      unchanged(session, before); assert.equal(session.finalizingAt, logicalTime);
      assert.equal(bytesHash(session.buildReplayBundle()), bytesHash(frozen), fixture.title);
      const finalized = session.finalizeEvent();
      assert.equal(finalized.attestationHash, expected.attestationHash, fixture.title);
      assert.equal(canonicalize(finalized.attestation), canonicalize(expected.attestation), fixture.title);
      assert.equal(finalized.attestation.finalizingAt, logicalTime);
      assert.equal(verifyAttestation(finalized.bundle, finalized.attestation, finalized.attestationHash).valid, true);
      setTime(1000000); assert.equal(session.finalizeEvent().attestationHash, finalized.attestationHash);
    }
  });
}

test('E1 repeated begin/finalize cannot substitute wall-clock time or add canonical refusals', () => {
  for (const fixture of fixtures) {
    const { session, setTime } = prefix(fixture.bundle, fixture.bundle.intakeDecisions.length);
    const frozen = session.buildReplayBundle(); const cutoff = session.intakeDecisions.length; const logicalTime = session.finalizingAt;
    for (const time of [500, 1000000]) {
      setTime(time); refusesWithoutAcceptance(session, lateAction('BEGIN_FINALIZATION', fixture.bundle, time, cutoff + 1));
      assert.equal(session.intakeDecisions.length, cutoff); assert.equal(session.finalizingAt, logicalTime);
      assert.equal(bytesHash(session.buildReplayBundle()), bytesHash(frozen));
      assert.equal(session.finalizeEvent().attestationHash, replayEvent(fixture.bundle).attestationHash);
    }
  }
});

test('E1 a frozen operational refusal precedes invalid metadata and an unavailable fresh clock', () => {
  for (const fixture of fixtures) for (const phase of ['FINALIZING', 'ATTESTED']) {
    const probe = prefix(fixture.bundle, fixture.bundle.intakeDecisions.length);
    const expected = replayEvent(fixture.bundle);
    if (phase === 'ATTESTED') probe.session.finalizeEvent();
    const before = visible(probe.session); const reads = probe.clockReads(); probe.setTime(NaN);
    const submitted = lateAction('ENROLL', fixture.bundle, 0, 0);
    submitted.actorId = 'has space'; submitted.recordRef = 'has space';
    assert.throws(() => probe.session.submit(submitted), error => error instanceof ProtocolError && error.code === 'EVENT_NOT_ACTIVE');
    unchanged(probe.session, before); assert.equal(probe.clockReads(), reads);
    assert.equal(probe.session.finalizeEvent().attestationHash, expected.attestationHash);
  }
});

test('E1 a caller accessor or clock freezing during capture cannot append the outer action', () => {
  const fixture = fixtures[0].bundle;
  const beginIndex = fixture.intakeDecisions.findIndex(row => row.actionType === 'BEGIN_FINALIZATION');
  assert.equal(beginIndex, 22);
  for (const callback of ['actorId', 'input', 'clock']) {
    const probe = prefix(fixture, beginIndex); const control = prefix(fixture, beginIndex);
    probe.setTime(400); control.setTime(400);
    assert.equal(control.session.submit(action(fixture.intakeDecisions[beginIndex])).decision, 'ACCEPTED');
    const frozen = control.session.buildReplayBundle();
    let began = false;
    const freeze = () => {
      if (began) return; began = true;
      assert.equal(probe.session.submit(action(fixture.intakeDecisions[beginIndex])).decision, 'ACCEPTED');
    };
    const outer = action(fixture.intakeDecisions.find(row => row.actionType === 'ENROLL')!);
    if (callback === 'clock') probe.session.clock.now = () => { freeze(); return 400; };
    else {
      const value = callback === 'actorId' ? outer.actorId : outer.input;
      Object.defineProperty(outer, callback, { enumerable: true, get: () => { freeze(); return value; } });
    }
    assert.throws(() => probe.session.submit(outer), error => error instanceof ProtocolError && error.code === 'EVENT_NOT_ACTIVE');
    assert.equal(began, true); assert.equal(probe.session.intakeDecisions.length, 23);
    assert.equal(probe.session.state, 'FINALIZING'); assert.equal(probe.session.finalizingAt, 400);
    assert.equal(bytesHash(probe.session.buildReplayBundle()), bytesHash(frozen), callback);
    assert.equal(probe.session.finalizeEvent().attestationHash, control.session.finalizeEvent().attestationHash, callback);
  }
});

test('E1 frozen prefix retains a pre-cutoff rejected input and the contiguous accepted BEGIN', () => {
  for (const fixture of fixtures) {
    const probe = prefix(fixture.bundle, 2); probe.setTime(50);
    // No scoped controller owns this role. This ordinary ACTIVE refusal is retained,
    // even in the SILENT fixture which deliberately contains no matching reveal.
    const wrong: Action = { actionType: 'ACCEPT_REVEAL', actorId: 'unknown-actor', participationId: 'unknown-participation', input: {} };
    const rejected = probe.session.submit(wrong);
    assert.equal(rejected.decision, 'REJECTED'); assert.deepEqual(rejected.reasonCodes, ['QUALIFICATION_NOT_ELIGIBLE']);
    const frozen = finishTailBeforeAttestation(probe.session, probe.setTime, fixture.bundle, 2);
    assert.equal(frozen.intakeDecisions.length, fixture.bundle.intakeDecisions.length + 1);
    assert.equal(frozen.intakeDecisions[2].decision, 'REJECTED');
    assert.equal(frozen.intakeDecisions.at(-1)!.actionType, 'BEGIN_FINALIZATION');
    assert.equal(frozen.intakeDecisions.at(-1)!.decision, 'ACCEPTED');
    assert.deepEqual(frozen.intakeDecisions.map(row => row.sequence), frozen.intakeDecisions.map((_, i) => i + 1));
    const expected = replayEvent(frozen); const before = visible(probe.session);
    for (const phase of ['FINALIZING', 'ATTESTED']) {
      if (phase === 'ATTESTED') assert.equal(probe.session.finalizeEvent().attestationHash, expected.attestationHash);
      const phaseBefore = visible(probe.session); probe.setTime(900000);
      for (const type of actionTypes) refusesWithoutAcceptance(probe.session, lateAction(type, fixture.bundle, 900000, frozen.intakeDecisions.length + 1));
      unchanged(probe.session, phaseBefore); assert.equal(bytesHash(probe.session.buildReplayBundle()), bytesHash(frozen));
      assert.equal(probe.session.finalizeEvent().attestationHash, expected.attestationHash);
    }
    assert.equal(probe.session.intakeDecisions.length, before.intakeDecisions.length);
  }
});

function finishTailBeforeAttestation(session: PowitEventSession, setTime: (value: number) => void, bundle: ReplayBundle, next: number) {
  for (const row of bundle.intakeDecisions.slice(next)) { setTime(row.authoritativeAt); assert.equal(session.submit(action(row)).decision, row.decision); }
  return session.buildReplayBundle();
}

function scenario(type: CoreActionType, bundle: ReplayBundle) {
  const index = bundle.intakeDecisions.findIndex(row => row.actionType === type);
  if (index >= 0) return { count: index, now: bundle.intakeDecisions[index].authoritativeAt,
    corrected: action(bundle.intakeDecisions[index]), next: index + 1, cancelled: false };
  if (type === 'CANCEL_EVENT') return { count: 1, now: 1,
    corrected: lateAction(type, bundle, 1, 2), next: bundle.intakeDecisions.length, cancelled: true };
  return { count: 6, now: 350, corrected: lateAction(type, bundle, 350, 7), next: 6, cancelled: false };
}
function finishTail(session: PowitEventSession, setTime: (value: number) => void, bundle: ReplayBundle, next: number) {
  for (const row of bundle.intakeDecisions.slice(next)) { setTime(row.authoritativeAt); assert.equal(session.submit(action(row)).decision, row.decision); }
  return session.finalizeEvent();
}

for (const type of actionTypes) {
  test(`E2 invalid recordRef on ${type} is atomic and corrected retry equals a clean reusable session`, () => {
    const fixture = fixtures[0].bundle; const setup = scenario(type, fixture);
    for (const invalid of ['', 'has space', 'x'.repeat(129), 42]) {
      const probe = prefix(fixture, setup.count); const control = prefix(fixture, setup.count);
      probe.setTime(setup.now); control.setTime(setup.now); const before = visible(probe.session);
      assert.throws(() => probe.session.submit({ ...structuredClone(setup.corrected), recordRef: invalid } as Action), ProtocolError);
      unchanged(probe.session, before);
      const retry = probe.session.submit(structuredClone(setup.corrected)); const clean = control.session.submit(structuredClone(setup.corrected));
      assert.equal(retry.decision, 'ACCEPTED'); assert.equal(retry.sequence, before.intakeDecisions.length + 1);
      assert.equal(canonicalize(retry), canonicalize(clean)); assert.equal(bytesHash(visible(probe.session)), bytesHash(visible(control.session)));
      if (!setup.cancelled) {
        const replay = finishTail(probe.session, probe.setTime, fixture, setup.next);
        const expected = finishTail(control.session, control.setTime, fixture, setup.next);
        assert.equal(replay.attestationHash, expected.attestationHash);
        assert.equal(bytesHash(replay.bundle), bytesHash(expected.bundle));
        assert.equal(verifyAttestation(replay.bundle, replay.attestation, replay.attestationHash).valid, true);
      }
    }
  });
}

test('E2 invalid reveal action metadata never consumes records, entitlement or next canonical sequence', () => {
  const invalidMetadata = [
    { actorId: 'has space' }, { participationId: 'has space' }, { clientTimestamp: -1 },
    { clientTimestamp: 1.5 }, { clientTimestamp: NaN }, { recordRef: 'has space' },
  ];
  for (const fixture of fixtures) for (const metadata of invalidMetadata) {
    const revealIndex = fixture.bundle.intakeDecisions.findIndex(row => row.actionType === 'ACCEPT_REVEAL');
    if (revealIndex < 0) {
      assert.equal(fixture.bundle.claimedEpistemicState, 'SILENT'); assert.equal(fixture.bundle.reveals.length, 0);
      assert.equal(replayEvent(fixture.bundle).attestation.epistemicState, 'SILENT');
      continue;
    }
    const probe = prefix(fixture.bundle, revealIndex); const control = prefix(fixture.bundle, revealIndex);
    const row = fixture.bundle.intakeDecisions[revealIndex]; probe.setTime(row.authoritativeAt); control.setTime(row.authoritativeAt);
    const before = visible(probe.session);
    assert.throws(() => probe.session.submit({ ...action(row), ...metadata }), ProtocolError); unchanged(probe.session, before);
    const retry = probe.session.submit(action(row)); const clean = control.session.submit(action(row));
    assert.equal(retry.decision, 'ACCEPTED'); assert.equal(canonicalize(retry), canonicalize(clean));
    const finalized = finishTail(probe.session, probe.setTime, fixture.bundle, revealIndex + 1);
    const expected = finishTail(control.session, control.setTime, fixture.bundle, revealIndex + 1);
    assert.equal(finalized.attestationHash, expected.attestationHash, fixture.title);
    assert.equal(finalized.attestationHash, replayEvent(fixture.bundle).attestationHash);
  }
});

function replacePid(value: J, pid: string): J {
  if (value === 'w1') return pid;
  if (Array.isArray(value)) return value.map(row => replacePid(row, pid));
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, row]) => [key, replacePid(row, pid)]));
  return value;
}
test('E2 overlong generated reveal reference fails before mutation and permits a valid explicit reference', () => {
  const fixture = fixtures[0].bundle; const pid = 'w' + 'x'.repeat(127);
  const build = () => {
    let now = 0; const session = new PowitEventSession(fixture.eventSchema, fixture.policyDefinitions, { now: () => now });
    for (const row of fixture.intakeDecisions.slice(0, 5)) {
      now = row.authoritativeAt; const submitted = action(row);
      if (submitted.participationId === 'w1') submitted.participationId = pid;
      submitted.input = replacePid(submitted.input, pid); delete submitted.recordRef;
      if (submitted.actionType === 'ACCEPT_COMMITMENT') {
        const envelope = submitted.input as Record<string, J>;
        const preimage = envelope.preimage as Record<string, J>;
        preimage.observationHash = structuredHash('POWIT_V0_OBSERVATION', envelope.observation);
        (envelope.commitment as Record<string, J>).commitmentHash = structuredHash('POWIT_V0_COMMIT', preimage);
      }
      assert.equal(session.submit(submitted).decision, 'ACCEPTED');
    }
    now = 300; return { session, setTime: (value: number) => { now = value; } };
  };
  const probe = build(); const control = build(); const reveal = action(fixture.intakeDecisions[5]);
  reveal.participationId = pid; reveal.input = replacePid(reveal.input, pid); delete reveal.recordRef;
  const before = visible(probe.session); assert.throws(() => probe.session.submit(reveal), ProtocolError); unchanged(probe.session, before);
  const corrected = { ...reveal, recordRef: 'valid-reveal-reference' };
  assert.equal(canonicalize(probe.session.submit(corrected)), canonicalize(control.session.submit(corrected)));
  for (const current of [probe, control]) {
    current.setTime(400); assert.equal(current.session.submit(lateAction('BEGIN_FINALIZATION', fixture, 400, 7)).decision, 'ACCEPTED');
  }
  assert.equal(probe.session.finalizeEvent().attestationHash, control.session.finalizeEvent().attestationHash);
});
