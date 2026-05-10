/**
 * Tool visibility — runtime filter over the tool registry.
 *
 * Lets the user pick a subset of tools to surface in the sidebar and home
 * grid. The original registry stays untouched; this module only computes a
 * filtered *view* and persists the chosen IDs to localStorage.
 *
 * Why: during recording (videos, screenshots, demos) we frequently want to
 * isolate one tool so the rest of the workbench doesn't visually compete
 * with the subject. Outside of recording, the default ("show all") matches
 * what 99% of users want.
 *
 * Storage format
 * --------------
 * Key: `dt.tool-visibility` — JSON object `{ "mode": "all" | "subset", "ids":
 * string[] }`. `mode: "all"` means show every registered tool (the
 * `ids` array is ignored in that case but kept around so flipping back to
 * subset preserves the previous selection). `mode: "subset"` filters to the
 * IDs in `ids`. An empty `ids` under `subset` is treated as "hide
 * everything" — useful for taking screenshots of an empty home page.
 *
 * The default (no localStorage key, parse error, etc.) is `mode: "all"` so
 * users on a fresh browser see the full workbench.
 */

export const STORAGE_KEY = 'dt.tool-visibility';

export type VisibilityMode = 'all' | 'subset';

export interface VisibilityState {
  readonly mode: VisibilityMode;
  /** Selected IDs when mode is `'subset'`. Order is preserved for UX. */
  readonly ids: readonly string[];
}

export const DEFAULT_VISIBILITY: VisibilityState = { mode: 'all', ids: [] };

const listeners = new Set<(state: VisibilityState) => void>();

let current: VisibilityState = DEFAULT_VISIBILITY;

/** Read the persisted visibility state. Returns DEFAULT on miss / parse error. */
export function getVisibility(storage: Storage = safeStorage()): VisibilityState {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_VISIBILITY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isVisibilityState(parsed)) return DEFAULT_VISIBILITY;
    return parsed;
  } catch {
    return DEFAULT_VISIBILITY;
  }
}

/** Persist + broadcast a new visibility state. */
export function setVisibility(state: VisibilityState, storage: Storage = safeStorage()): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  current = state;
  for (const cb of listeners) cb(state);
}

export function initVisibility(): VisibilityState {
  current = getVisibility();
  return current;
}

export function onVisibilityChange(cb: (state: VisibilityState) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Apply a {@link VisibilityState} to a tool list. Pure function; the input
 * registry is never mutated. Order of the original list is preserved.
 */
export function applyVisibility<T extends { readonly id: string }>(
  tools: readonly T[],
  state: VisibilityState,
): readonly T[] {
  if (state.mode === 'all') return tools;
  const allowed = new Set(state.ids);
  return tools.filter((tool) => allowed.has(tool.id));
}

/**
 * Convenience: switch the registry to "show only this one tool" mode.
 * Used by the recording-preset button so we don't make the user uncheck
 * N − 1 boxes.
 */
export function showOnly(id: string): VisibilityState {
  return { mode: 'subset', ids: [id] };
}

export function showAll(): VisibilityState {
  return { mode: 'all', ids: current.ids };
}

function isVisibilityState(value: unknown): value is VisibilityState {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (obj.mode !== 'all' && obj.mode !== 'subset') return false;
  if (!Array.isArray(obj.ids)) return false;
  return obj.ids.every((x): x is string => typeof x === 'string');
}

function safeStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return memoryStorage;
}

const memoryMap = new Map<string, string>();
const memoryStorage: Storage = {
  get length() {
    return memoryMap.size;
  },
  clear() {
    memoryMap.clear();
  },
  getItem(key) {
    return memoryMap.get(key) ?? null;
  },
  key(index) {
    return Array.from(memoryMap.keys())[index] ?? null;
  },
  removeItem(key) {
    memoryMap.delete(key);
  },
  setItem(key, value) {
    memoryMap.set(key, value);
  },
};
