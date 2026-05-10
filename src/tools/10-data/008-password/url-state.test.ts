import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('password url-state', () => {
  it('returns DEFAULT for empty params', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('respects len + flag overrides', () => {
    const s = parseParams(
      new URLSearchParams('len=64&U=0&S=1&A=1'),
      new URLSearchParams(),
    );
    expect(s.length).toBe(64);
    expect(s.upper).toBe(false);
    expect(s.symbols).toBe(true);
    expect(s.excludeAmbiguous).toBe(true);
  });

  it('clamps invalid length', () => {
    expect(parseParams(new URLSearchParams('len=2'), new URLSearchParams()).length).toBe(24);
    expect(parseParams(new URLSearchParams('len=10000'), new URLSearchParams()).length).toBe(24);
  });

  it('round-trips with serializeParams', () => {
    const original = {
      length: 32,
      upper: false,
      lower: true,
      digits: true,
      symbols: true,
      excludeAmbiguous: true,
    };
    const { search } = serializeParams(original);
    expect(parseParams(search, new URLSearchParams())).toEqual(original);
  });

  it('omits defaults', () => {
    const { search } = serializeParams(DEFAULT_STATE);
    expect(search.toString()).toBe('');
  });
});
