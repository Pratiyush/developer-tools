import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('roman url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });

  it('reads mode + input', () => {
    expect(parseParams(new URLSearchParams('mode=fromRoman'), new URLSearchParams('in=XLII'))).toEqual({
      mode: 'fromRoman',
      input: 'XLII',
    });
  });

  it('round-trips', () => {
    const original = { mode: 'fromRoman' as const, input: 'IX' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
