import { describe, expect, it } from 'vitest';
import { countEntities, decode, encode, roundTripsCleanly } from './logic';

const NBSP = ' ';

describe('encode (minimal variant)', () => {
  it('escapes the SGML-five', () => {
    expect(encode('a & b < c > d " e \' f', 'minimal')).toBe(
      'a &amp; b &lt; c &gt; d &quot; e &#39; f',
    );
  });

  it('leaves Latin-1 supplement chars untouched (minimal mode)', () => {
    expect(encode('café — €5', 'minimal')).toBe('café — €5');
  });

  it('encoded `&amp;` is NOT idempotent on the literal level', () => {
    // Note: re-encoding `&amp;` in minimal mode produces `&amp;amp;` because
    // the literal `&` is escaped again. The round-trip via decode IS clean,
    // covered by the round-trip test below.
    expect(encode('&', 'minimal')).toBe('&amp;');
    expect(encode(encode('&', 'minimal'), 'minimal')).toBe('&amp;amp;');
  });
});

describe('encode (extended variant)', () => {
  it('escapes Latin-1 supplement + currency + dashes (regular spaces stay)', () => {
    expect(encode('café — €5', 'extended')).toBe('caf&eacute; &mdash; &euro;5');
  });

  it('escapes copyright and trademark', () => {
    expect(encode('© 2026 — ™ Pratiyush', 'extended')).toBe(
      '&copy; 2026 &mdash; &trade; Pratiyush',
    );
  });

  it('escapes curly quotes', () => {
    expect(encode('“hello” ‘world’', 'extended')).toBe('&ldquo;hello&rdquo; &lsquo;world&rsquo;');
  });

  it('still escapes the SGML-five even in extended mode', () => {
    expect(encode('<a href="x">', 'extended')).toBe('&lt;a href=&quot;x&quot;&gt;');
  });

  it('escapes the actual NBSP (U+00A0) — only that one, not regular spaces', () => {
    expect(encode(`a b${NBSP}c d`, 'extended')).toBe('a b&nbsp;c d');
  });
});

describe('decode', () => {
  it('decodes the SGML-five', () => {
    expect(decode('a &amp; b &lt; c &gt; d &quot; e &#39; f')).toBe(
      'a & b < c > d " e \' f',
    );
  });

  it('decodes &apos; (XML alias)', () => {
    expect(decode('hello &apos;world&apos;')).toBe("hello 'world'");
  });

  it('decodes the all-caps DOM aliases', () => {
    expect(decode('&AMP;&LT;&GT;&QUOT;')).toBe('&<>"');
  });

  it('decodes named entities outside the SGML-five', () => {
    expect(decode('&copy; 2026 &mdash; &trade;')).toBe('© 2026 — ™');
  });

  it('decodes decimal numeric entities', () => {
    expect(decode('&#65;&#66;&#67;')).toBe('ABC');
  });

  it('decodes hex numeric entities (lowercase x)', () => {
    expect(decode('&#x48;&#x69;')).toBe('Hi');
  });

  it('decodes hex numeric entities (uppercase X)', () => {
    expect(decode('&#X48;&#X69;')).toBe('Hi');
  });

  it('decodes astral codepoints (emoji)', () => {
    expect(decode('&#128512;')).toBe('😀');
    expect(decode('&#x1F600;')).toBe('😀');
  });

  it('leaves unknown entities intact', () => {
    expect(decode('hello &madeup; world')).toBe('hello &madeup; world');
  });

  it('leaves out-of-range numeric entities intact', () => {
    expect(decode('&#9999999999;')).toBe('&#9999999999;');
    expect(decode('&#x110000;')).toBe('&#x110000;');
  });

  it('decodes a mix of named, decimal, and hex in one pass', () => {
    expect(decode('&copy; A&#66;&#x43; — &eacute;')).toBe('© ABC — é');
  });
});

describe('roundTripsCleanly', () => {
  it('round-trips ASCII via minimal', () => {
    const input = '<script>alert("x" & y)</script>';
    expect(roundTripsCleanly(input, 'minimal')).toBe(true);
  });

  it('round-trips Latin-1 via extended', () => {
    expect(roundTripsCleanly('café résumé', 'extended')).toBe(true);
  });

  it('round-trips currency + math via extended', () => {
    expect(roundTripsCleanly('€5 ≤ £6 → ¥7', 'extended')).toBe(true);
  });

  it('round-trips copyright/trademark via extended', () => {
    expect(roundTripsCleanly('© 2026 ™ Pratiyush', 'extended')).toBe(true);
  });
});

describe('countEntities', () => {
  it('returns 0 for entity-free input', () => {
    expect(countEntities('hello world')).toBe(0);
  });

  it('counts named entities', () => {
    expect(countEntities('&amp; and &lt; and &gt;')).toBe(3);
  });

  it('counts numeric entities (decimal + hex)', () => {
    expect(countEntities('&#65;&#x42;&#67;')).toBe(3);
  });

  it('counts mixed entity kinds', () => {
    expect(countEntities('&copy; &#169; &#xa9;')).toBe(3);
  });
});
