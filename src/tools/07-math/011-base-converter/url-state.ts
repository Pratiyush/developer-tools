import type { Base } from './logic';

export interface State {
  readonly from: Base;
  readonly input: string;
}

export const DEFAULT_STATE: State = { from: 10, input: '' };

const ALLOWED: ReadonlySet<Base> = new Set([2, 8, 10, 16, 36] as readonly Base[]);

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const f = Number(search.get('from')) as Base;
  return {
    from: ALLOWED.has(f) ? f : DEFAULT_STATE.from,
    input: hash.get('in') ?? '',
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.from !== DEFAULT_STATE.from) search.set('from', String(state.from));
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
