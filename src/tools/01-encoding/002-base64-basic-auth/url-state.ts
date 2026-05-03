/**
 * URL-state contract for the base64-basic-auth tool.
 *
 * - `mode` (encode | decode) lives in `?search` so links to a particular
 *   pane mode are shareable.
 * - Credential fields live in `#hash` per `feedback_url_parameters` —
 *   passwords must NEVER appear in HTTP requests, Referer headers, or
 *   server logs. The hash is browser-local.
 */

export type Mode = 'encode' | 'decode';

export interface State {
  readonly mode: Mode;
  readonly username: string;
  readonly password: string;
  readonly header: string;
}

export const DEFAULT_STATE: State = {
  mode: 'encode',
  username: '',
  password: '',
  header: '',
};

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const modeRaw = search.get('mode');
  const mode: Mode = modeRaw === 'decode' ? 'decode' : 'encode';
  return {
    mode,
    username: hash.get('u') ?? DEFAULT_STATE.username,
    password: hash.get('p') ?? DEFAULT_STATE.password,
    header: hash.get('h') ?? DEFAULT_STATE.header,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();

  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  if (state.username) hash.set('u', state.username);
  if (state.password) hash.set('p', state.password);
  if (state.header) hash.set('h', state.header);

  return { search, hash };
}
