/**
 * URL-state for the password generator. The generated value itself is
 * NEVER persisted — only the user's policy choices, in the search params.
 */

export interface State {
  readonly length: number;
  readonly upper: boolean;
  readonly lower: boolean;
  readonly digits: boolean;
  readonly symbols: boolean;
  readonly excludeAmbiguous: boolean;
}

export const DEFAULT_STATE: State = {
  length: 24,
  upper: true,
  lower: true,
  digits: true,
  symbols: false,
  excludeAmbiguous: false,
};

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const len = Number(search.get('len'));
  return {
    length: Number.isInteger(len) && len >= 4 && len <= 128 ? len : DEFAULT_STATE.length,
    upper: search.get('U') !== '0',
    lower: search.get('L') !== '0',
    digits: search.get('D') !== '0',
    symbols: search.get('S') === '1',
    excludeAmbiguous: search.get('A') === '1',
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  if (state.length !== DEFAULT_STATE.length) search.set('len', String(state.length));
  if (state.upper !== DEFAULT_STATE.upper) search.set('U', state.upper ? '1' : '0');
  if (state.lower !== DEFAULT_STATE.lower) search.set('L', state.lower ? '1' : '0');
  if (state.digits !== DEFAULT_STATE.digits) search.set('D', state.digits ? '1' : '0');
  if (state.symbols !== DEFAULT_STATE.symbols) search.set('S', '1');
  if (state.excludeAmbiguous !== DEFAULT_STATE.excludeAmbiguous) search.set('A', '1');
  return { search, hash: new URLSearchParams() };
}
