/**
 * Seed a Tolgee project with the 15 supported languages and the English
 * translations for every key in `src/locales/en.ts`.
 *
 * Run: `pnpm seed-tolgee`
 *
 * Prerequisites:
 *   - `TOLGEE_API_KEY` in `.env` with scopes `languages.edit`, `keys.edit`,
 *     `translations.edit` (a project-admin key works).
 *   - The Tolgee project exists (any starter is fine).
 *
 * Idempotent: skips languages that already exist, sets translations on
 * existing keys instead of erroring.
 *
 * API docs: https://docs.tolgee.io/api
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import en from '../src/locales/en';
import type { TranslationKey } from '../src/locales/types';
import { ALL_TRANSLATIONS, LOCALE_ORDER } from './translations-data';

// Mirror of LOCALES in src/locales/index.ts. Inlined here so this script can
// run under tsx (Node) without loading the index module, which uses Vite's
// `import.meta.glob`.
const LOCALES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
] as const;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

interface EnvBag {
  TOLGEE_API_URL?: string;
  TOLGEE_API_KEY?: string;
}

function loadEnv(): EnvBag {
  const path = join(ROOT, '.env');
  if (!existsSync(path)) return {};
  const text = readFileSync(path, 'utf8');
  const bag: EnvBag = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (key === 'TOLGEE_API_URL' || key === 'TOLGEE_API_KEY') {
      bag[key] = value;
    }
  }
  return bag;
}

interface ApiKeyInfo {
  projectId: number;
  scopes: readonly string[];
}

interface LanguageRecord {
  id: number;
  tag: string;
  name: string;
}

interface KeyRecord {
  id: number;
  name: string;
}

class TolgeeClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const init: RequestInit = {
      method,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    const response = await fetch(url, init);
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `${method} ${path} → HTTP ${String(response.status)} ${response.statusText} — ${text.slice(0, 300)}`,
      );
    }
    if (text.length === 0) return {} as T;
    return JSON.parse(text) as T;
  }

  async getKeyInfo(): Promise<ApiKeyInfo> {
    interface Raw {
      projectId: number;
      scopes: readonly string[];
    }
    const raw = await this.request<Raw>('GET', '/v2/api-keys/current');
    return { projectId: raw.projectId, scopes: raw.scopes };
  }

  async listLanguages(projectId: number): Promise<LanguageRecord[]> {
    interface Raw {
      _embedded?: { languages?: LanguageRecord[] };
    }
    const raw = await this.request<Raw>(
      'GET',
      `/v2/projects/${String(projectId)}/languages?size=200`,
    );
    return raw._embedded?.languages ?? [];
  }

  async createLanguage(
    projectId: number,
    tag: string,
    name: string,
    originalName: string,
  ): Promise<void> {
    await this.request<unknown>('POST', `/v2/projects/${String(projectId)}/languages`, {
      name,
      tag,
      originalName,
    });
  }

  async listKeys(projectId: number): Promise<KeyRecord[]> {
    interface Raw {
      _embedded?: { keys?: KeyRecord[] };
    }
    const raw = await this.request<Raw>('GET', `/v2/projects/${String(projectId)}/keys?size=500`);
    return raw._embedded?.keys ?? [];
  }

  async setTranslation(
    projectId: number,
    keyName: string,
    languageTag: string,
    text: string,
  ): Promise<void> {
    await this.request<unknown>('POST', `/v2/projects/${String(projectId)}/translations`, {
      key: keyName,
      translations: { [languageTag]: text },
    });
  }

  /** Bulk: set translations across multiple languages for one key in one call. */
  async setTranslations(
    projectId: number,
    keyName: string,
    translations: Record<string, string>,
  ): Promise<void> {
    await this.request<unknown>('POST', `/v2/projects/${String(projectId)}/translations`, {
      key: keyName,
      translations,
    });
  }
}

async function main(): Promise<void> {
  const env = loadEnv();
  const apiUrl = env.TOLGEE_API_URL ?? 'https://app.tolgee.io';
  const apiKey = env.TOLGEE_API_KEY;
  if (!apiKey) {
    console.error('TOLGEE_API_KEY missing from .env. See .env.example.');
    process.exit(2);
  }

  const tolgee = new TolgeeClient(apiUrl, apiKey);

  console.log('→ identifying project from API key…');
  const keyInfo = await tolgee.getKeyInfo();
  console.log(`  project #${String(keyInfo.projectId)}, scopes: ${keyInfo.scopes.join(', ')}`);

  // 1) Languages
  console.log('→ listing languages…');
  const existing = await tolgee.listLanguages(keyInfo.projectId);
  const existingTags = new Set(existing.map((l) => l.tag));
  console.log(
    `  existing: ${existing.length === 0 ? '(none)' : existing.map((l) => l.tag).join(', ')}`,
  );

  let created = 0;
  let skippedLang = 0;
  for (const locale of LOCALES) {
    if (existingTags.has(locale.code)) {
      skippedLang += 1;
      continue;
    }
    try {
      await tolgee.createLanguage(keyInfo.projectId, locale.code, locale.label, locale.nativeLabel);
      console.log(`  + ${locale.code} (${locale.label} / ${locale.nativeLabel})`);
      created += 1;
    } catch (e) {
      console.error(`  ! ${locale.code} failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  console.log(`  languages: created=${String(created)}, skipped=${String(skippedLang)}`);

  // 2) Keys + translations across all 15 locales (one POST per key, all langs).
  const keyNames = Object.keys(en) as TranslationKey[];
  console.log(
    `→ seeding ${String(keyNames.length)} keys × ${String(LOCALE_ORDER.length)} locales…`,
  );
  let setOk = 0;
  let setFail = 0;
  for (const keyName of keyNames) {
    const translations: Record<string, string> = {};
    for (const code of LOCALE_ORDER) {
      const table = ALL_TRANSLATIONS[code];
      if (table) translations[code] = table[keyName];
    }
    try {
      await tolgee.setTranslations(keyInfo.projectId, keyName, translations);
      console.log(`  ✓ ${keyName} (${String(Object.keys(translations).length)} langs)`);
      setOk += 1;
    } catch (e) {
      console.error(`  ! ${keyName} failed: ${e instanceof Error ? e.message : String(e)}`);
      setFail += 1;
    }
  }
  console.log(`  keys: ok=${String(setOk)}, failed=${String(setFail)}`);

  console.log('\nDone. Run `pnpm sync-i18n` to pull translations back into the build.');
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Seed failed.');
  }
  process.exit(1);
});
