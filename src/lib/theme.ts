/**
 * Theme system. Locked default = `clean`. Six alternates.
 *
 * Theme is applied as a `data-theme` attribute on the document root and
 * persisted to localStorage so the user's choice survives reloads.
 */

export const THEMES = ['clean', 'linear', 'vercel', 'paper', 'swiss', 'aurora', 'matrix'] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'clean';

export const STORAGE_KEY = 'dt.theme';

export const THEME_LABEL: Record<Theme, string> = {
  clean: 'Clean',
  linear: 'Linear',
  vercel: 'Vercel',
  paper: 'Paper',
  swiss: 'Swiss',
  aurora: 'Aurora',
  matrix: 'Matrix',
};

const THEME_NOTE: Record<Theme, string> = {
  clean: 'Light, soft shadow',
  linear: 'Mono dark, indigo',
  vercel: 'Black + violet',
  paper: 'Newsreader serif',
  swiss: 'Hard borders, mono',
  aurora: 'Purple → cyan',
  matrix: 'Green on black',
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
