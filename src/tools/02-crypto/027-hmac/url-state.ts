import type { Algorithm } from './logic';

export interface State {
  readonly algo: Algorithm;
  readonly message: string;
  readonly secret: string;
}

export const DEFAULT_STATE: State = { algo: 'SHA-256', message: '', secret: '' };

const ALLOWED: ReadonlySet<Algorithm> = new Set(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const a = search.get('algo');
  return {
    algo: a && ALLOWED.has(a as Algorithm) ? (a as Algorithm) : DEFAULT_STATE.algo,
    // Both message and secret live in the hash — secret is sensitive, and
    // putting it in search would leak via referrer.
    message: hash.get('m') ?? '',
    secret: hash.get('s') ?? '',
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.algo !== DEFAULT_STATE.algo) search.set('algo', state.algo);
  if (state.message) hash.set('m', state.message);
  if (state.secret) hash.set('s', state.secret);
  return { search, hash };
}
