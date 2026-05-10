import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('encrypt url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads decrypt mode', () => {
    expect(parseParams(new URLSearchParams('mode=decrypt'), new URLSearchParams()).mode).toBe(
      'decrypt',
    );
  });
  it('round-trips', () => {
    const { search } = serializeParams({ mode: 'decrypt' });
    expect(parseParams(search, new URLSearchParams())).toEqual({ mode: 'decrypt' });
  });
});
