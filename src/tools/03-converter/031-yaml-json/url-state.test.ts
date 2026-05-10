import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('yaml-json url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('round-trips input via hash', () => {
    const { hash } = serializeParams({ input: 'a: 1' });
    expect(parseParams(new URLSearchParams(), hash).input).toBe('a: 1');
  });
});
