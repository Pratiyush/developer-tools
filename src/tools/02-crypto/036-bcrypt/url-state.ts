import { COST_DEFAULT, COST_MAX, COST_MIN } from './logic';

export type Mode = 'hash' | 'verify';

export interface State {
  readonly mode: Mode;
  readonly cost: number;
}

export const DEFAULT_STATE: State = { mode: 'hash', cost: COST_DEFAULT };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const m = search.get('mode');
  const mode: Mode = m === 'verify' ? 'verify' : 'hash';
  const cRaw = Number(search.get('cost'));
  const cost =
    Number.isFinite(cRaw) && cRaw >= COST_MIN && cRaw <= COST_MAX
      ? Math.round(cRaw)
      : DEFAULT_STATE.cost;
  return { mode, cost };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  if (state.cost !== DEFAULT_STATE.cost) search.set('cost', String(state.cost));
  return { search, hash: new URLSearchParams() };
}
