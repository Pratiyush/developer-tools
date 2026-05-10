/**
 * URL-state for base64-file. We don't persist the file content (could be
 * megabytes), only the user's chosen mode.
 */

export type Mode = 'encode' | 'decode';

export interface State {
  readonly mode: Mode;
}

export const DEFAULT_STATE: State = { mode: 'encode' };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  return { mode: search.get('mode') === 'decode' ? 'decode' : 'encode' };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  return { search, hash: new URLSearchParams() };
}
