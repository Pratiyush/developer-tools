import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('ulid url-state', () => {
  it('returns DEFAULT for empty params', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads n from search', () => {
    expect(parseParams(new URLSearchParams('n=12'), new URLSearchParams()).count).toBe(12);
  });

  it('clamps out-of-range to DEFAULT', () => {
    expect(parseParams(new URLSearchParams('n=0'), new URLSearchParams()).count).toBe(1);
    expect(parseParams(new URLSearchParams('n=junk'), new URLSearchParams()).count).toBe(1);
  });

  it('round-trips with serializeParams', () => {
    const state = { count: 50 };
    const { search } = serializeParams(state);
    expect(parseParams(search, new URLSearchParams())).toEqual(state);
  });
});
