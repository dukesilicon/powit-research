import type {
  AggregationPolicy, Claim, ClaimVerificationPolicy, DiversityPolicy, EventDefinition,
  EventSchema, J, Observation, ObservationSchemaPolicy, Path, PolicyDefinition, PolicyRef,
  QualificationSnapshot, RelationPolicy, SufficiencyPolicy, TimingPolicy, WitnessEligibilityPolicy,
} from '@thoth/powit-types';
import { asciiCompare, canonicalize, equalCanonical, insist, structuredHash } from './codec.ts';

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const HASH = /^[a-f0-9]{64}$/;
export function record(value: unknown, code = 'INVALID_RECORD'): Record<string, unknown> {
  insist(value !== null && typeof value === 'object' && !Array.isArray(value), code, 'Expected object');
  return value as Record<string, unknown>;
}
export function exact(value: unknown, keys: string[], code = 'INVALID_RECORD'): Record<string, unknown> {
  const obj = record(value, code);
  insist(equalCanonical(Object.keys(obj).sort(), keys.slice().sort()), code, `Expected exactly: ${keys.join(', ')}`);
  canonicalize(obj);
  return obj;
}
export function id(value: unknown, code = 'INVALID_ID'): asserts value is string { insist(typeof value === 'string' && ID.test(value), code, 'Invalid Id'); }
export function hash(value: unknown): asserts value is string { insist(typeof value === 'string' && HASH.test(value), 'INVALID_HASH', 'Invalid lowercase SHA-256 hash'); }
export function time(value: unknown): asserts value is number { insist(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0, 'INVALID_TIME', 'Invalid time/count'); }
export function positive(value: unknown): asserts value is number { time(value); insist(value >= 1, 'INVALID_COUNT', 'Minimum must be >=1'); }
export function idSet(value: unknown): asserts value is string[] {
  insist(Array.isArray(value), 'INVALID_SET', 'Expected IdSet');
  value.forEach(v => id(v));
  insist(value.every((v, i) => i === 0 || asciiCompare(value[i - 1], v) < 0), 'INVALID_SET', 'IdSet must be sorted and unique');
}
export function path(value: unknown): asserts value is Path {
  insist(Array.isArray(value) && value.length > 0, 'INVALID_PATH', 'Path must be nonempty');
  value.forEach(part => id(part));
}
export function pathValue(root: unknown, parts: Path): { exists: boolean; value: J | undefined } {
  let current: unknown = root;
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || Array.isArray(current) || !Object.hasOwn(current, part)) return { exists: false, value: undefined };
    current = (current as Record<string, unknown>)[part];
  }
  return { exists: true, value: current as J };
}
export function policyRef(value: unknown): asserts value is PolicyRef {
  const ref = exact(value, ['policyId', 'policyVersion', 'definitionHash'], 'INVALID_POLICY_REF');
  id(ref.policyId); id(ref.policyVersion); hash(ref.definitionHash);
}
const policySort = (a: PolicyRef, b: PolicyRef): number => asciiCompare(a.policyId, b.policyId) || asciiCompare(a.policyVersion, b.policyVersion);
function refs(value: unknown): asserts value is PolicyRef[] {
  insist(Array.isArray(value), 'INVALID_POLICY', 'Expected policy refs'); value.forEach(policyRef);
  insist(value.every((r, i) => i === 0 || policySort(value[i - 1], r) < 0), 'INVALID_POLICY', 'Policy refs must be sorted and unique');
}
function validatePolicy(definition: unknown): void {
  const p = record(definition, 'INVALID_POLICY');
  switch (p.policyKind) {
    case 'OBSERVATION_SCHEMA_V0': {
      exact(p, ['policyKind', 'requiredPaths', 'materialClaimPath', 'abstentionPath'], 'INVALID_POLICY');
      insist(Array.isArray(p.requiredPaths), 'INVALID_POLICY', 'requiredPaths'); p.requiredPaths.forEach(path);
      path(p.materialClaimPath);
      if (p.abstentionPath !== null) {
        path(p.abstentionPath);
        insist(!equalCanonical(p.abstentionPath, p.materialClaimPath) && !p.requiredPaths.some(q => equalCanonical(q, p.abstentionPath)), 'INVALID_POLICY', 'Abstention path overlaps required/material path');
      }
      break;
    }
    case 'WITNESS_ELIGIBILITY_V0':
      exact(p, ['policyKind', 'assuranceProviders', 'acceptedAssuranceMethods', 'disqualificationAuthorities'], 'INVALID_POLICY');
      idSet(p.assuranceProviders); refs(p.acceptedAssuranceMethods); idSet(p.disqualificationAuthorities); break;
    case 'RELATION_CLAIM_VALUE_EQUALITY_V0':
      exact(p, ['policyKind', 'dimensions'], 'INVALID_POLICY');
      insist(Array.isArray(p.dimensions), 'INVALID_POLICY', 'Dimensions');
      for (const d of p.dimensions) {
        const dim = exact(d, ['dimensionId', 'claimType', 'claimPath', 'valueType', 'normalization', 'relevantAt', 'acceptedVerificationPolicies'], 'INVALID_POLICY');
        id(dim.dimensionId); id(dim.claimType); path(dim.claimPath); refs(dim.acceptedVerificationPolicies);
        insist(['STRING', 'BOOLEAN', 'INTEGER', 'ARRAY', 'OBJECT'].includes(String(dim.valueType)) && dim.normalization === 'JCS_VALUE' && dim.relevantAt === 'QUALIFICATION_RELEVANT_AT', 'INVALID_POLICY', 'Unsupported relation dimension');
      }
      const dimensions = p.dimensions as { dimensionId: string }[];
      insist(dimensions.every((d, i) => i === 0 || asciiCompare(dimensions[i - 1].dimensionId, d.dimensionId) < 0), 'INVALID_POLICY', 'Dimensions must be sorted');
      break;
    case 'UPSTREAM_ASSURANCE_METHOD_V0': exact(p, ['policyKind', 'provider', 'method'], 'INVALID_POLICY'); id(p.provider); id(p.method); break;
    case 'CLAIM_VERIFICATION_V0': exact(p, ['policyKind', 'issuerId'], 'INVALID_POLICY'); id(p.issuerId); break;
    case 'RELATIONAL_DIVERSITY_V0': exact(p, ['policyKind', 'distinctValueDimensions'], 'INVALID_POLICY'); idSet(p.distinctValueDimensions); break;
    case 'SUFFICIENCY_V0':
      exact(p, ['policyKind', 'requirements'], 'INVALID_POLICY');
      insist(Array.isArray(p.requirements) && p.requirements.length > 0, 'INVALID_POLICY', 'At least one sufficiency requirement');
      const ids = new Set<string>();
      for (const raw of p.requirements) {
        const r = record(raw, 'INVALID_POLICY'); id(r.requirementId); positive(r.minimum);
        insist(!ids.has(r.requirementId), 'INVALID_POLICY', 'Duplicate requirement'); ids.add(r.requirementId);
        if (r.operator === 'MIN_ACCEPTED_OBSERVATIONS') exact(r, ['requirementId', 'operator', 'minimum'], 'INVALID_POLICY');
        else if (r.operator === 'MIN_DISTINCT_VERIFIED_VALUES') { exact(r, ['requirementId', 'operator', 'dimension', 'minimum'], 'INVALID_POLICY'); id(r.dimension); }
        else insist(false, 'INVALID_POLICY', 'Unsupported sufficiency operator');
      }
      break;
    case 'AGGREGATION_V0': exact(p, ['policyKind', 'reducer'], 'INVALID_POLICY'); insist(p.reducer === 'EXACT_MATCH', 'INVALID_POLICY', 'Unsupported reducer'); break;
    case 'TIMING_V0': exact(p, ['policyKind', 'observationTimeAuthority', 'allowObservationCommitOverlap'], 'INVALID_POLICY'); insist(p.observationTimeAuthority === 'PROTOCOL_ACCEPTANCE' && typeof p.allowObservationCommitOverlap === 'boolean', 'INVALID_POLICY', 'Unsupported timing policy'); break;
    default: insist(false, 'UNSUPPORTED_POLICY', `Unsupported policy kind ${String(p.policyKind)}`);
  }
}
export type Profile = {
  schema: EventSchema; definitions: PolicyDefinition[];
  observation: ObservationSchemaPolicy; eligibility: WitnessEligibilityPolicy; relation: RelationPolicy;
  diversity: DiversityPolicy; sufficiency: SufficiencyPolicy; aggregation: AggregationPolicy; timing: TimingPolicy;
  resolve: (ref: PolicyRef) => J;
  assertAllReferenced: () => void;
};
export function validateSchema(schema: EventSchema, definitions: PolicyDefinition[]): Profile {
  const s = exact(schema, ['protocolVersion', 'schemaId', 'schemaVersion', 'observationSchema', 'witnessEligibilityPolicy', 'requiredClaims', 'relationPolicy', 'relationalDiversityPolicy', 'sufficiencyPolicy', 'aggregationPolicy', 'timingPolicy', 'evidencePolicy', 'authenticationPolicy', 'challengePolicy'], 'INVALID_SCHEMA');
  insist(s.protocolVersion === 'powit-v0', 'INVALID_SCHEMA', 'Wrong protocol version'); id(s.schemaId); id(s.schemaVersion); idSet(s.requiredClaims);
  insist(s.requiredClaims.length === 0, 'UNSUPPORTED_POLICY', 'Nonempty requiredClaims has no frozen v0 eligibility rule');
  for (const key of ['observationSchema', 'witnessEligibilityPolicy', 'relationPolicy', 'relationalDiversityPolicy', 'sufficiencyPolicy', 'aggregationPolicy', 'timingPolicy']) policyRef(s[key]);
  insist(s.evidencePolicy === null && s.authenticationPolicy === null && s.challengePolicy === null, 'UNSUPPORTED_POLICY', 'B05/B06 profile is not implemented');
  insist(Array.isArray(definitions), 'INVALID_POLICY', 'Definitions required');
  const byKey = new Map<string, PolicyDefinition>();
  definitions.forEach((row, i) => {
    const entry = exact(row, ['policy', 'definition'], 'INVALID_POLICY'); policyRef(entry.policy); validatePolicy(entry.definition);
    insist(structuredHash('POWIT_V0_POLICY', entry.definition) === entry.policy.definitionHash, 'POLICY_HASH_MISMATCH', 'Policy definition hash mismatch');
    const key = `${entry.policy.policyId}\0${entry.policy.policyVersion}`;
    insist(!byKey.has(key) && (i === 0 || policySort(definitions[i - 1].policy, entry.policy) < 0), 'INVALID_POLICY', 'Definitions must be sorted and unique');
    byKey.set(key, row);
  });
  const used = new Set<string>();
  const resolve = (ref: PolicyRef): J => {
    policyRef(ref); const key = `${ref.policyId}\0${ref.policyVersion}`;
    const row = byKey.get(key); insist(row && equalCanonical(row.policy, ref), 'POLICY_REF_MISMATCH', 'Unresolved policy reference');
    used.add(key); return row.definition;
  };
  const assertAllReferenced = (): void => { insist(used.size === byKey.size, 'INVALID_POLICY', 'Unused policy definition'); };
  const typed = <T extends J>(ref: PolicyRef, kind: string): T => {
    const def = resolve(ref) as Record<string, J>; insist(def.policyKind === kind, 'INVALID_POLICY', `Expected ${kind}`); return def as T;
  };
  const profile: Profile = {
    schema, definitions,
    observation: typed<ObservationSchemaPolicy>(schema.observationSchema, 'OBSERVATION_SCHEMA_V0'),
    eligibility: typed<WitnessEligibilityPolicy>(schema.witnessEligibilityPolicy, 'WITNESS_ELIGIBILITY_V0'),
    relation: typed<RelationPolicy>(schema.relationPolicy, 'RELATION_CLAIM_VALUE_EQUALITY_V0'),
    diversity: typed<DiversityPolicy>(schema.relationalDiversityPolicy, 'RELATIONAL_DIVERSITY_V0'),
    sufficiency: typed<SufficiencyPolicy>(schema.sufficiencyPolicy, 'SUFFICIENCY_V0'),
    aggregation: typed<AggregationPolicy>(schema.aggregationPolicy, 'AGGREGATION_V0'),
    timing: typed<TimingPolicy>(schema.timingPolicy, 'TIMING_V0'), resolve, assertAllReferenced,
  };
  insist(profile.timing.allowObservationCommitOverlap, 'UNSUPPORTED_POLICY', 'Nonoverlapping observation/commit windows cannot admit a report in this v0 profile');
  for (const method of profile.eligibility.acceptedAssuranceMethods) typed(method, 'UPSTREAM_ASSURANCE_METHOD_V0');
  const dimensionIds = new Set(profile.relation.dimensions.map(d => d.dimensionId));
  for (const dim of profile.relation.dimensions) for (const ref of dim.acceptedVerificationPolicies) typed<ClaimVerificationPolicy>(ref, 'CLAIM_VERIFICATION_V0');
  for (const requirement of profile.sufficiency.requirements) if (requirement.operator === 'MIN_DISTINCT_VERIFIED_VALUES') {
    insist(dimensionIds.has(requirement.dimension) && profile.diversity.distinctValueDimensions.includes(requirement.dimension), 'INVALID_POLICY', 'Unknown diversity dimension');
  }
  return profile;
}
export function validateEventDefinition(def: EventDefinition, profile: Profile): void {
  const e = exact(def, ['protocolVersion', 'eventId', 'schemaId', 'schemaVersion', 'schemaHash', 'windows', 'configuration'], 'INVALID_EVENT');
  insist(e.protocolVersion === 'powit-v0', 'INVALID_EVENT', 'Protocol version'); id(e.eventId);
  insist(e.schemaId === profile.schema.schemaId && e.schemaVersion === profile.schema.schemaVersion && e.schemaHash === structuredHash('POWIT_V0_SCHEMA', profile.schema), 'INVALID_EVENT', 'Schema binding');
  const w = exact(e.windows, ['enrollmentOpensAt', 'enrollmentClosesAt', 'observationOpensAt', 'observationClosesAt', 'commitOpensAt', 'commitClosesAt', 'revealOpensAt', 'revealClosesAt'], 'INVALID_EVENT');
  for (const value of Object.values(w)) time(value);
  for (const prefix of ['enrollment', 'observation', 'commit', 'reveal']) {
    insist((w[`${prefix}OpensAt`] as number) < (w[`${prefix}ClosesAt`] as number), 'INVALID_EVENT', 'Empty window');
  }
  insist((w.revealOpensAt as number) >= (w.commitClosesAt as number) && (w.enrollmentClosesAt as number) <= (w.commitClosesAt as number), 'INVALID_EVENT', 'Window order');
  insist(Math.max(w.observationOpensAt as number, w.commitOpensAt as number) < Math.min(w.observationClosesAt as number, w.commitClosesAt as number), 'INVALID_EVENT', 'Observation and commitment windows have no shared admission time');
  insist(e.configuration !== null && typeof e.configuration === 'object' && !Array.isArray(e.configuration), 'INVALID_EVENT', 'Configuration must be object');
}
export function validateClaim(claim: Claim, snapshot: QualificationSnapshot, profile: Profile): void {
  const c = exact(claim, ['eventId', 'claimId', 'subjectParticipationId', 'claimType', 'value', 'credential', 'provenance', 'verificationState', 'verificationPolicy', 'validFrom', 'validUntil'], 'INVALID_CLAIM');
  id(c.claimId); id(c.claimType);
  insist(c.eventId === snapshot.eventId && c.subjectParticipationId === snapshot.participationId, 'INVALID_CLAIM', 'Claim binding');
  insist(c.value !== null || c.credential !== null, 'INVALID_CLAIM', 'Empty claim');
  insist(['SELF_DECLARED', 'CREDENTIAL', 'PRESENCE', 'THIRD_PARTY', 'DERIVED'].includes(String(c.provenance)), 'INVALID_CLAIM', 'Provenance');
  insist(['VERIFIED', 'UNVERIFIED', 'INVALID'].includes(String(c.verificationState)), 'INVALID_CLAIM', 'Verification state');
  time(c.validFrom); if (c.validUntil !== null) { time(c.validUntil); insist(c.validUntil > c.validFrom, 'INVALID_CLAIM', 'Claim validity window'); }
  if (c.credential !== null) {
    const credential = exact(c.credential, ['issuerId', 'credentialRef', 'proofRef'], 'INVALID_CLAIM'); id(credential.issuerId);
    insist(typeof credential.credentialRef === 'string' && credential.credentialRef.length > 0 && (credential.proofRef === null || (typeof credential.proofRef === 'string' && credential.proofRef.length > 0)), 'INVALID_CLAIM', 'Credential reference');
  }
  if (c.verificationPolicy !== null) { policyRef(c.verificationPolicy); profile.resolve(claim.verificationPolicy!); }
  if (c.verificationState === 'VERIFIED') {
    insist(c.credential !== null && c.verificationPolicy !== null, 'INVALID_CLAIM', 'Verified claim lacks proof');
    const verification = profile.resolve(claim.verificationPolicy!) as ClaimVerificationPolicy;
    insist(verification.policyKind === 'CLAIM_VERIFICATION_V0' && verification.issuerId === claim.credential!.issuerId, 'INVALID_CLAIM', 'Issuer mismatch');
  }
}
export function validateSnapshot(snapshot: QualificationSnapshot, event: EventDefinition, profile: Profile): void {
  const s = exact(snapshot, ['eventId', 'participationId', 'schemaHash', 'policy', 'evaluatedAt', 'relevantAt', 'claims', 'eligible'], 'INVALID_QUALIFICATION');
  insist(s.eventId === event.eventId && s.schemaHash === event.schemaHash && equalCanonical(s.policy, profile.schema.witnessEligibilityPolicy) && s.eligible === true, 'QUALIFICATION_NOT_ELIGIBLE', 'Qualification binding');
  id(s.participationId); time(s.evaluatedAt); time(s.relevantAt);
  insist(Array.isArray(s.claims), 'INVALID_QUALIFICATION', 'Claims required');
  const claims = s.claims as Claim[];
  claims.forEach((claim: Claim, i: number) => {
    validateClaim(claim, snapshot, profile);
    insist(i === 0 || asciiCompare(claims[i - 1].claimId, claim.claimId) < 0, 'INVALID_QUALIFICATION', 'Claims unsorted or duplicate');
  });
}
export function observationOutcome(candidate: Observation, profile: Profile): { outcome: 'ADMITTED_OBSERVATION' | 'EXPLICIT_ABSTENTION' | 'INVALID_OBSERVATION'; reasonCodes: string[] } {
  const report = candidate.report;
  if (report === null || typeof report !== 'object' || Array.isArray(report)) return { outcome: 'INVALID_OBSERVATION', reasonCodes: ['REPORT_NOT_OBJECT'] };
  const reasons = new Set<string>();
  for (const required of profile.observation.requiredPaths) if (!pathValue(report, required).exists) reasons.add('REQUIRED_REPORT_PATH_MISSING');
  const material = pathValue(report, profile.observation.materialClaimPath);
  if (!material.exists) reasons.add('MATERIAL_CLAIM_PATH_MISSING');
  const abstention = profile.observation.abstentionPath && pathValue(report, profile.observation.abstentionPath).value === true;
  if (!abstention && material.exists && material.value === null) reasons.add('MATERIAL_CLAIM_NULL');
  if (reasons.size) return { outcome: 'INVALID_OBSERVATION', reasonCodes: [...reasons].sort(asciiCompare) };
  return { outcome: abstention ? 'EXPLICIT_ABSTENTION' : 'ADMITTED_OBSERVATION', reasonCodes: [] };
}
