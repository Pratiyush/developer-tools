import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';
describe('text-unicode url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('round-trips', () => {
    const { hash } = serializeParams({ input: 'A' });
    expect(parseParams(new URLSearchParams(), hash).input).toBe('A');
  });
});
