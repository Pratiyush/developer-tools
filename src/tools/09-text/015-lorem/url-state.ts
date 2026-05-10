export interface State {
  readonly paragraphs: number;
  readonly classic: boolean;
}

export const DEFAULT_STATE: State = { paragraphs: 3, classic: true };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const p = Number(search.get('p'));
  return {
    paragraphs: Number.isInteger(p) && p >= 1 && p <= 100 ? p : DEFAULT_STATE.paragraphs,
    classic: search.get('classic') !== '0',
  };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  if (state.paragraphs !== DEFAULT_STATE.paragraphs) search.set('p', String(state.paragraphs));
  if (!state.classic) search.set('classic', '0');
  return { search, hash: new URLSearchParams() };
}
