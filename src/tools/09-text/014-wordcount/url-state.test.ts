import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('wordcount url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('round-trips', () => {
    const { search, hash } = serializeParams({ input: 'hi' });
    expect(parseParams(search, hash)).toEqual({ input: 'hi' });
  });
});
