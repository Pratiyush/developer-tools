import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('hmac url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads algo from search and message/secret from hash', () => {
    expect(
      parseParams(
        new URLSearchParams('algo=SHA-512'),
        new URLSearchParams('m=hello&s=mykey'),
      ),
    ).toEqual({ algo: 'SHA-512', message: 'hello', secret: 'mykey' });
  });
  it('round-trips', () => {
    const original = { algo: 'SHA-1' as const, message: 'data', secret: 'k' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
