import type { Translations } from './types';
import en from './en';

/**
 * Locale registry. The 15 locale codes below are recognized — auto-detected
 * from `navigator.language` and stored when chosen. Real translations come
 * from one of:
 *   1. `src/locales/_synced/<code>.json` — fetched by `pnpm sync-i18n` from
 *      Tolgee. Vite's `import.meta.glob` picks them up at build time, so the
 *      deployed app contains them as static assets and never calls Tolgee.
 *   2. `src/locales/<code>.ts` — hand-rolled fallback (only `en` today).
 *
 * Lookup order: synced JSON → hand-rolled → English.
 */

export const LOCALES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', dir: 'ltr' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', dir: 'ltr' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', dir: 'ltr' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', dir: 'ltr' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', dir: 'ltr' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', dir: 'ltr' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

/**
 * Vite picks every JSON file in `_synced/` at build time. The keys are the
 * relative paths (e.g. `./_synced/es.json`). The value is the parsed JSON
 * default export — a flat string→string map.
 */
const synced = import.meta.glob<Record<string, string>>('./_synced/*.json', {
  eager: true,
  import: 'default',
});

function buildTable(code: LocaleCode): Translations {
  const synced_ = synced[`./_synced/${code}.json`];
  if (synced_) {
    // Merge English defaults with synced overrides so missing keys never
    // surface as raw key strings to the user.
    return { ...en, ...synced_ };
  }
  return en;
}

const LOCALE_TABLES: Record<LocaleCode, Translations> = Object.fromEntries(
  LOCALES.map((l) => [l.code, buildTable(l.code)]),
) as Record<LocaleCode, Translations>;

export function getTable(locale: LocaleCode): Translations {
  return LOCALE_TABLES[locale];
}

export function isLocale(value: string): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}

export function getDir(locale: LocaleCode): 'ltr' | 'rtl' {
  return LOCALES.find((l) => l.code === locale)?.dir === 'rtl' ? 'rtl' : 'ltr';
}

/** Names of locales that currently have real synced translations. */
export function syncedLocales(): readonly LocaleCode[] {
  return LOCALES.map((l) => l.code).filter((code) => `./_synced/${code}.json` in synced);
}
