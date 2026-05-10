import { describe, expect, it } from 'vitest';
import { inspect } from './logic';

describe('text-unicode logic', () => {
  it('inspects ASCII letter', () => {
    const r = inspect('A');
    expect(r).toHaveLength(1);
    expect(r[0]?.codepoint).toBe(65);
    expect(r[0]?.hex).toBe('U+0041');
    expect(r[0]?.utf8).toBe('41');
    expect(r[0]?.category).toBe('letter');
  });

  it('inspects emoji as a single codepoint', () => {
    const r = inspect('🍣');
    expect(r).toHaveLength(1);
    expect(r[0]?.codepoint).toBe(0x1f363);
    expect(r[0]?.hex).toBe('U+1F363');
    // 4-byte UTF-8
    expect(r[0]?.utf8.split(' ')).toHaveLength(4);
  });

  it('handles a sequence', () => {
    const r = inspect('A日');
    expect(r).toHaveLength(2);
    expect(r[0]?.category).toBe('letter');
    expect(r[1]?.category).toBe('letter');
  });

  it('empty input → empty output', () => {
    expect(inspect('')).toEqual([]);
  });
});
