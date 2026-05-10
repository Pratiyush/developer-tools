import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('jwt-decoder url-state', () => {
  describe('parseParams', () => {
    it('returns DEFAULT_STATE for empty params', () => {
      expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
    });

    it('reads jwt from hash', () => {
      const s = parseParams(new URLSearchParams(), new URLSearchParams('jwt=abc.def.ghi'));
      expect(s.input).toBe('abc.def.ghi');
    });

    it('ignores search params (token only ever lives in hash)', () => {
      const s = parseParams(new URLSearchParams('jwt=should-be-ignored'), new URLSearchParams());
      expect(s.input).toBe('');
    });
  });

  describe('serializeParams', () => {
    it('emits empty for DEFAULT_STATE', () => {
      const { search, hash } = serializeParams(DEFAULT_STATE);
      expect(search.toString()).toBe('');
      expect(hash.toString()).toBe('');
    });

    it('emits jwt to hash, never to search', () => {
      const { search, hash } = serializeParams({ input: 'abc.def.ghi' });
      expect(search.toString()).toBe('');
      expect(hash.get('jwt')).toBe('abc.def.ghi');
    });

    it('round-trips with parseParams', () => {
      const original = { input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9.sig' };
      const { search, hash } = serializeParams(original);
      const back = parseParams(search, hash);
      expect(back).toEqual(original);
    });
  });
});
