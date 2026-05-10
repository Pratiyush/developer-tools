/**
 * URL-state for the hash tool. Input lives in the hash (could be PII);
 * the chosen algorithm rides in the search params for shareability.
 */

import type { Algorithm } from './logic';

export interface State {
  readonly algo: Algorithm;
  readonly input: string;
}

export const DEFAULT_STATE: State = {
  algo: 'SHA-256',
  input: '',
};

const ALLOWED: ReadonlySet<Algorithm> = new Set(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const a = search.get('algo');
  return {
    algo: a && ALLOWED.has(a as Algorithm) ? (a as Algorithm) : DEFAULT_STATE.algo,
    input: hash.get('in') ?? '',
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.algo !== DEFAULT_STATE.algo) search.set('algo', state.algo);
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
