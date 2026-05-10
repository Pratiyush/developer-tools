import { describe, expect, it } from 'vitest';
import { decodeTimestamp, generateUlid, generateUlids, isValidUlid } from './logic';

describe('ulid logic', () => {
  it('produces a 26-char Crockford-base32 string', () => {
    const u = generateUlid();
    expect(u).toHaveLength(26);
    expect(/^[0-9A-HJKMNP-TV-Z]{26}$/.test(u)).toBe(true);
  });

  it('honours an injected timestamp (round-trip)', () => {
    const ts = 1_700_000_000_000;
    const u = generateUlid(ts);
    expect(decodeTimestamp(u)).toBe(ts);
  });

  it('orders lexicographically in time order', () => {
    const earlier = generateUlid(1_000);
    const later = generateUlid(2_000);
    expect(earlier < later).toBe(true);
  });

  it('generateUlids returns N items (or [] for bad inputs)', () => {
    expect(generateUlids(5)).toHaveLength(5);
    expect(generateUlids(0)).toHaveLength(0);
    expect(generateUlids(-1)).toHaveLength(0);
  });

  it('produces unique IDs across many calls', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(generateUlid());
    expect(seen.size).toBe(200);
  });

  it('isValidUlid matches the spec', () => {
    expect(isValidUlid('01HMG7HT4XKAB6XCYF3JFQR2T8')).toBe(true);
    // 'I', 'L', 'O', 'U' are excluded from the Crockford alphabet
    expect(isValidUlid('01HMG7HT4XKABILOUF3JFQR2T8')).toBe(false);
    expect(isValidUlid('too-short')).toBe(false);
  });

  it('decodeTimestamp returns null for invalid input', () => {
    expect(decodeTimestamp('not-a-ulid')).toBeNull();
  });
});
