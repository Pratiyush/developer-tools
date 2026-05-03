/**
 * Sync translations from Tolgee.
 *
 * Calls the Tolgee export endpoint once to fetch ALL locales in a single
 * request, unzips into `src/locales/_synced/<code>.json`, and updates
 * `src/locales/_synced/manifest.json` with the list of synced codes.
 *
 * Run: `pnpm sync-i18n`
 *
 * The API key is read from `.env` (Node-side only — never bundled into the
 * browser build). Vite's `import.meta.glob` picks up the JSON files at build
 * time, so the deployed app contains all translations as static assets and
 * does NOT call Tolgee at runtime.
 *
 * API docs: https://docs.tolgee.io/api
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SYNCED_DIR = join(ROOT, 'src', 'locales', '_synced');

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

interface ExportError {
  message: string;
}

interface DownloadResult {
  empty: boolean;
}

async function downloadZip(url: string, dest: string): Promise<DownloadResult> {
  const response = await fetch(url);
  if (response.ok) {
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(dest, buffer);
    return { empty: false };
  }
  const body = await response.text().catch(() => '');
  // Tolgee returns 400 with `no_exported_result` when the project has no
  // keys/languages yet. Treat as benign — runtime falls back to local en.
  if (response.status === 400 && body.includes('no_exported_result')) {
    return { empty: true };
  }
  const error: ExportError = {
    message: `Tolgee export failed: HTTP ${String(response.status)} ${response.statusText} — ${body.slice(0, 200)}`,
  };
  throw new Error(error.message);
}

function unzip(zipPath: string, destDir: string): void {
  // Use system `unzip`. Args passed as array — no shell interpretation.
  execFileSync('unzip', ['-o', '-q', zipPath, '-d', destDir]);
}

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const composed = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out[composed] = value;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value as Record<string, unknown>, composed));
    }
  }
  return out;
}

function normalizeOne(jsonPath: string): Record<string, string> {
  const raw = readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return flatten(parsed);
}

async function main(): Promise<void> {
  const env = loadEnv();
  const apiUrl = env.TOLGEE_API_URL ?? 'https://app.tolgee.io';
  const apiKey = env.TOLGEE_API_KEY;
  if (!apiKey) {
    console.error('TOLGEE_API_KEY missing from .env. See .env.example.');
    process.exit(2);
  }

  const exportUrl = `${apiUrl}/v2/projects/export?ak=${encodeURIComponent(apiKey)}`;
  const tmpZip = join(tmpdir(), `tolgee-${String(Date.now())}.zip`);
  const tmpExtract = join(tmpdir(), `tolgee-extract-${String(Date.now())}`);

  console.log('→ fetching translations from Tolgee…');
  const dl = await downloadZip(exportUrl, tmpZip);
  if (dl.empty) {
    console.log(
      '  ! Tolgee project has no exportable keys yet. Add languages + keys at https://app.tolgee.io/projects, then re-run.',
    );
    rmSync(SYNCED_DIR, { recursive: true, force: true });
    mkdirSync(SYNCED_DIR, { recursive: true });
    writeFileSync(
      join(SYNCED_DIR, 'manifest.json'),
      JSON.stringify(
        { syncedAt: new Date().toISOString(), codes: [], note: 'project empty' },
        null,
        2,
      ) + '\n',
    );
    rmSync(tmpZip, { force: true });
    return;
  }

  console.log('→ unzipping…');
  mkdirSync(tmpExtract, { recursive: true });
  unzip(tmpZip, tmpExtract);

  // Collect all *.json files (Tolgee may put them at root or in subdirs).
  const found: { code: string; data: Record<string, string> }[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const code = entry.name.replace(/\.json$/, '').toLowerCase();
        found.push({ code, data: normalizeOne(full) });
      }
    }
  }
  walk(tmpExtract);

  if (found.length === 0) {
    console.error('No JSON files found in the Tolgee export.');
    process.exit(3);
  }

  // Write to src/locales/_synced/<code>.json
  rmSync(SYNCED_DIR, { recursive: true, force: true });
  mkdirSync(SYNCED_DIR, { recursive: true });
  for (const { code, data } of found) {
    writeFileSync(join(SYNCED_DIR, `${code}.json`), JSON.stringify(data, null, 2) + '\n');
    console.log(`  ✓ ${code}.json (${String(Object.keys(data).length)} keys)`);
  }
  writeFileSync(
    join(SYNCED_DIR, 'manifest.json'),
    JSON.stringify(
      { syncedAt: new Date().toISOString(), codes: found.map((f) => f.code).sort() },
      null,
      2,
    ) + '\n',
  );

  // Cleanup
  rmSync(tmpZip, { force: true });
  rmSync(tmpExtract, { recursive: true, force: true });

  console.log(`✓ synced ${String(found.length)} locales → src/locales/_synced/`);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Sync failed.');
  }
  process.exit(1);
});
