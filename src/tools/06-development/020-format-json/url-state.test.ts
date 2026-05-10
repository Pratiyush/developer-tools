import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('format-json url-state', () => {
  it('defaults', () => {
    expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
  });
  it('reads mode + indent', () => {
    expect(parseParams(new URLSearchParams('mode=minify&indent=4'), new URLSearchParams())).toEqual({
      mode: 'minify',
      indent: 4,
      input: '',
    });
  });
  it('round-trips', () => {
    const original = { mode: 'minify' as const, indent: 4, input: '{"a":1}' };
    const { search, hash } = serializeParams(original);
    expect(parseParams(search, hash)).toEqual(original);
  });
});
