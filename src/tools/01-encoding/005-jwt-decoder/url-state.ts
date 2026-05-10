/**
 * URL-state contract for the jwt-decoder tool.
 *
 * Privacy: a JWT is, by definition, sensitive (auth tokens, session
 * identifiers, user claims). Per the project rule
 * (feedback_url_parameters memory), the token lives in the URL hash so it
 * never reaches server logs. There are no other state fields — the tool
 * is single-pane.
 */

export interface State {
  readonly input: string;
}

export const DEFAULT_STATE: State = {
  input: '',
};

export function parseParams(_search: URLSearchParams, hash: URLSearchParams): State {
  return {
    input: hash.get('jwt') ?? DEFAULT_STATE.input,
  };
}

export function serializeParams(state: State): {
  search: URLSearchParams;
  hash: URLSearchParams;
} {
  const search = new URLSearchParams();
  const hash = new URLSearchParams();
  if (state.input) hash.set('jwt', state.input);
  return { search, hash };
}
