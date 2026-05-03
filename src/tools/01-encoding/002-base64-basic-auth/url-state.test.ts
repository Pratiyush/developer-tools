import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('parseParams', () => {
  it('returns the default state when both maps are empty', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads mode=decode from search', () => {
    const state = parseParams(new URLSearchParams('mode=decode'), new URLSearchParams());
    expect(state.mode).toBe('decode');
  });

  it('treats unrecognized mode values as encode', () => {
    const state = parseParams(new URLSearchParams('mode=garbage'), new URLSearchParams());
    expect(state.mode).toBe('encode');
  });

  it('reads u/p/h from hash params', () => {
    const hash = new URLSearchParams('u=alice&p=secret&h=Basic+xyz');
    const state = parseParams(new URLSearchParams(), hash);
    expect(state.username).toBe('alice');
    expect(state.password).toBe('secret');
    expect(state.header).toBe('Basic xyz');
  });
});

describe('serializeParams', () => {
  it('writes nothing for the default state', () => {
    const { search, hash } = serializeParams(DEFAULT_STATE);
    expect(search.toString()).toBe('');
    expect(hash.toString()).toBe('');
  });

  it('omits mode=encode (it is the default)', () => {
    const { search } = serializeParams({ ...DEFAULT_STATE, mode: 'encode' });
    expect(search.toString()).toBe('');
  });

  it('writes mode=decode to search', () => {
    const { search } = serializeParams({ ...DEFAULT_STATE, mode: 'decode' });
    expect(search.get('mode')).toBe('decode');
  });

  it('writes credentials to hash, never to search (privacy)', () => {
    const { search, hash } = serializeParams({
      mode: 'encode',
      username: 'alice',
      password: 'secret',
      header: '',
    });
    expect(search.has('u')).toBe(false);
    expect(search.has('p')).toBe(false);
    expect(hash.get('u')).toBe('alice');
    expect(hash.get('p')).toBe('secret');
  });

  it('round-trips through parse', () => {
    const original = {
      mode: 'decode' as const,
      username: 'bob',
      password: 'p@ss w/ space:and:colons',
      header: 'Basic Ym9iOnA=',
    };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
