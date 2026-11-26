import type { Attestation, IntakeDecision, ReplayBundle } from '@thoth/powit-types';
import { canonicalize, equalCanonical, insist, parseJsonStrict, ProtocolError, structuredHash } from './codec.ts';
import { PowitEventSession, type AuthoritativeClock } from './session.ts';
import { exact, id, idSet, time } from './validation.ts';

const BUNDLE_FIELDS = [
  'protocolVersion', 'eventSchema', 'policyDefinitions', 'eventDefinition', 'lifecycle',
  'uniquenessAssertions', 'participations', 'qualificationSnapshots', 'commitments', 'reveals',
  'intakeDecisions', 'disqualifications', 'claimedObservationOutcomes', 'claimedAdmittedObservations',
  'claimedRelationGraph', 'claimedSufficiencyEvaluation', 'claimedAggregationResult', 'claimedEpistemicState',
];
export type ReplayResult = { bundle: ReplayBundle; attestation: Attestation; attestationHash: string };
/** Re-executes all recorded actions from their inputs and authoritative times. */
export function replayEvent(source: ReplayBundle | string): ReplayResult {
  const input = typeof source === 'string' ? parseJsonStrict(source) as ReplayBundle : source;
  exact(input, BUNDLE_FIELDS, 'INVALID_REPLAY_BUNDLE');
  insist(input.protocolVersion === 'powit-v0', 'INVALID_REPLAY_BUNDLE', 'Wrong protocol version');
  insist(Array.isArray(input.intakeDecisions), 'INVALID_REPLAY_BUNDLE', 'Intake journal required');
  canonicalize(input);
  let replayTime = 0;
  const clock: AuthoritativeClock = { now: () => replayTime };
  const session = new PowitEventSession(input.eventSchema, input.policyDefinitions, clock);
  for (let i = 0; i < input.intakeDecisions.length; i++) {
    const row = exact(input.intakeDecisions[i], ['sequence', 'actionType', 'actorId', 'participationId', 'decision', 'authoritativeAt', 'clientTimestamp', 'recordRef', 'reasonCodes', 'input'], 'INVALID_INTAKE');
    insist(row.sequence === i + 1, 'INVALID_INTAKE', 'Intake sequences must be contiguous from 1');
    id(row.actorId); time(row.authoritativeAt); if (row.clientTimestamp !== null) time(row.clientTimestamp);
    if (row.participationId !== null) id(row.participationId);
    idSet(row.reasonCodes);
    insist((row.decision === 'ACCEPTED' && row.reasonCodes.length === 0) || (row.decision === 'REJECTED' && row.reasonCodes.length > 0), 'INVALID_INTAKE', 'Decision/reasons mismatch');
    replayTime = row.authoritativeAt as number;
    const computed = session.submit({
      actionType: row.actionType as IntakeDecision['actionType'], actorId: row.actorId as string,
      participationId: row.participationId as string | null, input: row.input as IntakeDecision['input'],
      clientTimestamp: row.clientTimestamp as number | null, recordRef: row.recordRef as string | null,
    });
    insist(equalCanonical(computed, row), 'INTAKE_MISMATCH', `Intake action ${i + 1} differs from independently processed decision`);
  }
  insist(session.state === 'FINALIZING', 'INVALID_REPLAY_BUNDLE', 'Bundle must end at initial input freeze');
  const result = session.finalizeEvent();
  insist(equalCanonical(result.bundle, input), 'REPLAY_OUTPUT_MISMATCH', 'Recorded records or claimed outputs differ from replay');
  return result;
}
export type VerificationResult = {
  valid: boolean; reasonCodes: string[]; attestation: Attestation | null;
  attestationHash: string | null;
};
/** A matching digest alone is insufficient: this always replays and compares claimed outputs. */
export function verifyAttestation(source: ReplayBundle | string, claimedAttestation?: Attestation, claimedHash?: string): VerificationResult {
  try {
    const result = replayEvent(source);
    if (claimedAttestation !== undefined) {
      exact(claimedAttestation, ['protocolVersion', 'eventId', 'eventHash', 'schemaHash', 'acceptedParticipationSetHash', 'acceptedObservationSetHash', 'relationGraphHash', 'sufficiencyEvaluationHash', 'aggregationResultHash', 'replayInputHash', 'epistemicState', 'version', 'supersedes', 'finalizingAt'], 'INVALID_ATTESTATION');
      insist(equalCanonical(result.attestation, claimedAttestation), 'ATTESTATION_MISMATCH', 'Claimed Attestation differs');
    }
    if (claimedHash !== undefined) insist(result.attestationHash === claimedHash, 'ATTESTATION_HASH_MISMATCH', 'Claimed digest differs');
    return { valid: true, reasonCodes: [], attestation: result.attestation, attestationHash: result.attestationHash };
  } catch (error) {
    return { valid: false, reasonCodes: [error instanceof ProtocolError ? error.code : 'INVALID_REPLAY_BUNDLE'], attestation: null, attestationHash: null };
  }
}
export function hashAttestation(attestation: Attestation): string { return structuredHash('POWIT_V0_ATTESTATION', attestation); }
