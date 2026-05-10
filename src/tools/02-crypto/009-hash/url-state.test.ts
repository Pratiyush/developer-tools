import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('hash url-state', () => {
  it('returns DEFAULT for empty params', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads algo + input', () => {
    const s = parseParams(new URLSearchParams('algo=SHA-512'), new URLSearchParams('in=hello'));
    expect(s).toEqual({ algo: 'SHA-512', input: 'hello' });
  });

  it('falls back on bad algo', () => {
    expect(parseParams(new URLSearchParams('algo=MD5'), new URLSearchParams()).algo).toBe('SHA-256');
  });

  it('round-trips', () => {
    const original = { algo: 'SHA-1' as const, input: 'café' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
