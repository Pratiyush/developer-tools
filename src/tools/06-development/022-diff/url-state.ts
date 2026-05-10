export interface State {
  readonly a: string;
  readonly b: string;
}
export const DEFAULT_STATE: State = { a: '', b: '' };

export function parseParams(_search: URLSearchParams, hash: URLSearchParams): State {
  return { a: hash.get('a') ?? '', b: hash.get('b') ?? '' };
}
export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const hash = new URLSearchParams();
  if (state.a) hash.set('a', state.a);
  if (state.b) hash.set('b', state.b);
  return { search: new URLSearchParams(), hash };
}
