/**
 * SB-02 (#41) — extract `IT Tools*.zip` into `public/design-showcase/`.
 *
 * `public/design-showcase/` is gitignored (would bloat the repo on every
 * regen); contributors run this script once per design refresh. CI does
 * NOT run it — the Storybook build guards `staticDirs` with `existsSync`
 * so a missing folder doesn't crash the build (see SB-12 / #50 hotfix).
 *
 * Behavior:
 * - `--zip <path>` overrides the default zip path.
 * - Without `--zip`, walks the repo root for `IT Tools*.zip` and uses
 *   the first match.
 * - If no zip is found, logs a `consola.warn` and exits 0 (CI-safe).
 * - Idempotent: clears `public/design-showcase/` before extraction so
 *   stale files from previous extractions don't linger.
 */

import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import consola from 'consola';
import AdmZip from 'adm-zip';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const TARGET_DIR = join(REPO_ROOT, 'public', 'design-showcase');

interface CliArgs {
  readonly zip: string | undefined;
}

function parseArgs(argv: readonly string[]): CliArgs {
  let zip: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--zip' && argv[i + 1] !== undefined) {
      zip = argv[i + 1];
      i++;
    }
  }
  return { zip };
}

function findDefaultZip(): string | undefined {
  const entries = readdirSync(REPO_ROOT);
  for (const entry of entries) {
    if (!entry.endsWith('.zip')) continue;
    if (!/^IT Tools/i.test(entry)) continue;
    return join(REPO_ROOT, entry);
  }
  return undefined;
}

function cleanTarget(): void {
  try {
    const stat = statSync(TARGET_DIR);
    if (stat.isDirectory()) rmSync(TARGET_DIR, { recursive: true, force: true });
  } catch {
    // Doesn't exist yet — nothing to clean.
  }
  mkdirSync(TARGET_DIR, { recursive: true });
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const zipPath = args.zip ?? findDefaultZip();

  if (zipPath === undefined) {
    consola.warn(
      '[design:extract] No `IT Tools*.zip` found near the repo root and no --zip passed; skipping extraction.',
    );
    process.exit(0);
  }

  try {
    statSync(zipPath);
  } catch {
    consola.warn(`[design:extract] Zip not found at ${zipPath}; skipping extraction.`);
    process.exit(0);
  }

  consola.info(`[design:extract] Extracting ${zipPath} → ${TARGET_DIR}`);
  cleanTarget();

  const archive = new AdmZip(zipPath);
  archive.extractAllTo(TARGET_DIR, /* overwrite */ true);

  const count = archive.getEntries().length;
  consola.success(
    `[design:extract] Extracted ${count} entr${count === 1 ? 'y' : 'ies'} to public/design-showcase/`,
  );
}

main();
