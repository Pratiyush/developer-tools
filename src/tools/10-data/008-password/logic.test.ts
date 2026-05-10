import { describe, expect, it } from 'vitest';
import {
  buildAlphabet,
  entropyBits,
  generatePassword,
  strengthFor,
  timeToCrack,
} from './logic';

describe('password logic', () => {
  it('buildAlphabet honours each toggle', () => {
    expect(buildAlphabet({ upper: true, lower: false, digits: false, symbols: false, excludeAmbiguous: false }))
      .toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(buildAlphabet({ upper: false, lower: false, digits: true, symbols: false, excludeAmbiguous: false }))
      .toBe('0123456789');
  });

  it('buildAlphabet excludes ambiguous (0OoIl1) when asked', () => {
    const a = buildAlphabet({ upper: true, lower: true, digits: true, symbols: false, excludeAmbiguous: true });
    expect(a).not.toContain('0');
    expect(a).not.toContain('O');
    expect(a).not.toContain('o');
    expect(a).not.toContain('I');
    expect(a).not.toContain('l');
    expect(a).not.toContain('1');
    // Some non-ambiguous letters survive
    expect(a).toContain('A');
  });

  it('generatePassword: produces exactly N chars from the alphabet', () => {
    const a = 'ABCDEF';
    const pw = generatePassword(64, a);
    expect(pw).toHaveLength(64);
    for (const c of pw) expect(a).toContain(c);
  });

  it('generatePassword: empty for bad inputs', () => {
    expect(generatePassword(0, 'abc')).toBe('');
    expect(generatePassword(8, '')).toBe('');
  });

  it('generatePassword: many calls are different', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(generatePassword(16, 'abcdefghij'));
    // 10^16 possibilities, 200 samples — collision probability is essentially zero
    expect(seen.size).toBe(200);
  });

  it('entropyBits is length * log2(alphabet)', () => {
    expect(entropyBits(64, 'AB')).toBe(64); // log2(2)=1
    expect(Math.round(entropyBits(64, 'ABCDEFGH'))).toBe(192); // log2(8)=3
    expect(entropyBits(0, 'ABC')).toBe(0);
    expect(entropyBits(64, '')).toBe(0);
  });

  it('strengthFor bins entropy into 5 buckets', () => {
    expect(strengthFor(10)).toBe('awful');
    expect(strengthFor(35)).toBe('weak');
    expect(strengthFor(50)).toBe('okay');
    expect(strengthFor(70)).toBe('strong');
    expect(strengthFor(150)).toBe('extreme');
  });

  it('timeToCrack returns a non-empty label', () => {
    expect(timeToCrack(0)).toBe('instant');
    expect(timeToCrack(40)).toMatch(/seconds|minutes|hours|days/);
    expect(timeToCrack(80)).toMatch(/years/);
  });
});
