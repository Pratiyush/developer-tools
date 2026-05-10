import { describe, expect, it } from 'vitest';
import { generateLorem } from './logic';

describe('lorem logic', () => {
  it('opens with the classic phrase by default', () => {
    expect(generateLorem(1)).toMatch(/^Lorem ipsum dolor sit amet/);
  });

  it('emits N paragraphs separated by blank lines', () => {
    const out = generateLorem(3);
    expect(out.split(/\n\s*\n/).length).toBe(3);
  });

  it('returns empty for invalid count', () => {
    expect(generateLorem(0)).toBe('');
    expect(generateLorem(-1)).toBe('');
  });

  it('startWithClassic=false skips the classic opener', () => {
    const out = generateLorem(1, false);
    expect(out).not.toMatch(/^Lorem ipsum dolor sit amet/);
  });
});
