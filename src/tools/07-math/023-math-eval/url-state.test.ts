import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';
describe('math-eval url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('round-trips', () => {
    const { hash } = serializeParams({ input: '1+2' });
    expect(parseParams(new URLSearchParams(), hash)).toEqual({ input: '1+2' });
  });
});
