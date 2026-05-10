/**
 * SB-CC-3 (#68) — every tool story's docs description must contain a
 * relative Markdown link back to `.specification/<slug>.md`.
 *
 * The generator (#53 / SB-15) emits the link automatically; this check
 * catches retro-fits that forget. Walks `src/stories/<NN-category>/`
 * + co-located `src/tools/<NN>/<NNN>-<slug>/<slug>.stories.ts`.
 *
 * Skips files referenced by the coverage exemption list (#48 / SB-10).
 *
 * Exit codes:
 *   0 — all tool stories have the spec link
 *   1 — missing on at least one
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const TOOLS_ROOT = join(REPO_ROOT, 'src', 'tools');
const STORIES_ROOT = join(REPO_ROOT, 'src', 'stories');

const CATEGORY_RE = /^[0-9]{2}-[a-z0-9-]+$/;
const NUMBERED_DIR_RE = /^[0-9]{3}-([a-z0-9-]+)$/;
const SPEC_LINK_RE = /\.specification\/([a-z0-9-]+)\.md/;

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

interface ToolStory {
  readonly slug: string;
  readonly storyPath: string;
}

function findToolStories(): readonly ToolStory[] {
  const found: ToolStory[] = [];
  for (const category of listDirs(TOOLS_ROOT)) {
    if (!CATEGORY_RE.test(category)) continue;
    for (const toolDir of listDirs(join(TOOLS_ROOT, category))) {
      const match = NUMBERED_DIR_RE.exec(toolDir);
      const slug = match?.[1];
      if (slug === undefined) continue;
      const colocated = join(TOOLS_ROOT, category, toolDir, `${slug}.stories.ts`);
      const category_path = join(STORIES_ROOT, category, `${slug}.stories.ts`);
      if (existsSync(colocated)) {
        found.push({ slug, storyPath: colocated });
      } else if (existsSync(category_path)) {
        found.push({ slug, storyPath: category_path });
      }
      // Missing-story case is handled by SB-10 — not our concern here.
    }
  }
  return found;
}

function main(): void {
  const stories = findToolStories();
  const missing: ToolStory[] = [];
  for (const story of stories) {
    const source = readFileSync(story.storyPath, 'utf8');
    const match = SPEC_LINK_RE.exec(source);
    if (match?.[1] !== story.slug) {
      missing.push(story);
    }
  }

  for (const m of missing) {
    process.stderr.write(
      `[spec-links] MISSING spec link in ${m.storyPath}\n` +
        `  Expected text like: .specification/${m.slug}.md\n`,
    );
  }
  process.stdout.write(
    `[spec-links] ${stories.length - missing.length}/${stories.length} tool stor${stories.length === 1 ? 'y' : 'ies'} carry spec link\n`,
  );
  if (missing.length > 0) process.exit(1);
}

main();
