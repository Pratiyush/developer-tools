import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('token-generator url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads preset + length', () => {
    expect(parseParams(new URLSearchParams('p=hex&len=64'), new URLSearchParams())).toEqual({
      preset: 'hex',
      length: 64,
    });
  });
  it('falls back on bad preset', () => {
    expect(parseParams(new URLSearchParams('p=junk'), new URLSearchParams()).preset).toBe(
      'base64url',
    );
  });
  it('clamps out-of-range length', () => {
    expect(parseParams(new URLSearchParams('len=4'), new URLSearchParams()).length).toBe(32);
    expect(parseParams(new URLSearchParams('len=999'), new URLSearchParams()).length).toBe(32);
  });
  it('round-trips', () => {
    const original = { preset: 'base58' as const, length: 48 };
    const { search } = serializeParams(original);
    expect(parseParams(search, new URLSearchParams())).toEqual(original);
  });
});
