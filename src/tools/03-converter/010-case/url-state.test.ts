import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('case url-state', () => {
  it('returns DEFAULT', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads target + input', () => {
    const s = parseParams(new URLSearchParams('t=snake'), new URLSearchParams('in=Hello+World'));
    expect(s).toEqual({ target: 'snake', input: 'Hello World' });
  });

  it('falls back on bad target', () => {
    expect(parseParams(new URLSearchParams('t=alien'), new URLSearchParams()).target).toBe('camel');
  });

  it('round-trips', () => {
    const original = { target: 'kebab' as const, input: 'helloThere' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
