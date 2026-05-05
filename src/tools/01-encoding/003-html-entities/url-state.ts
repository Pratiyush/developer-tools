/**
 * URL-state contract for the html-entities tool.
 *
 * Privacy: input may contain Latin-1 / non-ASCII characters that don't
 * round-trip through HTTP query strings unscathed. Per the project rule
 * ([feedback_url_parameters](memory)), `input` lives in the URL hash, not
 * the search string. `mode` and `variant` are non-secret and ride in
 * the search params so they're shareable as part of a quick link.
 */

import type { EncodeVariant } from './logic';

export type Mode = 'encode' | 'decode';

export interface State {
  readonly mode: Mode;
  readonly variant: EncodeVariant;
  readonly input: string;
}

export const DEFAULT_STATE: State = {
  mode: 'encode',
  variant: 'minimal',
  input: '',
};

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const modeRaw = search.get('mode');
  const mode: Mode = modeRaw === 'decode' ? 'decode' : 'encode';
  const variantRaw = search.get('variant');
  const variant: EncodeVariant = variantRaw === 'extended' ? 'extended' : 'minimal';
  return {
    mode,
    variant,
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
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
