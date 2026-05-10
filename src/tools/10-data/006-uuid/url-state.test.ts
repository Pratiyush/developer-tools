import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('uuid url-state', () => {
  it('returns DEFAULT for empty params', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads n + case + format', () => {
    const s = parseParams(
      new URLSearchParams('n=10&case=upper&format=plain'),
      new URLSearchParams(),
    );
    expect(s).toEqual({ count: 10, case: 'upper', format: 'plain' });
  });

  it('clamps n out of range to DEFAULT', () => {
    expect(parseParams(new URLSearchParams('n=0'), new URLSearchParams()).count).toBe(1);
    expect(parseParams(new URLSearchParams('n=10000'), new URLSearchParams()).count).toBe(1);
    expect(parseParams(new URLSearchParams('n=abc'), new URLSearchParams()).count).toBe(1);
  });

  it('falls back on garbage format', () => {
    expect(parseParams(new URLSearchParams('format=mystery'), new URLSearchParams()).format).toBe(
      'hyphen',
    );
  });

  it('round-trips with serializeParams', () => {
    const original = { count: 5, case: 'upper' as const, format: 'urn' as const };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });

  it('omits defaults on serialize', () => {
    const { search } = serializeParams(DEFAULT_STATE);
    expect(search.toString()).toBe('');
  });
});
