import { describe, expect, it } from 'vitest';
import {
  PRESETS,
  alphabetFor,
  bitsPerChar,
  entropyBits,
  generateToken,
  lengthForEntropy,
} from './logic';

describe('token-generator logic', () => {
  it('exposes the five named presets', () => {
    expect(PRESETS).toEqual(['base64url', 'hex', 'alnum', 'numeric', 'base58']);
  });

  it('alphabetFor: base64url is the URL-safe RFC-4648 alphabet', () => {
    expect(alphabetFor('base64url')).toContain('-');
    expect(alphabetFor('base64url')).toContain('_');
    expect(alphabetFor('base64url').length).toBe(64);
  });

  it('bitsPerChar: hex = 4, base64url = 6, alnum ≈ 5.95', () => {
    expect(bitsPerChar(alphabetFor('hex'))).toBe(4);
    expect(bitsPerChar(alphabetFor('base64url'))).toBe(6);
    expect(bitsPerChar(alphabetFor('alnum'))).toBeCloseTo(5.954, 2);
  });

  it('lengthForEntropy: 128 bits hex → 32 chars', () => {
    expect(lengthForEntropy(alphabetFor('hex'), 128)).toBe(32);
  });

  it('generateToken returns N chars from the alphabet', () => {
    const a = alphabetFor('hex');
    const t = generateToken(32, a);
    expect(t).toHaveLength(32);
    for (const c of t) expect(a).toContain(c);
  });

  it('generateToken: 200 calls all unique', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(generateToken(16, alphabetFor('hex')));
    expect(seen.size).toBe(200);
  });

  it('entropyBits scales with length', () => {
    expect(entropyBits(32, alphabetFor('hex'))).toBe(128);
    expect(entropyBits(0, alphabetFor('hex'))).toBe(0);
  });

  it('empty inputs return empty string', () => {
    expect(generateToken(0, 'abc')).toBe('');
    expect(generateToken(8, '')).toBe('');
  });
});
