import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('chmod url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads o', () => {
    expect(parseParams(new URLSearchParams('o=755'), new URLSearchParams()).octal).toBe('755');
  });
  it('falls back on bad', () => {
    expect(parseParams(new URLSearchParams('o=999'), new URLSearchParams()).octal).toBe('644');
  });
  it('round-trips', () => {
    const { search } = serializeParams({ octal: '777' });
    expect(parseParams(search, new URLSearchParams())).toEqual({ octal: '777' });
  });
});
