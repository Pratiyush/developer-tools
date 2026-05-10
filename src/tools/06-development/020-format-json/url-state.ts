export type Mode = 'pretty' | 'minify';
export interface State { readonly mode: Mode; readonly indent: number; readonly input: string }
export const DEFAULT_STATE: State = { mode: 'pretty', indent: 2, input: '' };

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  const indRaw = search.get('indent');
  const ind = indRaw === null ? Number.NaN : Number(indRaw);
  return {
    mode: search.get('mode') === 'minify' ? 'minify' : 'pretty',
    indent: Number.isInteger(ind) && ind >= 0 && ind <= 8 ? ind : DEFAULT_STATE.indent,
    input: hash.get('in') ?? '',
  };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.mode !== DEFAULT_STATE.mode) search.set('mode', state.mode);
  if (state.indent !== DEFAULT_STATE.indent) search.set('indent', String(state.indent));
  if (state.input) hash.set('in', state.input);
  return { search, hash };
}
