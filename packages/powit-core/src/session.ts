import type {
  Attestation, ClaimedObservationOutcome, CommitmentPreimage, CommitmentRecord, CoreActionType,
  DisqualificationRecord, EventDefinition, EventScopedUniquenessAssertion, EventState, EvidenceManifest,
  IntakeDecision, J, LifecycleRecord, Observation, PolicyDefinition, QualificationSnapshot,
  ReplayBundle, RevealRecord, WitnessParticipation, EventSchema,
} from '@thoth/powit-types';
import { asciiCompare, canonicalize, deepFreeze, equalCanonical, fail, insist, ProtocolError, structuredHash } from './codec.ts';
import { deriveFinalization, type Derived } from './derive.ts';
import { exact, hash, id, idSet, observationOutcome, policyRef, positive, record, time, validateEventDefinition, validateSchema, validateSnapshot, type Profile } from './validation.ts';

export interface AuthoritativeClock { now(): number }
export type Action = { actionType: CoreActionType; actorId: string; participationId: string | null; input: J; clientTimestamp?: number | null; recordRef?: string | null };
const rejectable = new Set([
  'EVENT_NOT_ACTIVE', 'ENROLLMENT_WINDOW_NOT_OPEN', 'ENROLLMENT_WINDOW_CLOSED',
  'DUPLICATE_EVENT_UNIQUENESS_TOKEN', 'QUALIFICATION_NOT_ELIGIBLE',
  'OBSERVATION_WINDOW_NOT_OPEN', 'OBSERVATION_WINDOW_CLOSED',
  'COMMIT_WINDOW_NOT_OPEN', 'COMMIT_WINDOW_CLOSED', 'COMMITMENT_ALREADY_ACCEPTED',
  'REVEAL_WINDOW_NOT_OPEN', 'REVEAL_WINDOW_CLOSED', 'COMMITMENT_OPENING_MISMATCH',
  'DUPLICATE_MATCHING_REVEAL',
]);
function windowAt(now: number, opens: number, closes: number, prefix: string): void {
  insist(now >= opens, `${prefix}_WINDOW_NOT_OPEN`, `${prefix} window has not opened`);
  insist(now < closes, `${prefix}_WINDOW_CLOSED`, `${prefix} window has closed`);
}
function same(a: unknown, b: unknown, code: string, label: string): void { insist(equalCanonical(a, b), code, `${label} differs`); }
function sortedBy<T>(rows: T[], key: (row: T) => string): T[] { return rows.slice().sort((a, b) => asciiCompare(key(a), key(b))); }
function validateManifest(manifest: EvidenceManifest, eventId: string, pid: string): void {
  const m = exact(manifest, ['eventId', 'witnessParticipationId', 'artifacts'], 'INVALID_EVIDENCE');
  insist(m.eventId === eventId && m.witnessParticipationId === pid && Array.isArray(m.artifacts), 'INVALID_EVIDENCE', 'Manifest binding');
  let last = '';
  for (const artifact of m.artifacts) {
    const a = exact(artifact, ['artifactId', 'submittedByParticipationId', 'digestAlgorithm', 'contentHash', 'byteLength', 'mediaType'], 'INVALID_EVIDENCE');
    id(a.artifactId); insist(last === '' || asciiCompare(last, a.artifactId) < 0, 'INVALID_EVIDENCE', 'Artifacts unsorted'); last = a.artifactId;
    insist(a.submittedByParticipationId === pid && a.digestAlgorithm === 'SHA-256', 'INVALID_EVIDENCE', 'Artifact binding');
    hash(a.contentHash); time(a.byteLength); insist(typeof a.mediaType === 'string' && a.mediaType.length > 0, 'INVALID_EVIDENCE', 'Media type');
  }
}
function validateCandidate(candidate: Observation, eventId: string, pid: string): void {
  const o = exact(candidate, ['eventId', 'witnessParticipationId', 'observedAt', 'report', 'evidenceManifestHash'], 'INVALID_OBSERVATION');
  insist(o.eventId === eventId && o.witnessParticipationId === pid, 'COMMITMENT_OPENING_MISMATCH', 'Observation binding');
  time(o.observedAt); canonicalize(o.report); if (o.evidenceManifestHash !== null) hash(o.evidenceManifestHash);
}
export class PowitEventSession {
  readonly profile: Profile;
  readonly schema: EventSchema;
  readonly definitions: PolicyDefinition[];
  readonly clock: AuthoritativeClock;
  #definition: EventDefinition | null = null;
  #state: EventState | null = null;
  #finalizingAt: number | null = null;
  #attestation: Attestation | null = null;
  get definition(): EventDefinition | null { return this.#definition === null ? null : structuredClone(this.#definition); }
  get state(): EventState | null { return this.#state; }
  get finalizingAt(): number | null { return this.#finalizingAt; }
  get attestation(): Attestation | null { return this.#attestation === null ? null : structuredClone(this.#attestation); }
  readonly #lifecycle: LifecycleRecord[] = [];
  readonly #uniquenessAssertions: EventScopedUniquenessAssertion[] = [];
  readonly #participations: WitnessParticipation[] = [];
  readonly #qualificationSnapshots: QualificationSnapshot[] = [];
  readonly #commitments: CommitmentRecord[] = [];
  readonly #reveals: RevealRecord[] = [];
  readonly #intakeDecisions: IntakeDecision[] = [];
  readonly #disqualifications: DisqualificationRecord[] = [];
  readonly #observationOutcomes: ClaimedObservationOutcome[] = [];
  readonly #admittedObservations: Observation[] = [];
  get lifecycle(): LifecycleRecord[] { return structuredClone(this.#lifecycle); }
  get uniquenessAssertions(): EventScopedUniquenessAssertion[] { return structuredClone(this.#uniquenessAssertions); }
  get participations(): WitnessParticipation[] { return structuredClone(this.#participations); }
  get qualificationSnapshots(): QualificationSnapshot[] { return structuredClone(this.#qualificationSnapshots); }
  get commitments(): CommitmentRecord[] { return structuredClone(this.#commitments); }
  get reveals(): RevealRecord[] { return structuredClone(this.#reveals); }
  get intakeDecisions(): IntakeDecision[] { return structuredClone(this.#intakeDecisions); }
  get disqualifications(): DisqualificationRecord[] { return structuredClone(this.#disqualifications); }
  get observationOutcomes(): ClaimedObservationOutcome[] { return structuredClone(this.#observationOutcomes); }
  get admittedObservations(): Observation[] { return structuredClone(this.#admittedObservations); }
  private readonly assertedTokens = new Set<string>();
  private readonly consumedAssertions = new Set<string>();
  private readonly participationActors = new Map<string, string>();

  constructor(schema: EventSchema, definitions: PolicyDefinition[], clock: AuthoritativeClock) {
    this.schema = deepFreeze(structuredClone(schema)); this.definitions = deepFreeze(structuredClone(definitions));
    this.profile = deepFreeze(validateSchema(this.schema, this.definitions)); this.clock = clock;
  }
  private requireIntakeOpen(): void {
    insist(this.#state !== 'FINALIZING' && this.#state !== 'ATTESTED', 'EVENT_NOT_ACTIVE', 'Canonical Event inputs are frozen');
  }
  private requireActive(): EventDefinition {
    insist(this.#state === 'ACTIVE' && this.#definition, 'EVENT_NOT_ACTIVE', 'Event is not ACTIVE');
    return this.#definition;
  }
  private owned(pid: string | null, actorId: string): WitnessParticipation {
    insist(pid !== null, 'QUALIFICATION_NOT_ELIGIBLE', 'Participation required');
    const part = this.#participations.find(p => p.participationId === pid);
    insist(part && this.participationActors.get(pid) === actorId, 'QUALIFICATION_NOT_ELIGIBLE', 'No authenticated scoped participation');
    return part;
  }
  private decide(action: Action, now: number, sequence: number): string {
    const { actionType, actorId, participationId: pid, input } = action;
    if (actionType === 'CREATE_EVENT') {
      insist(this.#state === null, 'INVALID_EVENT', 'Event already exists');
      insist(pid === null, 'INVALID_EVENT', 'Lifecycle action cannot name a participant');
      validateEventDefinition(input as EventDefinition, this.profile);
      this.#definition = deepFreeze(structuredClone(input as EventDefinition)); this.#state = 'DRAFT';
      this.#lifecycle.push({ sequence, from: null, to: 'DRAFT', authoritativeAt: now });
      return this.#definition.eventId;
    }
    const event = this.#definition;
    insist(event, 'INVALID_EVENT', 'CREATE_EVENT required first');
    if (actionType === 'ACTIVATE_EVENT' || actionType === 'CANCEL_EVENT' || actionType === 'BEGIN_FINALIZATION') {
      insist(pid === null, 'INVALID_EVENT', 'Lifecycle action cannot name a participant');
      const command = exact(input, ['eventId'], 'INVALID_EVENT'); insist(command.eventId === event.eventId, 'INVALID_EVENT', 'Event binding');
      const from = this.#state;
      if (actionType === 'ACTIVATE_EVENT') {
        insist(from === 'DRAFT', 'INVALID_STATE_TRANSITION', 'Activation requires DRAFT'); this.#state = 'ACTIVE';
      } else if (actionType === 'CANCEL_EVENT') {
        insist(from === 'DRAFT' || (from === 'ACTIVE' && this.#commitments.length === 0), 'INVALID_STATE_TRANSITION', 'Cancellation guard'); this.#state = 'CANCELLED';
      } else {
        insist(from === 'ACTIVE' && now >= event.windows.revealClosesAt, 'INVALID_STATE_TRANSITION', 'Reveal window must close before finalization');
        this.#state = 'FINALIZING'; this.#finalizingAt = now;
      }
      this.#lifecycle.push({ sequence, from, to: this.#state, authoritativeAt: now });
      return event.eventId;
    }
    this.requireActive();
    if (actionType === 'ASSERT_EVENT_SCOPED_UNIQUENESS') {
      const a = exact(input, ['eventId', 'uniquenessToken', 'assuranceProvider', 'assuranceMethod', 'assertedAt', 'validUntil'], 'INVALID_ASSERTION');
      insist(pid !== null, 'INVALID_ASSERTION', 'Participant required'); id(pid); id(a.uniquenessToken); id(a.assuranceProvider); policyRef(a.assuranceMethod);
      insist(a.eventId === event.eventId && a.assertedAt === now, 'INVALID_ASSERTION', 'Assertion binding/time');
      if (a.validUntil !== null) { time(a.validUntil); insist(a.validUntil > now, 'INVALID_ASSERTION', 'Expired assertion'); }
      insist(this.profile.eligibility.assuranceProviders.includes(a.assuranceProvider as string), 'QUALIFICATION_NOT_ELIGIBLE', 'Provider not allowed');
      insist(this.profile.eligibility.acceptedAssuranceMethods.some(ref => equalCanonical(ref, a.assuranceMethod)), 'QUALIFICATION_NOT_ELIGIBLE', 'Assurance method not allowed');
      const method = this.profile.resolve(a.assuranceMethod as EventScopedUniquenessAssertion['assuranceMethod']) as Record<string, J>;
      insist(method.policyKind === 'UPSTREAM_ASSURANCE_METHOD_V0' && method.provider === a.assuranceProvider, 'QUALIFICATION_NOT_ELIGIBLE', 'Method provider mismatch');
      insist(!this.assertedTokens.has(a.uniquenessToken as string), 'DUPLICATE_EVENT_UNIQUENESS_TOKEN', 'Token already asserted in Event');
      this.assertedTokens.add(a.uniquenessToken as string);
      this.#uniquenessAssertions.push(structuredClone(input as EventScopedUniquenessAssertion));
      return structuredHash('POWIT_V0_UNIQUENESS_ASSERTION', input);
    }
    if (actionType === 'ENROLL') {
      windowAt(now, event.windows.enrollmentOpensAt, event.windows.enrollmentClosesAt, 'ENROLLMENT');
      const p = exact(input, ['eventId', 'participationId', 'witnessClasses', 'enrolledAt', 'uniquenessAssertionHash'], 'INVALID_PARTICIPATION');
      insist(p.eventId === event.eventId && p.participationId === pid && p.enrolledAt === now, 'INVALID_PARTICIPATION', 'Enrollment binding/time');
      id(p.participationId); idSet(p.witnessClasses); hash(p.uniquenessAssertionHash);
      insist(!this.#participations.some(existing => existing.participationId === pid), 'QUALIFICATION_NOT_ELIGIBLE', 'Participation already exists');
      const assertion = this.#uniquenessAssertions.find(a => structuredHash('POWIT_V0_UNIQUENESS_ASSERTION', a) === p.uniquenessAssertionHash);
      insist(assertion && !this.consumedAssertions.has(p.uniquenessAssertionHash as string), 'QUALIFICATION_NOT_ELIGIBLE', 'Unused assertion required');
      insist(assertion.validUntil === null || now < assertion.validUntil, 'QUALIFICATION_NOT_ELIGIBLE', 'Assertion expired');
      this.consumedAssertions.add(p.uniquenessAssertionHash as string);
      this.#participations.push(structuredClone(input as WitnessParticipation)); this.participationActors.set(pid!, actorId);
      return pid!;
    }
    if (actionType === 'ACCEPT_COMMITMENT') {
      this.owned(pid, actorId);
      windowAt(now, event.windows.commitOpensAt, event.windows.commitClosesAt, 'COMMIT');
      windowAt(now, event.windows.observationOpensAt, event.windows.observationClosesAt, 'OBSERVATION');
      insist(!this.#commitments.some(c => c.witnessParticipationId === pid), 'COMMITMENT_ALREADY_ACCEPTED', 'Second commitment');
      const envelope = exact(input, ['commitment', 'observation', 'preimage'], 'INVALID_COMMITMENT');
      const c = exact(envelope.commitment, ['eventId', 'witnessParticipationId', 'commitmentHash', 'acceptedAt', 'qualificationSnapshot'], 'INVALID_COMMITMENT');
      const preimage = exact(envelope.preimage, ['eventId', 'witnessParticipationId', 'observationHash', 'evidenceManifestHash', 'salt'], 'INVALID_COMMITMENT');
      insist(c.eventId === event.eventId && c.witnessParticipationId === pid && c.acceptedAt === now, 'INVALID_COMMITMENT', 'Commitment binding/time');
      hash(c.commitmentHash); hash(preimage.observationHash); hash(preimage.salt);
      const observation = envelope.observation as Observation; validateCandidate(observation, event.eventId, pid!);
      insist(preimage.eventId === event.eventId && preimage.witnessParticipationId === pid && preimage.evidenceManifestHash === observation.evidenceManifestHash && preimage.observationHash === structuredHash('POWIT_V0_OBSERVATION', observation), 'INVALID_COMMITMENT', 'Preimage binding');
      insist(c.commitmentHash === structuredHash('POWIT_V0_COMMIT', preimage), 'INVALID_COMMITMENT', 'Commitment digest');
      const snapshot = c.qualificationSnapshot as QualificationSnapshot; validateSnapshot(snapshot, event, this.profile);
      insist(snapshot.participationId === pid && snapshot.evaluatedAt === now, 'QUALIFICATION_NOT_ELIGIBLE', 'Snapshot time/participation');
      const part = this.#participations.find(p => p.participationId === pid)!;
      const assertion = this.#uniquenessAssertions.find(a => structuredHash('POWIT_V0_UNIQUENESS_ASSERTION', a) === part.uniquenessAssertionHash)!;
      insist(assertion.validUntil === null || now < assertion.validUntil, 'QUALIFICATION_NOT_ELIGIBLE', 'Assertion expired at commitment');
      this.#qualificationSnapshots.push(structuredClone(snapshot)); this.#commitments.push(structuredClone(c as CommitmentRecord));
      return c.commitmentHash as string;
    }
    if (actionType === 'ACCEPT_REVEAL') {
      this.owned(pid, actorId);
      windowAt(now, event.windows.revealOpensAt, event.windows.revealClosesAt, 'REVEAL');
      const commitment = this.#commitments.find(c => c.witnessParticipationId === pid);
      insist(commitment, 'COMMITMENT_OPENING_MISMATCH', 'Missing commitment');
      insist(!this.#reveals.some(r => r.witnessParticipationId === pid), 'DUPLICATE_MATCHING_REVEAL', 'Matching reveal already retained');
      const r = exact(input, ['eventId', 'witnessParticipationId', 'candidateObservation', 'evidenceManifest', 'salt', 'receivedAt', 'validation', 'validationReasons'], 'INVALID_REVEAL');
      insist(r.eventId === event.eventId && r.witnessParticipationId === pid && r.receivedAt === now, 'COMMITMENT_OPENING_MISMATCH', 'Reveal binding/time');
      hash(r.salt);
      const candidate = r.candidateObservation as Observation;
      validateCandidate(candidate, event.eventId, pid!);
      if (r.evidenceManifest !== null) validateManifest(r.evidenceManifest as EvidenceManifest, event.eventId, pid!);
      const manifestHash = r.evidenceManifest === null ? null : structuredHash('POWIT_V0_EVIDENCE_MANIFEST', r.evidenceManifest);
      insist(candidate.evidenceManifestHash === manifestHash, 'COMMITMENT_OPENING_MISMATCH', 'Evidence manifest mismatch');
      const preimage: CommitmentPreimage = {
        eventId: event.eventId, witnessParticipationId: pid!, observationHash: structuredHash('POWIT_V0_OBSERVATION', candidate),
        evidenceManifestHash: manifestHash, salt: r.salt as string,
      };
      insist(structuredHash('POWIT_V0_COMMIT', preimage) === commitment.commitmentHash, 'COMMITMENT_OPENING_MISMATCH', 'Opening mismatch');
      const outcome = observationOutcome(candidate, this.profile);
      insist(r.validation === outcome.outcome && equalCanonical(r.validationReasons, outcome.reasonCodes), 'INVALID_REVEAL', 'Claimed observation validation differs');
      // The wire profile requires an intake reference but does not prescribe its naming.
      const revealRef = action.recordRef ?? `reveal-${pid}`;
      id(revealRef);
      this.#reveals.push(structuredClone(input as RevealRecord));
      this.#observationOutcomes.push({ participationId: pid!, sequence, outcome: outcome.outcome, reasonCodes: outcome.reasonCodes });
      if (outcome.outcome === 'ADMITTED_OBSERVATION') this.#admittedObservations.push(structuredClone(candidate));
      return revealRef;
    }
    if (actionType === 'DISQUALIFY') {
      insist(this.profile.eligibility.disqualificationAuthorities.includes(actorId), 'QUALIFICATION_NOT_ELIGIBLE', 'Disqualification authority');
      const d = exact(input, ['eventId', 'participationId', 'sequence', 'decidedAt', 'reasonCode', 'evidenceRefs'], 'INVALID_DISQUALIFICATION');
      insist(d.eventId === event.eventId && d.participationId === pid && d.sequence === sequence && d.decidedAt === now, 'INVALID_DISQUALIFICATION', 'Disqualification binding/time');
      id(d.reasonCode); idSet(d.evidenceRefs); d.evidenceRefs.forEach(hash);
      insist(this.#participations.some(p => p.participationId === pid) && !this.#disqualifications.some(other => other.participationId === pid), 'INVALID_DISQUALIFICATION', 'Unknown/already disqualified participation');
      this.#disqualifications.push(structuredClone(input as DisqualificationRecord)); return pid!;
    }
    return fail('INVALID_ACTION', `Unsupported action ${actionType}`);
  }
  submit(action: Action): IntakeDecision {
    // BEGIN_FINALIZATION is the last canonical input. Later operational refusals
    // must not append decisions, move its clock, or change the replay identity.
    this.requireIntakeOpen();
    const { actionType, actorId, participationId } = action;
    const clientTimestamp = action.clientTimestamp ?? null;
    const suppliedRecordRef = action.recordRef ?? null;
    id(actorId); if (participationId !== null) id(participationId);
    if (clientTimestamp !== null) time(clientTimestamp);
    if (suppliedRecordRef !== null) id(suppliedRecordRef);
    const now = this.clock.now(); time(now);
    const input = structuredClone(action.input); canonicalize(input);
    // Caller accessors or the supplied clock can enter the session during capture.
    // Check again outside the rejection handler before appending canonical input.
    this.requireIntakeOpen();
    const sequence = this.#intakeDecisions.length + 1;
    let decision: IntakeDecision['decision'] = 'ACCEPTED';
    let recordRef: string | null = null; let reasonCodes: string[] = [];
    try { recordRef = this.decide({ actionType, actorId, participationId, clientTimestamp, recordRef: suppliedRecordRef, input }, now, sequence); }
    catch (error) {
      if (!(error instanceof ProtocolError) || !rejectable.has(error.code)) throw error;
      decision = 'REJECTED'; reasonCodes = [error.code];
    }
    const entry: IntakeDecision = { sequence, actionType, actorId, participationId, decision, authoritativeAt: now, clientTimestamp, recordRef, reasonCodes, input };
    this.#intakeDecisions.push(entry);
    return structuredClone(entry);
  }
  derive(): Derived {
    insist(this.#state === 'FINALIZING' || this.#state === 'ATTESTED', 'INVALID_STATE_TRANSITION', 'Finalization has not begun');
    return deriveFinalization(this.#definition!.eventId, this.profile, this.#participations, this.#admittedObservations, this.#qualificationSnapshots, new Set(this.#disqualifications.map(d => d.participationId)));
  }
  buildReplayBundle(): ReplayBundle {
    this.profile.assertAllReferenced();
    const output = this.derive();
    return structuredClone({
      protocolVersion: 'powit-v0', eventSchema: this.schema, policyDefinitions: this.definitions, eventDefinition: this.#definition!,
      lifecycle: this.#lifecycle, uniquenessAssertions: sortedBy(this.#uniquenessAssertions, a => a.uniquenessToken),
      participations: sortedBy(this.#participations, p => p.participationId),
      qualificationSnapshots: sortedBy(this.#qualificationSnapshots, s => s.participationId),
      commitments: sortedBy(this.#commitments, c => c.witnessParticipationId), reveals: sortedBy(this.#reveals, r => r.witnessParticipationId),
      intakeDecisions: this.#intakeDecisions, disqualifications: sortedBy(this.#disqualifications, d => d.participationId),
      claimedObservationOutcomes: this.#observationOutcomes, claimedAdmittedObservations: output.observations,
      claimedRelationGraph: output.relationGraph, claimedSufficiencyEvaluation: output.sufficiencyEvaluation,
      claimedAggregationResult: output.aggregationResult, claimedEpistemicState: output.epistemicState,
    } satisfies ReplayBundle);
  }
  finalizeEvent(): { bundle: ReplayBundle; attestation: Attestation; attestationHash: string } {
    const bundle = this.buildReplayBundle(); const output = this.derive();
    const attestation: Attestation = {
      protocolVersion: 'powit-v0', eventId: this.#definition!.eventId,
      eventHash: structuredHash('POWIT_V0_EVENT', this.#definition!), schemaHash: structuredHash('POWIT_V0_SCHEMA', this.schema),
      acceptedParticipationSetHash: structuredHash('POWIT_V0_PARTICIPATION_SET', output.participations),
      acceptedObservationSetHash: structuredHash('POWIT_V0_OBSERVATION_SET', output.observations),
      relationGraphHash: structuredHash('POWIT_V0_RELATION_GRAPH', output.relationGraph),
      sufficiencyEvaluationHash: structuredHash('POWIT_V0_SUFFICIENCY', output.sufficiencyEvaluation),
      aggregationResultHash: output.aggregationResult === null ? null : structuredHash('POWIT_V0_AGGREGATION', output.aggregationResult),
      replayInputHash: structuredHash('POWIT_V0_REPLAY_INPUTS', bundle), epistemicState: output.epistemicState,
      version: 1, supersedes: null, finalizingAt: this.#finalizingAt!,
    };
    const attestationHash = structuredHash('POWIT_V0_ATTESTATION', attestation);
    if (this.#attestation !== null) { same(this.#attestation, attestation, 'INVALID_ATTESTATION', 'Retry result'); }
    else { this.#attestation = deepFreeze(structuredClone(attestation)); this.#state = 'ATTESTED'; }
    return { bundle, attestation: structuredClone(attestation), attestationHash };
  }
}
