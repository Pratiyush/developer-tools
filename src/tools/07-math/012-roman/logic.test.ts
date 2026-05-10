import { describe, expect, it } from 'vitest';
import { fromRoman, toRoman } from './logic';

describe('roman logic', () => {
  it('encodes the basic pairs', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(40)).toBe('XL');
    expect(toRoman(90)).toBe('XC');
    expect(toRoman(400)).toBe('CD');
    expect(toRoman(900)).toBe('CM');
    expect(toRoman(1994)).toBe('MCMXCIV');
    expect(toRoman(3999)).toBe('MMMCMXCIX');
  });

  it('rejects out-of-range', () => {
    expect(toRoman(0)).toBeNull();
    expect(toRoman(4000)).toBeNull();
    expect(toRoman(1.5)).toBeNull();
  });

  it('decodes back', () => {
    expect(fromRoman('MCMXCIV')).toBe(1994);
    expect(fromRoman('mcmxciv')).toBe(1994);
    expect(fromRoman('XLII')).toBe(42);
  });

  it('rejects non-canonical forms', () => {
    expect(fromRoman('IIII')).toBeNull(); // canonical is IV
    expect(fromRoman('VV')).toBeNull();
  });

  it('round-trips 1..3999', () => {
    for (const n of [1, 7, 49, 200, 999, 1500, 3000, 3999]) {
      const r = toRoman(n);
      expect(r).not.toBeNull();
      if (r !== null) expect(fromRoman(r)).toBe(n);
    }
  });
});
