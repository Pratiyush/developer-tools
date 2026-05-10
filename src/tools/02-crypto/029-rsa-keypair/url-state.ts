import type { HashAlgo, KeySize } from './logic';
import { HASH_ALGOS, KEY_SIZES } from './logic';

export interface State {
  readonly size: KeySize;
  readonly hash: HashAlgo;
}

export const DEFAULT_STATE: State = { size: 2048, hash: 'SHA-256' };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const s = Number(search.get('size')) as KeySize;
  const h = search.get('hash') as HashAlgo | null;
  return {
    size: (KEY_SIZES as readonly number[]).includes(s) ? s : DEFAULT_STATE.size,
    hash: h && (HASH_ALGOS as readonly string[]).includes(h) ? h : DEFAULT_STATE.hash,
  };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  if (state.size !== DEFAULT_STATE.size) search.set('size', String(state.size));
  if (state.hash !== DEFAULT_STATE.hash) search.set('hash', state.hash);
  return { search, hash: new URLSearchParams() };
}
