import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

describe('parseParams', () => {
  it('returns DEFAULT_STATE when nothing is set', () => {
    const state = parseParams(new URLSearchParams(), new URLSearchParams());
    expect(state).toEqual(DEFAULT_STATE);
  });

  it('reads mode from search', () => {
    const state = parseParams(
      new URLSearchParams('mode=decode'),
      new URLSearchParams(),
    );
    expect(state.mode).toBe('decode');
  });

  it('falls back to encode for unknown mode values', () => {
    const state = parseParams(
      new URLSearchParams('mode=garbage'),
      new URLSearchParams(),
    );
    expect(state.mode).toBe('encode');
  });

  it('reads urlsafe=1 as true', () => {
    const state = parseParams(
      new URLSearchParams('urlsafe=1'),
      new URLSearchParams(),
    );
    expect(state.urlsafe).toBe(true);
  });

  it('treats any non-1 urlsafe value as false', () => {
    expect(parseParams(new URLSearchParams('urlsafe=0'), new URLSearchParams()).urlsafe).toBe(
      false,
    );
    expect(parseParams(new URLSearchParams('urlsafe=true'), new URLSearchParams()).urlsafe).toBe(
      false,
    );
  });

  it('reads input from hash', () => {
    const state = parseParams(
      new URLSearchParams(),
      new URLSearchParams('in=SGVsbG8%3D'),
    );
    expect(state.input).toBe('SGVsbG8=');
  });
});

describe('serializeParams', () => {
  it('returns empty params for the default state', () => {
    const { search, hash } = serializeParams(DEFAULT_STATE);
    expect(search.toString()).toBe('');
    expect(hash.toString()).toBe('');
  });

  it('omits mode=encode (default)', () => {
    const state: State = { mode: 'encode', urlsafe: false, input: '' };
    expect(serializeParams(state).search.has('mode')).toBe(false);
  });

  it('emits mode=decode when set', () => {
    const state: State = { mode: 'decode', urlsafe: false, input: '' };
    expect(serializeParams(state).search.get('mode')).toBe('decode');
  });

  it('emits urlsafe=1 when true', () => {
    const state: State = { mode: 'encode', urlsafe: true, input: '' };
    expect(serializeParams(state).search.get('urlsafe')).toBe('1');
  });

  it('puts non-empty input in hash', () => {
    const state: State = { mode: 'encode', urlsafe: false, input: 'SGVsbG8=' };
    const { search, hash } = serializeParams(state);
    expect(search.has('in')).toBe(false);
    expect(hash.get('in')).toBe('SGVsbG8=');
  });
});

describe('round-trip', () => {
  it.each<State>([
    { mode: 'encode', urlsafe: false, input: '' },
    { mode: 'decode', urlsafe: false, input: 'SGVsbG8=' },
    { mode: 'encode', urlsafe: true, input: 'Hello' },
    { mode: 'decode', urlsafe: true, input: 'c3ViamVjdHM_aWRzW109MQ' },
  ])('preserves %j through serialize → parse', (state) => {
    const { search, hash } = serializeParams(state);
    expect(parseParams(search, hash)).toEqual(state);
  });
});
