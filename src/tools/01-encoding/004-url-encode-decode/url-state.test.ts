import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseParams, serializeParams } from './url-state';

describe('url-encode-decode url-state', () => {
  describe('parseParams', () => {
    it('returns DEFAULT_STATE for empty params', () => {
      expect(parseParams(new URLSearchParams(), new URLSearchParams())).toEqual(DEFAULT_STATE);
    });

    it('reads mode=decode', () => {
      const s = parseParams(new URLSearchParams('mode=decode'), new URLSearchParams());
      expect(s.mode).toBe('decode');
    });

    it('reads variant=uri', () => {
      const s = parseParams(new URLSearchParams('variant=uri'), new URLSearchParams());
      expect(s.variant).toBe('uri');
    });

    it('reads plus=1', () => {
      const s = parseParams(new URLSearchParams('plus=1'), new URLSearchParams());
      expect(s.plus).toBe(true);
    });

    it('reads input from hash', () => {
      const s = parseParams(new URLSearchParams(), new URLSearchParams('in=hello%20world'));
      expect(s.input).toBe('hello world');
    });

    it('falls back to defaults on garbage values', () => {
      const s = parseParams(
        new URLSearchParams('mode=mystery&variant=banana&plus=maybe'),
        new URLSearchParams(),
      );
      expect(s).toEqual(DEFAULT_STATE);
    });
  });

  describe('serializeParams', () => {
    it('returns empty params for DEFAULT_STATE', () => {
      const { search, hash } = serializeParams(DEFAULT_STATE);
      expect(search.toString()).toBe('');
      expect(hash.toString()).toBe('');
    });

    it('emits non-default values', () => {
      const { search, hash } = serializeParams({
        mode: 'decode',
        variant: 'uri',
        plus: true,
        input: 'hello world',
      });
      expect(search.get('mode')).toBe('decode');
      expect(search.get('variant')).toBe('uri');
      expect(search.get('plus')).toBe('1');
      expect(hash.get('in')).toBe('hello world');
    });

    it('round-trips with parseParams', () => {
      const original = {
        mode: 'decode' as const,
        variant: 'uri' as const,
        plus: true,
        input: 'café',
      };
      const { search, hash } = serializeParams(original);
      const back = parseParams(search, hash);
      expect(back).toEqual(original);
    });

    it('omits input from hash when empty', () => {
      const { hash } = serializeParams({ ...DEFAULT_STATE, mode: 'decode' });
      expect(hash.toString()).toBe('');
    });
  });
});
