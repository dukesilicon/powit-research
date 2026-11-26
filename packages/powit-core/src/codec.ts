import { createHash } from 'node:crypto';
import type { J } from '@thoth/powit-types';

export const DOMAINS = [
  'POWIT_V0_SCHEMA', 'POWIT_V0_EVENT', 'POWIT_V0_POLICY', 'POWIT_V0_OBSERVATION',
  'POWIT_V0_EVIDENCE_MANIFEST', 'POWIT_V0_COMMIT', 'POWIT_V0_UNIQUENESS_ASSERTION',
  'POWIT_V0_RELATION_GRAPH', 'POWIT_V0_SUFFICIENCY', 'POWIT_V0_AGGREGATION',
  'POWIT_V0_PARTICIPATION_SET', 'POWIT_V0_OBSERVATION_SET', 'POWIT_V0_REPLAY_INPUTS',
  'POWIT_V0_ATTESTATION',
] as const;
export type Domain = typeof DOMAINS[number];

export class ProtocolError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.name = 'ProtocolError'; this.code = code; }
}
export function fail(code: string, message: string): never { throw new ProtocolError(code, message); }
export function insist(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) fail(code, message);
}

function validUnicode(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      if (++i >= text.length || text.charCodeAt(i) < 0xdc00 || text.charCodeAt(i) > 0xdfff) return false;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}

/** UTF-16 property order is JavaScript's default string order; arrays are never reordered. */
export function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') { insist(validUnicode(value), 'INVALID_UNICODE', 'Lone surrogate'); return JSON.stringify(value); }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    insist(Number.isSafeInteger(value), 'INVALID_NUMBER', 'Only safe mathematical integers are permitted');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  insist(typeof value === 'object', 'INVALID_JSON', 'Unsupported JSON value');
  const prototype = Object.getPrototypeOf(value);
  insist(prototype === Object.prototype || prototype === null, 'INVALID_JSON', 'Non-plain object');
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map(key => `${canonicalize(key)}:${canonicalize(object[key])}`).join(',')}}`;
}
export function canonicalBytes(value: unknown): Uint8Array { return Buffer.from(canonicalize(value), 'utf8'); }
export function structuredHash(domain: Domain, value: unknown): string {
  insist(DOMAINS.includes(domain), 'INVALID_DOMAIN', 'Unknown v0 domain');
  return createHash('sha256').update(domain, 'ascii').update(Buffer.from([0])).update(canonicalBytes(value)).digest('hex');
}
export function rawSha256(bytes: Uint8Array): string { return createHash('sha256').update(bytes).digest('hex'); }
export function equalCanonical(a: unknown, b: unknown): boolean { return canonicalize(a) === canonicalize(b); }
export function asciiCompare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
export function utf8Compare(a: unknown, b: unknown): number { return Buffer.compare(canonicalBytes(a), canonicalBytes(b)); }
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Parse untrusted text before JSON.parse can round a number or erase duplicate keys. */
export function parseJsonStrict(source: string): J {
  let i = 0;
  const ws = () => { while (/[\t\n\r ]/.test(source[i] ?? '\u0000')) i++; };
  const string = (): string => {
    insist(source[i] === '"', 'INVALID_JSON', 'Expected string');
    const start = i++;
    while (i < source.length) {
      if (source[i] === '\\') { i += 2; continue; }
      if (source[i++] === '"') {
        const value = JSON.parse(source.slice(start, i)) as string;
        insist(validUnicode(value), 'INVALID_UNICODE', 'Lone surrogate');
        return value;
      }
    }
    return fail('INVALID_JSON', 'Unterminated string');
  };
  const number = (): number => {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(i));
    insist(match, 'INVALID_JSON', 'Invalid number');
    const token = match[0]; i += token.length;
    const parts = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(token)!;
    const digits = parts[2] + (parts[3] ?? '');
    const significant = digits.replace(/^0+/, '');
    if (!significant) return 0;
    const exponent = Number(parts[4] ?? 0) - (parts[3]?.length ?? 0);
    insist(Number.isSafeInteger(exponent) && Math.abs(exponent) < 1000, 'INVALID_NUMBER', 'Exponent out of range');
    let integerDigits = significant;
    if (exponent < 0) {
      const places = -exponent;
      insist(places <= integerDigits.length && /^0*$/.test(integerDigits.slice(-places)), 'INVALID_NUMBER', 'Fractional number');
      integerDigits = integerDigits.slice(0, -places);
    } else {
      insist(integerDigits.length + exponent <= 16, 'INVALID_NUMBER', 'Unsafe integer');
      integerDigits += '0'.repeat(exponent);
    }
    const exact = BigInt((parts[1] ? '-' : '') + (integerDigits || '0'));
    insist(exact >= -9007199254740991n && exact <= 9007199254740991n, 'INVALID_NUMBER', 'Unsafe integer');
    return Number(exact);
  };
  const value = (): J => {
    ws(); const c = source[i];
    if (c === '"') return string();
    if (c === '[') {
      i++; const result: J[] = []; ws(); if (source[i] === ']') { i++; return result; }
      while (true) { result.push(value()); ws(); if (source[i] === ']') { i++; return result; } insist(source[i++] === ',', 'INVALID_JSON', 'Expected comma'); }
    }
    if (c === '{') {
      i++; const result: Record<string, J> = Object.create(null) as Record<string, J>;
      ws(); if (source[i] === '}') { i++; return result; }
      while (true) {
        ws(); const key = string(); insist(!Object.hasOwn(result, key), 'DUPLICATE_KEY', `Duplicate key ${key}`);
        ws(); insist(source[i++] === ':', 'INVALID_JSON', 'Expected colon'); result[key] = value(); ws();
        if (source[i] === '}') { i++; return result; } insist(source[i++] === ',', 'INVALID_JSON', 'Expected comma');
      }
    }
    for (const [literal, val] of [['true', true], ['false', false], ['null', null]] as const) {
      if (source.startsWith(literal, i)) { i += literal.length; return val; }
    }
    if (c === '-' || /\d/.test(c ?? '')) return number();
    return fail('INVALID_JSON', 'Invalid JSON token');
  };
  const parsed = value(); ws(); insist(i === source.length, 'INVALID_JSON', 'Trailing JSON content'); return parsed;
}
