import { describe, expect, it } from 'vitest';
import {
  buildQuery,
  countEscapes,
  decode,
  encode,
  parseQuery,
  roundTripsCleanly,
  type QueryPair,
} from './logic';

describe('url-encode-decode logic', () => {
  describe('encode (component)', () => {
    it('escapes spaces, slashes, and reserved characters', () => {
      expect(encode('hello world', 'component')).toBe('hello%20world');
      expect(encode('a/b?c=1', 'component')).toBe('a%2Fb%3Fc%3D1');
      expect(encode('a&b', 'component')).toBe('a%26b');
    });

    it('preserves unreserved characters per RFC 3986', () => {
      expect(encode("ABCabc012-_.~", 'component')).toBe("ABCabc012-_.~");
    });

    it('round-trips UTF-8 (Japanese + emoji)', () => {
      const input = '日本語🍣';
      expect(decode(encode(input, 'component'))).toBe(input);
    });

    it('emits %20 for space by default', () => {
      expect(encode('a b', 'component')).toBe('a%20b');
    });

    it('emits + for space when spaceAsPlus is true', () => {
      expect(encode('a b', 'component', true)).toBe('a+b');
    });
  });

  describe('encode (uri)', () => {
    it('leaves reserved characters intact', () => {
      expect(encode('https://example.com/path?q=1#x', 'uri')).toBe(
        'https://example.com/path?q=1#x',
      );
    });

    it('still escapes spaces and high-byte characters', () => {
      expect(encode('https://example.com/a b', 'uri')).toBe('https://example.com/a%20b');
      expect(encode('https://example.com/日本', 'uri')).toBe(
        'https://example.com/%E6%97%A5%E6%9C%AC',
      );
    });
  });

  describe('decode', () => {
    it('decodes simple percent-escapes', () => {
      expect(decode('hello%20world')).toBe('hello world');
      expect(decode('a%2Fb')).toBe('a/b');
    });

    it('decodes UTF-8 sequences', () => {
      expect(decode('%E6%97%A5%E6%9C%AC%E8%AA%9E')).toBe('日本語');
    });

    it('treats + as literal by default', () => {
      expect(decode('a+b')).toBe('a+b');
    });

    it('decodes + as space when spaceAsPlus is true', () => {
      expect(decode('a+b', true)).toBe('a b');
    });

    it('survives malformed percent-escapes (leaves them in place)', () => {
      // `%E0` alone is the start of a 3-byte UTF-8 sequence — incomplete.
      // We still want the surrounding text decoded.
      expect(decode('hello%20world%E0bad')).toBe('hello world%E0bad');
    });

    it('survives a stray %', () => {
      expect(decode('100% pure')).toBe('100% pure');
    });
  });

  describe('parseQuery', () => {
    it('returns [] for empty input', () => {
      expect(parseQuery('')).toEqual([]);
      expect(parseQuery('?')).toEqual([]);
    });

    it('strips a leading ? if present', () => {
      expect(parseQuery('?a=1&b=2')).toEqual([
        { key: 'a', value: '1' },
        { key: 'b', value: '2' },
      ]);
    });

    it('decodes keys and values', () => {
      expect(parseQuery('q=hello+world&lang=ja')).toEqual([
        { key: 'q', value: 'hello world' },
        { key: 'lang', value: 'ja' },
      ]);
    });

    it('handles missing = (empty value)', () => {
      expect(parseQuery('flag&q=1')).toEqual([
        { key: 'flag', value: '' },
        { key: 'q', value: '1' },
      ]);
    });

    it('skips empty keys', () => {
      expect(parseQuery('=novalue&a=1')).toEqual([{ key: 'a', value: '1' }]);
    });

    it('preserves order and duplicate keys', () => {
      expect(parseQuery('a=1&a=2&b=3')).toEqual([
        { key: 'a', value: '1' },
        { key: 'a', value: '2' },
        { key: 'b', value: '3' },
      ]);
    });
  });

  describe('buildQuery', () => {
    it('joins pairs with &', () => {
      const pairs: QueryPair[] = [
        { key: 'q', value: 'hello world' },
        { key: 'lang', value: 'ja' },
      ];
      expect(buildQuery(pairs)).toBe('q=hello+world&lang=ja');
    });

    it('escapes special characters in keys and values', () => {
      const pairs: QueryPair[] = [{ key: 'a&b', value: 'c=d' }];
      expect(buildQuery(pairs)).toBe('a%26b=c%3Dd');
    });

    it('uses %20 when spaceAsPlus is false', () => {
      const pairs: QueryPair[] = [{ key: 'q', value: 'a b' }];
      expect(buildQuery(pairs, false)).toBe('q=a%20b');
    });

    it('round-trips with parseQuery', () => {
      const pairs: QueryPair[] = [
        { key: 'q', value: 'hello world' },
        { key: 'tag', value: '日本' },
        { key: 'flag', value: '' },
      ];
      expect(parseQuery(buildQuery(pairs))).toEqual(pairs);
    });
  });

  describe('roundTripsCleanly', () => {
    it('passes for plain ASCII', () => {
      expect(roundTripsCleanly('hello world', 'component')).toBe(true);
      expect(roundTripsCleanly('hello world', 'uri')).toBe(true);
    });

    it('passes for UTF-8', () => {
      expect(roundTripsCleanly('日本語🍣', 'component')).toBe(true);
    });

    it('passes for full URLs in uri mode', () => {
      expect(roundTripsCleanly('https://x.com/a?b=1#c', 'uri')).toBe(true);
    });

    it('passes for spaceAsPlus mode', () => {
      expect(roundTripsCleanly('a b c', 'component', true)).toBe(true);
    });
  });

  describe('countEscapes', () => {
    it('returns 0 for plain text', () => {
      expect(countEscapes('hello world')).toBe(0);
    });

    it('counts %XX sequences', () => {
      expect(countEscapes('hello%20world%21')).toBe(2);
    });

    it('counts UTF-8 multi-byte sequences as separate escapes', () => {
      expect(countEscapes('%E6%97%A5%E6%9C%AC')).toBe(6);
    });
  });
});
