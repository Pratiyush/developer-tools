import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('base-converter url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads from + input', () => {
    const s = parseParams(new URLSearchParams('from=16'), new URLSearchParams('in=ff'));
    expect(s).toEqual({ from: 16, input: 'ff' });
  });

  it('falls back on bad base', () => {
    expect(parseParams(new URLSearchParams('from=7'), new URLSearchParams()).from).toBe(10);
  });

  it('round-trips', () => {
    const original = { from: 2 as const, input: '101010' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
