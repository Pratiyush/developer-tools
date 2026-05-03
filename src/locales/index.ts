import { ALL_TRANSLATIONS } from '../../scripts/translations-data';
import type { Translations } from './types';
import en from './en';

/**
 * Locale registry. The 15 locale codes below are recognized — auto-detected
 * from `navigator.language` and stored when chosen. Real translations come
 * from three layered sources, lowest priority first:
 *   1. English fallback (`src/locales/en.ts`) — guaranteed to have every key,
 *      so a brand-new key never surfaces as a raw string to the user.
 *   2. Hand-authored translations (`scripts/translations-data.ts`) — written
 *      in code, type-checked against {@link Translations}. These ship in the
 *      bundle and make the runtime language switcher actually swap strings,
 *      even before a Tolgee round-trip has populated the synced JSON.
 *   3. Tolgee-synced JSON (`src/locales/_synced/<code>.json`) — fetched by
 *      `pnpm sync-i18n`. Vite's `import.meta.glob` picks them up at build
 *      time, so the deployed app contains them as static assets and never
 *      calls Tolgee. When present, these win because translators may have
 *      refined the authored text.
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
  const authored = ALL_TRANSLATIONS[code];
  const synced_ = synced[`./_synced/${code}.json`];
  // Layered merge: en (every key, English) ← authored (full native, in code)
  // ← synced (Tolgee-refined). Missing keys fall back gracefully through
  // each layer instead of surfacing as raw key strings.
  return { ...en, ...(authored ?? {}), ...(synced_ ?? {}) };
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
