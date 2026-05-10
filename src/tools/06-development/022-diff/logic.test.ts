import { describe, expect, it } from 'vitest';
import { diffLines, diffWords, statsFor } from './logic';

describe('diff logic', () => {
  it('two identical inputs are all eq', () => {
    const r = diffLines('a\nb\nc', 'a\nb\nc');
    expect(r.every((row) => row.op === 'eq')).toBe(true);
  });

  it('insertions show as add', () => {
    const r = diffLines('a\nc', 'a\nb\nc');
    const adds = r.filter((row) => row.op === 'add');
    expect(adds).toHaveLength(1);
    expect(adds[0]?.text).toBe('b');
  });

  it('deletions show as del', () => {
    const r = diffLines('a\nb\nc', 'a\nc');
    const dels = r.filter((row) => row.op === 'del');
    expect(dels).toHaveLength(1);
    expect(dels[0]?.text).toBe('b');
  });

  it('completely different = all add+del', () => {
    const r = diffLines('a\nb', 'x\ny');
    expect(r.filter((row) => row.op === 'eq')).toHaveLength(0);
  });

  it('statsFor counts ops', () => {
    const r = diffLines('a\nb', 'a\nc');
    const s = statsFor(r);
    expect(s.added).toBe(1);
    expect(s.removed).toBe(1);
    expect(s.unchanged).toBe(1);
  });

  it('handles empty inputs', () => {
    expect(diffLines('', '')).toEqual([]);
  });

  it('diffWords surfaces token-level adds/dels', () => {
    const r = diffWords('the quick brown fox', 'the slow brown fox');
    const adds = r.filter((row) => row.op === 'add').map((row) => row.text);
    const dels = r.filter((row) => row.op === 'del').map((row) => row.text);
    expect(adds).toContain('slow');
    expect(dels).toContain('quick');
  });

  it('diffWords leaves identical text fully eq', () => {
    const r = diffWords('hello world', 'hello world');
    expect(r.every((row) => row.op === 'eq')).toBe(true);
  });
});
