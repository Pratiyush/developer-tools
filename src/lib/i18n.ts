/**
 * i18n — lightweight translation lookup with browser-default detection.
 *
 * Keys are static strings checked at compile time via {@link TranslationKey}.
 * Locale defaults to the browser's preferred language (`navigator.language`),
 * falling back to `en` when the browser's choice isn't recognized. The
 * user's explicit choice (if any) is persisted to localStorage.
 */

import type { LocaleCode } from '../locales';
import { LOCALES, getDir, getTable, isLocale } from '../locales';
import type { TranslationKey, Translations } from '../locales/types';

export const STORAGE_KEY = 'dt.locale';

export const DEFAULT_LOCALE: LocaleCode = 'en';

let currentLocale: LocaleCode = DEFAULT_LOCALE;
let currentTable: Translations = getTable(DEFAULT_LOCALE);

const listeners = new Set<(locale: LocaleCode) => void>();

export function getLocale(): LocaleCode {
  return currentLocale;
}

export function setLocale(locale: LocaleCode, persist = true): void {
  currentLocale = locale;
  currentTable = getTable(locale);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', getDir(locale));
  }
  if (persist) safeStorage().setItem(STORAGE_KEY, locale);
  for (const cb of listeners) cb(locale);
}

export function onLocaleChange(cb: (locale: LocaleCode) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  const raw = currentTable[key] ?? key;
  if (!params) return raw;
  return Object.entries(params).reduce(
    (acc, [name, value]) => acc.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
    raw,
  );
}

/** Shorthand. */
export const t = translate;

/**
 * Detect the user's preferred locale from `navigator.languages`, walking the
 * list and matching each against our recognized codes (full match first, then
 * primary subtag). Returns DEFAULT_LOCALE on no match.
 */
export function detectBrowserLocale(): LocaleCode {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const candidates: string[] = [];
  if (navigator.languages && navigator.languages.length > 0) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) candidates.push(navigator.language);

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    if (isLocale(lower)) return lower;
    const primary = lower.split('-')[0];
    if (primary && isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}

export function initI18n(): LocaleCode {
  const stored = safeStorage().getItem(STORAGE_KEY);
  const initial: LocaleCode = stored && isLocale(stored) ? stored : detectBrowserLocale();
  setLocale(initial, false);
  return initial;
}

export { LOCALES };
export type { LocaleCode, TranslationKey };

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
