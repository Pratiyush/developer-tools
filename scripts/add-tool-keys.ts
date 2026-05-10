#!/usr/bin/env tsx
/**
 * Bulk-add new tool i18n keys to types.ts + en.ts + translations-data.ts.
 *
 * Usage (from the project root):
 *
 *   pnpm tsx scripts/add-tool-keys.ts <jsonPath>
 *
 * where `<jsonPath>` is a JSON file shaped:
 *
 *   {
 *     "tools.uuid.heading": "UUID generator",
 *     "tools.uuid.intro":   "RFC 4122 v4, generated locally."
 *   }
 *
 * Behaviour:
 *   1. Adds each key to `Translations` in `src/locales/types.ts`.
 *   2. Inserts the English value into `src/locales/en.ts`.
 *   3. Mirrors the *English* value into all 14 non-English locales in
 *      `scripts/translations-data.ts`. We don't translate — that's a
 *      Tolgee follow-up. The point is to keep the type checker happy
 *      while we ship 25 tools in one push.
 *
 * The script is idempotent: if a key already exists it's left alone.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = dirname(__filename_);
const ROOT = resolve(__dirname_, '..');
const TYPES_PATH = resolve(ROOT, 'src/locales/types.ts');
const EN_PATH = resolve(ROOT, 'src/locales/en.ts');
const DATA_PATH = resolve(ROOT, 'scripts/translations-data.ts');

const LOCALE_BLOCKS: readonly string[] = [
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'nl',
  'pl',
  'ru',
  'tr',
  'ja',
  'zh',
  'ko',
  'hi',
  'ar',
];

type Pairs = Readonly<Record<string, string>>;

function isPairs(value: unknown): value is Pairs {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  for (const v of Object.values(value)) {
    if (typeof v !== 'string') return false;
  }
  return true;
}

function main(): void {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('usage: add-tool-keys.ts <jsonPath>');
    process.exit(1);
  }
  const parsed: unknown = JSON.parse(readFileSync(jsonPath, 'utf8'));
  if (!isPairs(parsed)) {
    console.error(
      'expected JSON object with string values: { "tools.foo.bar": "English text", ... }',
    );
    process.exit(1);
  }
  const pairs: Pairs = parsed;
  const keys = Object.keys(pairs);
  if (keys.length === 0) {
    console.error('no keys to add');
    process.exit(1);
  }

  injectIntoTypes(pairs);
  injectIntoEn(pairs);
  injectIntoTranslationsData(pairs);

  console.info(`✓ Added ${keys.length} key(s) to types + 15 locales.`);
}

function injectIntoTypes(pairs: Pairs): void {
  const src = readFileSync(TYPES_PATH, 'utf8');
  const lines = src.split('\n');
  const closeIdx = lines.findIndex(
    (line, i) =>
      line.trim() === '}' &&
      lines.slice(0, i).some((l) => l.includes('export interface Translations')),
  );
  if (closeIdx === -1) throw new Error('cannot find Translations close brace');
  const additions: string[] = [];
  for (const key of Object.keys(pairs)) {
    if (src.includes(`'${key}':`)) continue;
    additions.push(`  '${key}': string;`);
  }
  if (additions.length === 0) return;
  const out = [...lines.slice(0, closeIdx), ...additions, ...lines.slice(closeIdx)].join('\n');
  writeFileSync(TYPES_PATH, out);
}

function injectIntoEn(pairs: Pairs): void {
  const src = readFileSync(EN_PATH, 'utf8');
  const lines = src.split('\n');
  // Find the `};` that closes the `const en: Translations = { ... };` object.
  // It's the LAST line that's exactly `};` followed by either EOF or a blank
  // and `export default en;`.
  const closeIdx = lines.findIndex(
    (line, i) =>
      line.trim() === '};' && lines.slice(i + 1).some((l) => l.includes('export default en')),
  );
  if (closeIdx === -1) throw new Error('cannot find en.ts close brace');
  const additions: string[] = [];
  for (const [key, value] of Object.entries(pairs)) {
    if (src.includes(`'${key}':`)) continue;
    additions.push(`  '${key}': ${JSON.stringify(value)},`);
  }
  if (additions.length === 0) return;
  const out = [...lines.slice(0, closeIdx), ...additions, ...lines.slice(closeIdx)].join('\n');
  writeFileSync(EN_PATH, out);
}

function injectIntoTranslationsData(pairs: Pairs): void {
  let src = readFileSync(DATA_PATH, 'utf8');
  for (const locale of LOCALE_BLOCKS) {
    src = injectLocale(src, locale, pairs);
  }
  writeFileSync(DATA_PATH, src);
}

/** Inject pairs into one locale block. The block opens with
 *  `const <code>: Translations = {` and ends with `};\n\n` (or EOF).
 *  We find that closing `};` and insert before it. */
function injectLocale(src: string, locale: string, pairs: Pairs): string {
  const start = src.indexOf(`const ${locale}: Translations = {`);
  if (start === -1) throw new Error(`locale block not found: ${locale}`);
  const close = src.indexOf('};', start);
  if (close === -1) throw new Error(`locale block close not found: ${locale}`);
  const block = src.slice(start, close);
  const additions: string[] = [];
  for (const [key, value] of Object.entries(pairs)) {
    if (block.includes(`'${key}':`)) continue;
    additions.push(`  '${key}': ${JSON.stringify(value)},`);
  }
  if (additions.length === 0) return src;
  const insertion = additions.join('\n') + '\n';
  return src.slice(0, close) + insertion + src.slice(close);
}

main();
