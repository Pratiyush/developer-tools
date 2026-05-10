/**
 * URL-state for the ULID generator. Like UUID, the values themselves are
 * never persisted; only the user's prefs.
 */

export interface State {
  readonly count: number;
}

export const DEFAULT_STATE: State = { count: 1 };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const n = Number(search.get('n'));
  return {
    count: Number.isInteger(n) && n >= 1 && n <= 1000 ? n : DEFAULT_STATE.count,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  if (state.count !== DEFAULT_STATE.count) search.set('n', String(state.count));
  return { search, hash: new URLSearchParams() };
}
