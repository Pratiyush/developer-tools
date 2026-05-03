/**
 * URL-state contract for the base64-string-converter.
 *
 * - `mode` (active card) and `urlsafe` (toggle) live in `?search` so they're
 *   indexable / shareable as plain query params.
 * - `in` (the user's input) lives in `#hash` per the project privacy rule
 *   (`feedback_url_parameters`): hash never appears in HTTP requests, Referer,
 *   or server logs.
 */

export type Mode = 'encode' | 'decode';

export interface State {
  readonly mode: Mode;
  readonly urlsafe: boolean;
  readonly input: string;
}

export const DEFAULT_STATE: State = {
  mode: 'encode',
  urlsafe: false,
  input: '',
};

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const modeRaw = search.get('mode');
  const mode: Mode = modeRaw === 'decode' ? 'decode' : 'encode';
  const urlsafe = search.get('urlsafe') === '1';
  const input = hash.get('in') ?? DEFAULT_STATE.input;
  return { mode, urlsafe, input };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();

  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  if (state.urlsafe) search.set('urlsafe', '1');
  if (state.input) hash.set('in', state.input);

  return { search, hash };
}
