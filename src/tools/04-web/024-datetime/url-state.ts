export interface State { readonly input: string }
export const DEFAULT_STATE: State = { input: '' };
export function parseParams(_search: URLSearchParams, hash: URLSearchParams): State {
  return { input: hash.get('t') ?? '' };
}
export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const hash = new URLSearchParams();
  if (state.input) hash.set('t', state.input);
  return { search: new URLSearchParams(), hash };
}
