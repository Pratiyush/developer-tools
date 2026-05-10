import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('rsa-keypair url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads size + hash', () => {
    expect(parseParams(new URLSearchParams('size=4096&hash=SHA-512'), new URLSearchParams())).toEqual({
      size: 4096,
      hash: 'SHA-512',
    });
  });
  it('falls back on bad inputs', () => {
    expect(parseParams(new URLSearchParams('size=512&hash=MD5'), new URLSearchParams())).toEqual(
      DEFAULT_STATE,
    );
  });
  it('round-trips', () => {
    const original = { size: 3072 as const, hash: 'SHA-384' as const };
    const { search } = serializeParams(original);
    expect(parseParams(search, new URLSearchParams())).toEqual(original);
  });
});
