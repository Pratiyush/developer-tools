export type Mode = 'encrypt' | 'decrypt';

export interface State {
  readonly mode: Mode;
}

export const DEFAULT_STATE: State = { mode: 'encrypt' };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  return { mode: search.get('mode') === 'decrypt' ? 'decrypt' : 'encrypt' };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  return { search, hash: new URLSearchParams() };
}
