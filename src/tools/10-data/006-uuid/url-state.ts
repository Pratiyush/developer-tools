/**
 * URL-state for the UUID generator.
 *
 * Generated values are ephemeral — we don't persist them. The only state
 * is the user's `count` + format prefs. Privacy: no UUIDs (which can be
 * identifying) are placed in the URL.
 */

import type { UuidCase, UuidFormat } from './logic';

export interface State {
  readonly count: number;
  readonly case: UuidCase;
  readonly format: UuidFormat;
}

export const DEFAULT_STATE: State = {
  count: 1,
  case: 'lower',
  format: 'hyphen',
};

const FORMATS: ReadonlySet<UuidFormat> = new Set(['hyphen', 'plain', 'braces', 'urn']);

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const count = Number(search.get('n'));
  const fmt = search.get('format');
  return {
    count: Number.isInteger(count) && count >= 1 && count <= 1000 ? count : DEFAULT_STATE.count,
    case: search.get('case') === 'upper' ? 'upper' : 'lower',
    format: fmt && FORMATS.has(fmt as UuidFormat) ? (fmt as UuidFormat) : DEFAULT_STATE.format,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.count !== DEFAULT_STATE.count) search.set('n', String(state.count));
  if (state.case !== DEFAULT_STATE.case) search.set('case', state.case);
  if (state.format !== DEFAULT_STATE.format) search.set('format', state.format);
  return { search, hash };
}
