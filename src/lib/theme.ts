/**
 * Theme system. **Locked default = `editorial`** (premium light, Fraunces
 * serif italic, terracotta accent — lifted from the v3 design pivot).
 *
 * Three themes total — pruned 2026-05-07 from the original ten:
 *   - `editorial` (default) — Fraunces / Geist / Plex Mono on warm cream
 *   - `clean`     — Inter on white, soft shadow (legacy fallback)
 *   - `vercel`    — Black + violet, sharper edges
 *
 * Removed in this pass: mono, grid, linear, paper, swiss, aurora, matrix.
 * If a user has one of those values stored in localStorage, the
 * `getStoredTheme` fallback returns DEFAULT_THEME on the next paint.
 *
 * Theme is applied as a `data-theme` attribute on the document root and
 * persisted to localStorage so the user's choice survives reloads.
 */

export const THEMES = ['editorial', 'clean', 'vercel'] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'editorial';

export const STORAGE_KEY = 'dt.theme';

export const THEME_LABEL: Record<Theme, string> = {
  editorial: 'Editorial',
  clean: 'Clean',
  vercel: 'Vercel',
};

const THEME_NOTE: Record<Theme, string> = {
  editorial: 'Fraunces serif, terracotta',
  clean: 'Light, soft shadow',
  vercel: 'Black + violet',
};

export function getThemeNote(theme: Theme): string {
  return THEME_NOTE[theme];
}

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

export function getStoredTheme(storage: Storage = safeStorage()): Theme {
  const raw = storage.getItem(STORAGE_KEY);
  return raw && isTheme(raw) ? raw : DEFAULT_THEME;
}

export function setStoredTheme(theme: Theme, storage: Storage = safeStorage()): void {
  storage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-theme', theme);
}

export function initTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  setStoredTheme(theme);
}

/**
 * Storage shim used when localStorage is unavailable (SSR-style contexts,
 * tests without jsdom). Falls back to an in-memory Map.
 */
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
