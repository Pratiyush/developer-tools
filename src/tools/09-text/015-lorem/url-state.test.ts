import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('lorem url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads p + classic', () => {
    expect(parseParams(new URLSearchParams('p=5&classic=0'), new URLSearchParams())).toEqual({
      paragraphs: 5,
      classic: false,
    });
  });
  it('round-trips', () => {
    const original = { paragraphs: 7, classic: false };
    const { search } = serializeParams(original);
    expect(parseParams(search, new URLSearchParams())).toEqual(original);
  });
});
