/**
 * URL (percent-)encoder / decoder.
 *
 * Two encode modes:
 *   - **component** — `encodeURIComponent` semantics. Escapes everything
 *     that isn't an unreserved character per RFC 3986 (`A-Z a-z 0-9 - _ . ~`)
 *     plus the JS additions. Right call for query-string values, path
 *     segments, fragment text, anything you'll concatenate into a URL.
 *   - **uri** — `encodeURI` semantics. Leaves reserved characters (`: / ? #
 *     [ ] @ ! $ & ' ( ) * + , ; =`) alone so a *whole* URL stays parseable.
 *
 * Decode is one mode: it's `decodeURIComponent` with a graceful fallback
 * for malformed inputs — instead of throwing the whole-string `URIError`
 * we leave the offending `%XX` literal in place and decode everything else.
 *
 * `+ → space` toggle: classic `application/x-www-form-urlencoded` form
 * encoding. Off by default (matches `encodeURIComponent`); flip on when
 * round-tripping HTML form payloads.
 */

export type EncodeVariant = 'component' | 'uri';

/** Percent-encode per the chosen variant. */
export function encode(
  input: string,
  variant: EncodeVariant = 'component',
  spaceAsPlus = false,
): string {
  const out = variant === 'uri' ? encodeURI(input) : encodeURIComponent(input);
  return spaceAsPlus ? out.replace(/%20/g, '+') : out;
}

/**
 * Percent-decode. Tolerates malformed `%XX` triplets — anything that would
 * otherwise throw is left as the original text so the rest of the string
 * can still be decoded. Also handles `+ → space` for form-encoded inputs.
 */
export function decode(input: string, spaceAsPlus = false): string {
  const prepared = spaceAsPlus ? input.replace(/\+/g, ' ') : input;
  // decodeURIComponent throws on a single malformed triplet (e.g. `%E0`
  // alone). Walk the string in chunks split by valid escape runs and
  // decode each chunk independently so one bad triplet doesn't poison
  // the whole input.
  return prepared.replace(/(%[0-9a-fA-F]{2})+|[^%]+|%/g, (segment) => {
    if (!segment.startsWith('%')) return segment;
    if (segment === '%') return '%';
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
}

/**
 * Split a `key=value&key=value` query string into typed pairs, each
 * already percent-decoded. Empty keys are skipped (matches URLSearchParams)
 * and a missing `=` becomes `value: ''`. Order is preserved.
 */
export interface QueryPair {
  readonly key: string;
  readonly value: string;
}

export function parseQuery(input: string, spaceAsPlus = true): readonly QueryPair[] {
  const trimmed = input.replace(/^\?/, '');
  if (!trimmed) return [];
  const pairs: QueryPair[] = [];
  for (const pair of trimmed.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawVal = eq === -1 ? '' : pair.slice(eq + 1);
    const key = decode(rawKey, spaceAsPlus);
    if (!key) continue;
    pairs.push({ key, value: decode(rawVal, spaceAsPlus) });
  }
  return pairs;
}

/**
 * Inverse of {@link parseQuery}. Encodes each key + value with
 * `component` semantics and joins them with `&`. Order is preserved.
 */
export function buildQuery(pairs: readonly QueryPair[], spaceAsPlus = true): string {
  return pairs
    .map(({ key, value }) => `${encode(key, 'component', spaceAsPlus)}=${encode(value, 'component', spaceAsPlus)}`)
    .join('&');
}

/** Round-trip check used in tests + surfaced as a property. */
export function roundTripsCleanly(
  input: string,
  variant: EncodeVariant,
  spaceAsPlus = false,
): boolean {
  return decode(encode(input, variant, spaceAsPlus), spaceAsPlus) === input;
}

/**
 * Count the percent-escape sequences in a string. Useful as a "decoded N
 * sequences" hint in decode mode.
 */
export function countEscapes(input: string): number {
  const matches = input.match(/%[0-9a-fA-F]{2}/g);
  return matches ? matches.length : 0;
}
