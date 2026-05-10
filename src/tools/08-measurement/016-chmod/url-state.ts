export interface State {
  readonly octal: string;
}
export const DEFAULT_STATE: State = { octal: '644' };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const o = search.get('o');
  return { octal: o && /^[0-7]{3}$/.test(o) ? o : DEFAULT_STATE.octal };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  if (state.octal !== DEFAULT_STATE.octal) search.set('o', state.octal);
  return { search, hash: new URLSearchParams() };
}
