export type Mode = 'toRoman' | 'fromRoman';

export interface State {
  readonly mode: Mode;
  readonly input: string;
}

export const DEFAULT_STATE: State = { mode: 'toRoman', input: '' };

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  return {
    mode: search.get('mode') === 'fromRoman' ? 'fromRoman' : 'toRoman',
    input: hash.get('in') ?? '',
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
