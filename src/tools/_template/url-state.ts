/**
 * URL-state contract for this tool.
 * `input` lives in `#hash` (treated as sensitive / large).
 * Structural / mode params would go in `?search`.
 */

export interface State {
  input: string;
}

export const DEFAULT_STATE: State = {
  input: '',
};

export function parseParams(_search: URLSearchParams, hash: URLSearchParams): State {
  return {
    input: hash.get('input') ?? DEFAULT_STATE.input,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.input) hash.set('input', state.input);
  return { search, hash };
}
