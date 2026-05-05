import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('parseParams', () => {
  it('returns default state for empty params', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads mode=decode from search', () => {
    expect(
      parseParams(new URLSearchParams('mode=decode'), new URLSearchParams()).mode,
    ).toBe('decode');
  });

  it('treats unrecognized mode values as encode', () => {
    expect(
      parseParams(new URLSearchParams('mode=garbage'), new URLSearchParams()).mode,
    ).toBe('encode');
  });

  it('reads variant=extended from search', () => {
    expect(
      parseParams(new URLSearchParams('variant=extended'), new URLSearchParams()).variant,
    ).toBe('extended');
  });

  it('treats unrecognized variant values as minimal', () => {
    expect(
      parseParams(new URLSearchParams('variant=ultra'), new URLSearchParams()).variant,
    ).toBe('minimal');
  });

  it('reads input from hash params (privacy: keeps it out of search)', () => {
    const state = parseParams(
      new URLSearchParams(),
      new URLSearchParams('in=hello+%26+world'),
    );
    expect(state.input).toBe('hello & world');
  });
});

describe('serializeParams', () => {
  it('emits empty search/hash for default state', () => {
    const { search, hash } = serializeParams(DEFAULT_STATE);
    expect(search.toString()).toBe('');
    expect(hash.toString()).toBe('');
  });

  it('omits mode when it is encode (the default)', () => {
    const { search } = serializeParams({ ...DEFAULT_STATE, mode: 'encode' });
    expect(search.has('mode')).toBe(false);
  });

  it('emits mode=decode', () => {
    const { search } = serializeParams({ ...DEFAULT_STATE, mode: 'decode' });
    expect(search.get('mode')).toBe('decode');
  });

  it('emits variant=extended', () => {
    const { search } = serializeParams({ ...DEFAULT_STATE, variant: 'extended' });
    expect(search.get('variant')).toBe('extended');
  });

  it('puts input in hash, never in search', () => {
    const { search, hash } = serializeParams({ ...DEFAULT_STATE, input: 'hello & world' });
    expect(search.has('in')).toBe(false);
    expect(hash.get('in')).toBe('hello & world');
  });

  it('round-trips through parse', () => {
    const original = {
      mode: 'decode' as const,
      variant: 'extended' as const,
      input: '<a href="x">© 2026</a>',
    };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
