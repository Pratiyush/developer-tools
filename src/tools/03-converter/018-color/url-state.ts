export interface State {
  readonly input: string;
}
export const DEFAULT_STATE: State = { input: '#6366f1' };

export function parseParams(_search: URLSearchParams, hash: URLSearchParams): State {
  return { input: hash.get('c') ?? DEFAULT_STATE.input };
}
export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const hash = new URLSearchParams();
  if (state.input && state.input !== DEFAULT_STATE.input) hash.set('c', state.input);
  return { search: new URLSearchParams(), hash };
}
