export interface State {
  readonly pattern: string;
  readonly flags: string;
  readonly subject: string;
}
export const DEFAULT_STATE: State = { pattern: '', flags: '', subject: '' };

export function parseParams(search: URLSearchParams, hash: URLSearchParams): State {
  return {
    pattern: hash.get('p') ?? '',
    flags: search.get('f') ?? '',
    subject: hash.get('s') ?? '',
  };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.flags) search.set('f', state.flags);
  if (state.pattern) hash.set('p', state.pattern);
  if (state.subject) hash.set('s', state.subject);
  return { search, hash };
}
