import { CASES, type Case } from './logic';

export interface State {
  readonly target: Case;
  readonly input: string;
}

export const DEFAULT_STATE: State = {
  target: 'camel',
  input: '',
};

const ALLOWED: ReadonlySet<Case> = new Set(CASES);

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const t = search.get('t');
  return {
    target: t && ALLOWED.has(t as Case) ? (t as Case) : DEFAULT_STATE.target,
    input: hash.get('in') ?? '',
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.target !== DEFAULT_STATE.target) search.set('t', state.target);
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
