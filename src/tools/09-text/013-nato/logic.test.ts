import { describe, expect, it } from 'vitest';
import { toNato } from './logic';

describe('nato logic', () => {
  it('converts letters', () => {
    expect(toNato('abc')).toBe('Alpha Bravo Charlie');
    expect(toNato('NATO')).toBe('November Alpha Tango Oscar');
  });

  it('converts digits', () => {
    expect(toNato('911')).toBe('Nine One One');
  });

  it('handles space and punctuation', () => {
    expect(toNato('hi 1.')).toBe('Hotel India (space) One Stop');
  });

  it('passes unknown chars through', () => {
    expect(toNato('héllo')).toBe('Hotel é Lima Lima Oscar');
  });

  it('empty input → empty output', () => {
    expect(toNato('')).toBe('');
  });
});
