/**
 * SB-23 (#61) — orphan snapshot pruning.
 *
 * Walks `tests/visual/__snapshots__/` and removes (or reports, with
 * `--check`) any PNG whose story ID is no longer present in the
 * Storybook stories index. Story IDs are extracted from filenames
 * following the SB-05 convention: `<story-id>-<theme>-<preset>-<viewport>.png`.
 *
 * The current state has no visual regression snapshots yet (SB-05 / #44
 * pending). Until snapshots exist, this script is a no-op + early exit 0.
 *
 * Modes:
 *   pnpm prune:snapshots             delete orphans, print count
 *   pnpm prune:snapshots --check     no delete; exit 1 on orphans (CI)
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const SNAPSHOTS_DIR = join(REPO_ROOT, 'tests', 'visual', '__snapshots__');
const INDEX_FILE = join(REPO_ROOT, 'storybook-static', 'index.json');

interface IndexEntry {
  readonly id: string;
}

interface StoriesIndex {
  readonly entries: Record<string, IndexEntry>;
}

function loadStoryIds(): Set<string> | undefined {
  if (!existsSync(INDEX_FILE)) return undefined;
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf8')) as StoriesIndex;
  return new Set(Object.keys(index.entries));
}

function storyIdFromFilename(filename: string): string | undefined {
  // `<story-id>-<theme>-<preset>-<viewport>.png` — strip the last 3 dash
  // segments + extension. We use the last 4 dashes to be conservative:
  // story IDs can contain dashes themselves.
  const noExt = filename.replace(/\.png$/, '');
  const parts = noExt.split('-');
  if (parts.length < 4) return undefined;
  return parts.slice(0, parts.length - 3).join('-');
}

function walkPngs(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      found.push(...walkPngs(full));
    } else if (entry.endsWith('.png')) {
      found.push(full);
    }
  }
  return found;
}

function main(): void {
  const checkMode = process.argv.includes('--check');

  if (!existsSync(SNAPSHOTS_DIR)) {
    process.stdout.write(
      '[prune-orphans] no tests/visual/__snapshots__ yet — visual regression not built. Nothing to prune.\n',
    );
    // Ensure the dir exists for downstream tooling (creates an empty one).
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    return;
  }

  const knownIds = loadStoryIds();
  if (knownIds === undefined) {
    process.stderr.write(
      '[prune-orphans] storybook-static/index.json not found — run `pnpm build-storybook` first.\n',
    );
    process.exit(1);
  }

  const pngs = walkPngs(SNAPSHOTS_DIR);
  const orphans: string[] = [];
  for (const png of pngs) {
    const filename = png.slice(png.lastIndexOf('/') + 1);
    const storyId = storyIdFromFilename(filename);
    if (storyId === undefined || !knownIds.has(storyId)) {
      orphans.push(png);
    }
  }

  if (orphans.length === 0) {
    process.stdout.write(
      `[prune-orphans] ${pngs.length} PNG${pngs.length === 1 ? '' : 's'} — no orphans.\n`,
    );
    return;
  }

  if (checkMode) {
    for (const o of orphans) {
      process.stderr.write(`[prune-orphans] ORPHAN ${o}\n`);
    }
    process.stderr.write(
      `[prune-orphans] ${orphans.length} orphan${orphans.length === 1 ? '' : 's'} found. Run \`pnpm prune:snapshots\` to clean.\n`,
    );
    process.exit(1);
  }

  for (const orphan of orphans) {
    unlinkSync(orphan);
    process.stdout.write(`[prune-orphans] deleted ${orphan}\n`);
  }
  process.stdout.write(
    `[prune-orphans] deleted ${orphans.length} orphan${orphans.length === 1 ? '' : 's'} (of ${pngs.length} PNGs).\n`,
  );
}

main();
