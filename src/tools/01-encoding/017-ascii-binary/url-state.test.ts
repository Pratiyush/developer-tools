import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('ascii-binary url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('round-trips', () => {
    const original = { mode: 'decode' as const, input: '01000001' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
