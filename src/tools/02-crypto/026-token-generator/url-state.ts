import { PRESETS, type Preset } from './logic';

export interface State {
  readonly preset: Preset;
  readonly length: number;
}

export const DEFAULT_STATE: State = { preset: 'base64url', length: 32 };

const ALLOWED: ReadonlySet<Preset> = new Set(PRESETS);

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const p = search.get('p');
  const lenRaw = search.get('len');
  const len = lenRaw === null ? Number.NaN : Number(lenRaw);
  return {
    preset: p && ALLOWED.has(p as Preset) ? (p as Preset) : DEFAULT_STATE.preset,
    length: Number.isInteger(len) && len >= 8 && len <= 256 ? len : DEFAULT_STATE.length,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  if (state.preset !== DEFAULT_STATE.preset) search.set('p', state.preset);
  if (state.length !== DEFAULT_STATE.length) search.set('len', String(state.length));
  return { search, hash: new URLSearchParams() };
}
