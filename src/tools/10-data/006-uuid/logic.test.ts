import { describe, expect, it } from 'vitest';
import { formatUuid, generateUuid, generateUuids, isValidUuid, parseUuidAnatomy } from './logic';

describe('uuid logic', () => {
  it('generates a valid v4 UUID', () => {
    const u = generateUuid();
    expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('produces unique values across many calls', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(generateUuid());
    expect(seen.size).toBe(200);
  });

  it('generateUuids returns N entries', () => {
    expect(generateUuids(5)).toHaveLength(5);
    expect(generateUuids(0)).toHaveLength(0);
    expect(generateUuids(-1)).toHaveLength(0);
  });

  it('formatUuid: hyphen + lower (default canonical)', () => {
    const u = '550e8400-e29b-41d4-a716-446655440000';
    expect(formatUuid(u, { case: 'lower', format: 'hyphen' })).toBe(u);
  });

  it('formatUuid: plain strips hyphens', () => {
    const u = '550e8400-e29b-41d4-a716-446655440000';
    expect(formatUuid(u, { case: 'lower', format: 'plain' })).toBe('550e8400e29b41d4a716446655440000');
  });

  it('formatUuid: braces wraps with {}', () => {
    const u = '550e8400-e29b-41d4-a716-446655440000';
    expect(formatUuid(u, { case: 'lower', format: 'braces' })).toBe(
      '{550e8400-e29b-41d4-a716-446655440000}',
    );
  });

  it('formatUuid: urn prefix', () => {
    const u = '550e8400-e29b-41d4-a716-446655440000';
    expect(formatUuid(u, { case: 'lower', format: 'urn' })).toBe(
      'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('formatUuid: uppercase upcases everything except urn prefix', () => {
    const u = '550e8400-e29b-41d4-a716-446655440000';
    expect(formatUuid(u, { case: 'upper', format: 'hyphen' })).toBe(
      '550E8400-E29B-41D4-A716-446655440000',
    );
  });

  it('isValidUuid: accepts canonical (case-insensitive)', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('isValidUuid: rejects malformed', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('')).toBe(false);
    expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('parseUuidAnatomy: decomposes a v4 UUID', () => {
    // RFC 4122 §4.1.2 example
    const a = parseUuidAnatomy('550e8400-e29b-41d4-a716-446655440000');
    expect(a).not.toBeNull();
    if (!a) return;
    expect(a.timeLow).toBe('550e8400');
    expect(a.timeMid).toBe('e29b');
    expect(a.timeHiAndVersion).toBe('41d4');
    expect(a.clockSeqHiAndReserved).toBe('a7');
    expect(a.clockSeqLow).toBe('16');
    expect(a.node).toBe('446655440000');
    expect(a.version).toBe(4);
    expect(a.variant).toBe('RFC 4122');
  });

  it('parseUuidAnatomy: returns null on garbage', () => {
    expect(parseUuidAnatomy('not-a-uuid')).toBeNull();
  });
});
