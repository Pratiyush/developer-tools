/**
 * URL-state contract for the url-encode-decode tool.
 *
 * Privacy: input may include credentials, tokens, or PII pasted into a
 * query string. Per the project rule (feedback_url_parameters memory),
 * `input` lives in the URL hash, not the search string. `mode`, `variant`,
 * and `plus` are non-secret and ride in search params so they're shareable.
 */

import type { EncodeVariant } from './logic';

export type Mode = 'encode' | 'decode';

export interface State {
  readonly mode: Mode;
  readonly variant: EncodeVariant;
  /** When true, encode uses `+` for space and decode treats `+` as space. */
  readonly plus: boolean;
  readonly input: string;
}

export const DEFAULT_STATE: State = {
  mode: 'encode',
  variant: 'component',
  plus: false,
  input: '',
};

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const modeRaw = search.get('mode');
  const mode: Mode = modeRaw === 'decode' ? 'decode' : 'encode';
  const variantRaw = search.get('variant');
  const variant: EncodeVariant = variantRaw === 'uri' ? 'uri' : 'component';
  return {
    mode,
    variant,
    plus: search.get('plus') === '1',
    input: hash.get('in') ?? DEFAULT_STATE.input,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  if (state.variant !== DEFAULT_STATE.variant) search.set('variant', state.variant);
  if (state.plus !== DEFAULT_STATE.plus) search.set('plus', '1');
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
