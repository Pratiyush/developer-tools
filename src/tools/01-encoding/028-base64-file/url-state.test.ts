import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('base64-file url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads mode=decode', () => {
    expect(parseParams(new URLSearchParams('mode=decode'), new URLSearchParams())).toEqual({
      mode: 'decode',
    });
  });
  it('round-trips', () => {
    const { search } = serializeParams({ mode: 'decode' });
    expect(parseParams(search, new URLSearchParams())).toEqual({ mode: 'decode' });
  });
});
