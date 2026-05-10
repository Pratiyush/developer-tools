import { WORD_COUNTS, type WordCount } from './logic';

export interface State {
  readonly words: WordCount;
}

export const DEFAULT_STATE: State = { words: 12 };

export function parseParams(search: URLSearchParams, _hash: URLSearchParams): State {
  const w = Number(search.get('words')) as WordCount;
  return { words: (WORD_COUNTS as readonly number[]).includes(w) ? w : DEFAULT_STATE.words };
}

export function serializeParams(state: State): { search: URLSearchParams; hash: URLSearchParams } {
  const search = new URLSearchParams();
  if (state.words !== DEFAULT_STATE.words) search.set('words', String(state.words));
  return { search, hash: new URLSearchParams() };
}
