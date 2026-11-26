import type {
  AggregationResult, Claim, EpistemicState, J, Observation, QualificationSnapshot,
  RelationConflict, RelationDimension, RelationGraph, SufficiencyEvaluation, WitnessParticipation,
} from '@thoth/powit-types';
import { asciiCompare, canonicalize, insist, utf8Compare } from './codec.ts';
import { pathValue, type Profile } from './validation.ts';

type Known = { value: J; claimIds: string[] };
type DimensionValue = { known: Known | null; applicableIds: string[]; conflict: RelationConflict | null };
const sorted = (items: string[]): string[] => [...new Set(items)].sort(asciiCompare);
function hasDeclaredType(value: J | undefined, type: RelationDimension['valueType']): value is J {
  if (value === undefined || value === null) return false;
  switch (type) {
    case 'STRING': return typeof value === 'string';
    case 'BOOLEAN': return typeof value === 'boolean';
    case 'INTEGER': return typeof value === 'number' && Number.isSafeInteger(value);
    case 'ARRAY': return Array.isArray(value);
    case 'OBJECT': return typeof value === 'object' && !Array.isArray(value);
  }
}
function dimensionValue(snapshot: QualificationSnapshot | undefined, dim: RelationDimension): DimensionValue {
  if (!snapshot) return { known: null, applicableIds: [], conflict: null };
  const values = new Map<string, Known>();
  for (const claim of snapshot.claims) {
    if (claim.claimType !== dim.claimType || claim.verificationState !== 'VERIFIED' || claim.verificationPolicy === null || claim.credential === null) continue;
    if (!dim.acceptedVerificationPolicies.some(ref => canonicalize(ref) === canonicalize(claim.verificationPolicy))) continue;
    if (claim.validFrom > snapshot.relevantAt || (claim.validUntil !== null && snapshot.relevantAt >= claim.validUntil)) continue;
    const got = pathValue(claim.value, dim.claimPath);
    if (!got.exists || !hasDeclaredType(got.value, dim.valueType)) continue;
    const key = canonicalize(got.value);
    const previous = values.get(key);
    if (previous) previous.claimIds.push(claim.claimId);
    else values.set(key, { value: got.value, claimIds: [claim.claimId] });
  }
  const entries = [...values.values()].sort((a, b) => utf8Compare(a.value, b.value));
  for (const entry of entries) entry.claimIds = sorted(entry.claimIds);
  const applicableIds = sorted(entries.flatMap(entry => entry.claimIds));
  if (entries.length === 0) return { known: null, applicableIds, conflict: null };
  if (entries.length === 1) return { known: entries[0], applicableIds, conflict: null };
  return {
    known: null, applicableIds,
    conflict: {
      participationId: snapshot.participationId, dimension: dim.dimensionId, claimIds: applicableIds,
      canonicalValues: entries.map(entry => ({ canonicalValue: entry.value, claimIds: entry.claimIds })),
    },
  };
}
export type Derived = {
  participations: WitnessParticipation[]; observations: Observation[]; relationGraph: RelationGraph;
  sufficiencyEvaluation: SufficiencyEvaluation; aggregationResult: AggregationResult | null; epistemicState: EpistemicState;
};
export function deriveFinalization(
  eventId: string, profile: Profile, participations: WitnessParticipation[], admitted: Observation[],
  snapshots: QualificationSnapshot[], disqualifiedIds: Set<string>,
): Derived {
  const observations = admitted.filter(o => !disqualifiedIds.has(o.witnessParticipationId))
    .sort((a, b) => asciiCompare(a.witnessParticipationId, b.witnessParticipationId));
  const activeIds = new Set(observations.map(o => o.witnessParticipationId));
  insist(activeIds.size === observations.length, 'DUPLICATE_OBSERVATION', 'At most one Observation per participation');
  const acceptedParticipations = participations.filter(p => activeIds.has(p.participationId))
    .sort((a, b) => asciiCompare(a.participationId, b.participationId));
  insist(acceptedParticipations.length === observations.length, 'INVALID_PARTICIPATION', 'Observation lacks participation');
  const participantIds = acceptedParticipations.map(p => p.participationId);
  const snapshotsById = new Map(snapshots.map(s => [s.participationId, s]));
  const values = new Map<string, DimensionValue>();
  const conflicts: RelationConflict[] = [];
  for (const pid of participantIds) for (const dim of profile.relation.dimensions) {
    const found = dimensionValue(snapshotsById.get(pid), dim);
    values.set(`${pid}\0${dim.dimensionId}`, found);
    if (found.conflict) conflicts.push(found.conflict);
  }
  conflicts.sort((a, b) => asciiCompare(a.participationId, b.participationId) || asciiCompare(a.dimension, b.dimension));
  const relations: RelationGraph['relations'] = [];
  for (let i = 0; i < participantIds.length; i++) for (let j = i + 1; j < participantIds.length; j++) {
    for (const dim of profile.relation.dimensions) {
      const left = values.get(`${participantIds[i]}\0${dim.dimensionId}`)!;
      const right = values.get(`${participantIds[j]}\0${dim.dimensionId}`)!;
      relations.push({
        leftParticipationId: participantIds[i], rightParticipationId: participantIds[j], dimension: dim.dimensionId,
        status: !left.known || !right.known ? 'UNKNOWN' : canonicalize(left.known.value) === canonicalize(right.known.value) ? 'KNOWN_RELATED' : 'KNOWN_DISTINCT',
        claimIds: sorted([...left.applicableIds, ...right.applicableIds]),
      });
    }
  }
  const relationGraph: RelationGraph = {
    eventId, policy: profile.schema.relationPolicy, participantIds,
    dimensions: profile.relation.dimensions.map(d => d.dimensionId).sort(asciiCompare), relations, conflicts,
  };
  const requirements: SufficiencyEvaluation['requirements'] = profile.sufficiency.requirements.map((req): SufficiencyEvaluation['requirements'][number] => {
    if (req.operator === 'MIN_ACCEPTED_OBSERVATIONS') return {
      requirementId: req.requirementId, operator: req.operator, parameters: { minimum: req.minimum },
      observedValue: observations.length, passed: observations.length >= req.minimum, claimIds: [], relationKeys: [],
    };
    const distinct = new Set<string>();
    const claimIds: string[] = [];
    for (const pid of participantIds) {
      const value = values.get(`${pid}\0${req.dimension}`)!;
      if (!value.known) continue;
      distinct.add(canonicalize(value.known.value)); claimIds.push(...value.known.claimIds);
    }
    return {
      requirementId: req.requirementId, operator: req.operator,
      parameters: { dimension: req.dimension, minimum: req.minimum },
      observedValue: distinct.size, passed: distinct.size >= req.minimum, claimIds: sorted(claimIds), relationKeys: [],
    };
  });
  const sufficiencyEvaluation: SufficiencyEvaluation = {
    eventId, policy: profile.schema.sufficiencyPolicy, requirements,
    overallSufficient: requirements.every(r => r.passed),
  };
  let aggregationResult: AggregationResult | null = null;
  if (observations.length > 0) {
    const buckets = new Map<string, { canonicalValue: J; observationCount: number; participationIds: string[] }>();
    for (const observation of observations) {
      const got = pathValue(observation.report, profile.observation.materialClaimPath);
      insist(got.exists && got.value !== null && got.value !== undefined, 'INVALID_OBSERVATION', 'Admitted material claim is missing');
      const key = canonicalize(got.value);
      const bucket = buckets.get(key);
      if (bucket) { bucket.observationCount++; bucket.participationIds.push(observation.witnessParticipationId); }
      else buckets.set(key, { canonicalValue: got.value, observationCount: 1, participationIds: [observation.witnessParticipationId] });
    }
    const entries = [...buckets.values()].sort((a, b) => utf8Compare(a.canonicalValue, b.canonicalValue));
    for (const entry of entries) entry.participationIds.sort(asciiCompare);
    aggregationResult = {
      eventId, policy: profile.schema.aggregationPolicy, reducer: 'EXACT_MATCH',
      materialClaimPath: profile.observation.materialClaimPath,
      assessment: entries.length === 1 ? 'CONVERGENT' : 'MATERIALLY_DIVIDED', values: entries,
    };
  }
  const epistemicState: EpistemicState = observations.length === 0 ? 'SILENT'
    : !sufficiencyEvaluation.overallSufficient ? 'THIN'
      : aggregationResult!.assessment === 'CONVERGENT' ? 'CONCORDANT' : 'SPLIT';
  return { participations: acceptedParticipations, observations, relationGraph, sufficiencyEvaluation, aggregationResult, epistemicState };
}
