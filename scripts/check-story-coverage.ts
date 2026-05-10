/**
 * SB-10 (#48) — story coverage gate.
 *
 * Walks `src/tools/<NN-category>/<NNN-slug>/` and asserts that for every
 * tool slug, EITHER a co-located `<slug>.stories.ts` OR a category-located
 * `src/stories/<NN-category>/<slug>.stories.ts` exists. Honors an
 * exemption list at `scripts/check-story-coverage.exempt.ts`.
 *
 * Each story is also checked for the 4 minimum named exports
 * (`Default`, `Empty`, `Error`, `WithMaxInput`) per #69 (SB-CC-4) — the
 * exports are detected with a tolerant regex, not full AST parsing.
 *
 * Exit codes:
 *   0 — all tools have a passing story
 *   1 — missing or incomplete; details printed to stderr
 *
 * Flags:
 *   --badge   Write `docs/badges/story-coverage.svg` with the current ratio.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXEMPT_TOOLS } from './check-story-coverage.exempt';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const TOOLS_ROOT = join(REPO_ROOT, 'src', 'tools');
const STORIES_ROOT = join(REPO_ROOT, 'src', 'stories');
const REQUIRED_EXPORTS = ['Default', 'Empty', 'Error', 'WithMaxInput'] as const;

const CATEGORY_RE = /^[0-9]{2}-[a-z0-9-]+$/;
const NUMBERED_DIR_RE = /^[0-9]{3}-([a-z0-9-]+)$/;

interface ToolEntry {
  readonly category: string;
  readonly slug: string;
  readonly toolDir: string;
}

function listDirs(parent: string): string[] {
  if (!existsSync(parent)) return [];
  return readdirSync(parent).filter((entry) => {
    try {
      return statSync(join(parent, entry)).isDirectory();
    } catch {
      return false;
    }
  });
}

function collectTools(): ToolEntry[] {
  const tools: ToolEntry[] = [];
  for (const category of listDirs(TOOLS_ROOT)) {
    if (!CATEGORY_RE.test(category)) continue;
    for (const toolDir of listDirs(join(TOOLS_ROOT, category))) {
      const match = NUMBERED_DIR_RE.exec(toolDir);
      const slug = match?.[1];
      if (slug === undefined) continue;
      tools.push({
        category,
        slug,
        toolDir: join(TOOLS_ROOT, category, toolDir),
      });
    }
  }
  return tools;
}

function findStoryFile(entry: ToolEntry): string | undefined {
  const colocated = join(entry.toolDir, `${entry.slug}.stories.ts`);
  if (existsSync(colocated)) return colocated;
  const categoryStory = join(STORIES_ROOT, entry.category, `${entry.slug}.stories.ts`);
  if (existsSync(categoryStory)) return categoryStory;
  return undefined;
}

function missingMinimumExports(storyPath: string): readonly string[] {
  const source = readFileSync(storyPath, 'utf8');
  const missing: string[] = [];
  for (const name of REQUIRED_EXPORTS) {
    const pattern = new RegExp(`export\\s+const\\s+${name}\\b`);
    if (!pattern.test(source)) missing.push(name);
  }
  return missing;
}

interface Result {
  readonly tool: ToolEntry;
  readonly status: 'covered' | 'missing-story' | 'incomplete-exports';
  readonly storyPath?: string;
  readonly missingExports?: readonly string[];
}

function audit(): { results: readonly Result[]; exempted: readonly string[] } {
  const results: Result[] = [];
  const exemptedSlugs = new Set(EXEMPT_TOOLS.map((e) => e.slug));
  const exempted: string[] = [];

  for (const entry of collectTools()) {
    if (exemptedSlugs.has(entry.slug)) {
      exempted.push(entry.slug);
      continue;
    }
    const storyPath = findStoryFile(entry);
    if (storyPath === undefined) {
      results.push({ tool: entry, status: 'missing-story' });
      continue;
    }
    const missing = missingMinimumExports(storyPath);
    if (missing.length > 0) {
      results.push({
        tool: entry,
        status: 'incomplete-exports',
        storyPath,
        missingExports: missing,
      });
      continue;
    }
    results.push({ tool: entry, status: 'covered', storyPath });
  }

  return { results, exempted };
}

function svgBadge(covered: number, total: number): string {
  const ratio = total === 0 ? 0 : covered / total;
  const pct = Math.round(ratio * 100);
  const color = pct === 100 ? '#22c55e' : pct >= 80 ? '#84cc16' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const label = 'story coverage';
  const value = `${covered}/${total} (${pct}%)`;
  // Minimal flat-square badge — no external dependency, deterministic SVG.
  const labelWidth = 95;
  const valueWidth = 7 * value.length + 12;
  const totalWidth = labelWidth + valueWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <rect width="${labelWidth}" height="20" fill="#555"/>
  <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}

function writeBadge(covered: number, total: number): void {
  const dir = join(REPO_ROOT, 'docs', 'badges');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'story-coverage.svg'), svgBadge(covered, total));
}

function main(): void {
  const wantBadge = process.argv.includes('--badge');
  const { results, exempted } = audit();
  const covered = results.filter((r) => r.status === 'covered').length;
  const missing = results.filter((r) => r.status === 'missing-story');
  const incomplete = results.filter((r) => r.status === 'incomplete-exports');
  const total = results.length;

  for (const r of missing) {
    process.stderr.write(
      `[story-coverage] MISSING story for ${r.tool.category}/${r.tool.slug} — expected at:\n` +
        `  ${join('src', 'tools', r.tool.category, basename(r.tool.toolDir), `${r.tool.slug}.stories.ts`)}\n` +
        `  or src/stories/${r.tool.category}/${r.tool.slug}.stories.ts\n`,
    );
  }
  for (const r of incomplete) {
    process.stderr.write(
      `[story-coverage] INCOMPLETE ${r.storyPath} — missing exports: ${(r.missingExports ?? []).join(', ')}\n`,
    );
  }
  for (const slug of exempted) {
    process.stdout.write(`[story-coverage] exempt: ${slug}\n`);
  }
  process.stdout.write(
    `[story-coverage] ${covered}/${total} tools covered` +
      (exempted.length > 0 ? ` (+${exempted.length} exempt)` : '') +
      '\n',
  );

  if (wantBadge) {
    writeBadge(covered, total);
    process.stdout.write('[story-coverage] wrote docs/badges/story-coverage.svg\n');
  }

  if (missing.length > 0 || incomplete.length > 0) process.exit(1);
}

main();
