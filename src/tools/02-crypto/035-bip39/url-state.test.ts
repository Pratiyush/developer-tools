import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('bip39 url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads words=24', () => {
    expect(parseParams(new URLSearchParams('words=24'), new URLSearchParams()).words).toBe(24);
  });
  it('falls back on invalid count', () => {
    expect(parseParams(new URLSearchParams('words=99'), new URLSearchParams()).words).toBe(12);
  });
  it('round-trips', () => {
    const { search } = serializeParams({ words: 24 });
    expect(parseParams(search, new URLSearchParams())).toEqual({ words: 24 });
  });
});
