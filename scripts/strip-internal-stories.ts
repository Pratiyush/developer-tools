/**
 * SB-11 (#49) — strip stories tagged `internal` from the built
 * `storybook-static/` output.
 *
 * Storybook 8.6 doesn't expose a build-time tag filter, so we run this
 * as a post-build pass. It rewrites `storybook-static/index.json`,
 * removing any entry whose `tags` array includes `internal`. The
 * iframe chunks remain in the bundle (minor weight) but they become
 * unaddressable from the sidebar, so the public Storybook sees a
 * clean tree.
 *
 * Use via `pnpm build-storybook:public`, which chains
 *   storybook build && tsx scripts/strip-internal-stories.ts
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const INDEX_FILE = join(REPO_ROOT, 'storybook-static', 'index.json');

interface IndexEntry {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly type?: string;
  readonly tags?: readonly string[];
}

interface StoriesIndex {
  readonly v: number;
  readonly entries: Record<string, IndexEntry>;
}

function main(): void {
  if (!existsSync(INDEX_FILE)) {
    process.stderr.write(`[strip-internal] ${INDEX_FILE} not found — did the build run?\n`);
    process.exit(1);
  }

  const raw = readFileSync(INDEX_FILE, 'utf8');
  const index = JSON.parse(raw) as StoriesIndex;
  const beforeCount = Object.keys(index.entries).length;

  const filtered: Record<string, IndexEntry> = {};
  let stripped = 0;
  for (const [id, entry] of Object.entries(index.entries)) {
    if (entry.tags?.includes('internal') === true) {
      stripped++;
      continue;
    }
    filtered[id] = entry;
  }

  if (stripped === 0) {
    process.stdout.write(`[strip-internal] no internal stories found in ${beforeCount} entries\n`);
    return;
  }

  const next: StoriesIndex = { ...index, entries: filtered };
  writeFileSync(INDEX_FILE, `${JSON.stringify(next, null, 2)}\n`);
  process.stdout.write(
    `[strip-internal] removed ${stripped} internal stor${stripped === 1 ? 'y' : 'ies'} ` +
      `from ${beforeCount} entries → ${Object.keys(filtered).length} public\n`,
  );
}

main();
