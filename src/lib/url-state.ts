/**
 * Hybrid URL-state helpers.
 *
 * Convention: short / safe params live in `?search`; sensitive or large
 * payloads live in `#hash`. Hash is *never* sent to the server.
 */

export interface URLState {
  search: URLSearchParams;
  hash: URLSearchParams;
}

/** Subset of `Location` we actually read — keeps tests stub-friendly. */
export type ReadableLocation = Pick<Location, 'pathname' | 'search' | 'hash'>;

/** Subset of `History` we actually call — keeps tests stub-friendly. */
export interface WritableHistory {
  state: History['state'];
  replaceState: History['replaceState'];
}

/** Parse both `loc.search` and `loc.hash` (treating hash as `?...`). */
export function parseURL(loc: ReadableLocation): URLState {
  const search = new URLSearchParams(loc.search);
  const rawHash = loc.hash.startsWith('#') ? loc.hash.slice(1) : loc.hash;
  const hashQuery = rawHash.startsWith('?') ? rawHash.slice(1) : rawHash;
  const hash = new URLSearchParams(hashQuery);
  return { search, hash };
}

/**
 * Replace the current URL with the merged search + hash from `state`.
 * Empty params produce a clean URL (no trailing `?` or `#`).
 * Uses `replaceState` to avoid polluting browser history.
 */
export function applyURL(
  state: URLState,
  loc: Pick<Location, 'pathname'>,
  history: WritableHistory,
): void {
  const searchStr = state.search.toString();
  const hashStr = state.hash.toString();
  const path = loc.pathname;
  const url = path + (searchStr ? `?${searchStr}` : '') + (hashStr ? `#${hashStr}` : '');
  history.replaceState(history.state, '', url);
}

/**
 * Generic trailing-edge debounce. Returns a callable that defers `fn`
 * until `ms` of quiet time has passed since the last call.
 */
export function debounceUpdate(fn: () => void, ms = 250): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, ms);
  };
}
