/**
 * Scaffold: `pnpm new-tool <slug> --category <NN-name> [--name "..."] [--description "..."]`
 * Slug is kebab-case; category matches `NN-name` (e.g. `01-encoding`).
 * Next free 3-digit `NNN` = max existing across categories + 1.
 */
import {
  readdirSync,
  statSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface CliArgs {
  slug: string;
  category: string;
  name: string;
  description: string;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const TEMPLATE_DIR = join(REPO_ROOT, 'src', 'tools', '_template');
const TOOLS_ROOT = join(REPO_ROOT, 'src', 'tools');
const REGISTRY_FILE = join(TOOLS_ROOT, 'index.ts');

const SLUG_RE = /^[a-z0-9][a-z0-9-]+[a-z0-9]$/;
const CATEGORY_RE = /^[0-9]{2}-[a-z0-9-]+$/;
const NUMBERED_DIR_RE = /^([0-9]{3})-([a-z0-9-]+)$/;

function parseArgs(argv: readonly string[]): CliArgs {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        throw new Error(`Flag --${key} requires a value`);
      }
      flags.set(key, next);
      i++;
    } else {
      positional.push(a);
    }
  }
  const slug = positional[0];
  const category = flags.get('category');
  if (!slug) throw new Error('Missing positional <slug>');
  if (!category) throw new Error('Missing required --category <NN-name>');
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug: ${slug} (kebab-case required)`);
  if (!CATEGORY_RE.test(category))
    throw new Error(`Invalid category: ${category} (expected NN-name)`);
  return {
    slug,
    category,
    name: flags.get('name') ?? slug,
    description: flags.get('description') ?? `${slug} tool`,
  };
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

function nextNumber(): number {
  let max = 0;
  for (const cat of listDirs(TOOLS_ROOT)) {
    if (cat === '_template') continue;
    for (const tool of listDirs(join(TOOLS_ROOT, cat))) {
      const m = NUMBERED_DIR_RE.exec(tool);
      if (m?.[1]) {
        const n = Number.parseInt(m[1], 10);
        if (Number.isFinite(n) && n > max) max = n;
      }
    }
  }
  return max + 1;
}

function copyTree(src: string, dst: string): void {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dst, entry);
    if (statSync(s).isDirectory()) {
      copyTree(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

function replaceTokens(file: string, args: CliArgs, num: number): void {
  const original = readFileSync(file, 'utf8');
  const replaced = original
    .replace(/__SLUG__/g, args.slug)
    .replace(/__CATEGORY__/g, args.category)
    .replace(/__NAME__/g, args.name)
    .replace(/__DESCRIPTION__/g, args.description)
    .replace(/number: 0,/g, `number: ${num},`);
  if (replaced !== original) writeFileSync(file, replaced);
}

function walkAndReplace(dir: string, args: CliArgs, num: number): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walkAndReplace(p, args, num);
    else replaceTokens(p, args, num);
  }
}

/**
 * Rename any file whose name contains `__SLUG__` to use the actual slug.
 * Walks the tree after content replacement so e.g. `__SLUG__.stories.ts`
 * becomes `<slug>.stories.ts` in the generated tool directory.
 */
function walkAndRenameFiles(dir: string, args: CliArgs): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      walkAndRenameFiles(p, args);
      continue;
    }
    if (entry.includes('__SLUG__')) {
      const renamed = entry.replace(/__SLUG__/g, args.slug);
      renameSync(p, join(dir, renamed));
    }
  }
}

function ensureRegistry(): void {
  if (existsSync(REGISTRY_FILE)) return;
  writeFileSync(
    REGISTRY_FILE,
    [
      "import type { ToolModule } from '../lib/types';",
      '',
      '// Auto-managed by `pnpm new-tool`. Add new tool imports above the closing `];`.',
      'export const TOOLS: readonly ToolModule<never>[] = [];',
      '',
    ].join('\n'),
  );
}

function updateRegistry(args: CliArgs, num: number, dirName: string): void {
  ensureRegistry();
  const padded = String(num).padStart(3, '0');
  const importAlias = `tool_${padded}_${args.slug.replace(/-/g, '_')}`;
  const importLine = `import { tool as ${importAlias} } from './${args.category}/${dirName}';`;
  const src = readFileSync(REGISTRY_FILE, 'utf8');
  if (src.includes(importLine)) return;

  const lines = src.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.startsWith('import ')) lastImportIdx = i;
  }
  lines.splice(lastImportIdx + 1, 0, importLine);

  const arrayRe = /export const TOOLS: readonly ToolModule<never>\[\] = \[(.*?)\];/s;
  const joined = lines.join('\n');
  const m = arrayRe.exec(joined);
  if (m?.[1] === undefined) {
    throw new Error('Could not locate TOOLS array in registry');
  }
  const inner = m[1].trim();
  const entries = inner ? inner.split(/,\s*/).filter(Boolean) : [];
  entries.push(importAlias);
  // Sort by leading number embedded in alias (`tool_NNN_...`).
  entries.sort((a, b) => {
    const na = Number.parseInt(a.slice(5, 8), 10);
    const nb = Number.parseInt(b.slice(5, 8), 10);
    return na - nb;
  });
  const rebuilt = joined.replace(
    arrayRe,
    `export const TOOLS: readonly ToolModule<never>[] = [\n  ${entries.join(',\n  ')},\n];`,
  );
  writeFileSync(REGISTRY_FILE, rebuilt);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const num = nextNumber();
  const padded = String(num).padStart(3, '0');
  const dirName = `${padded}-${args.slug}`;
  const target = join(TOOLS_ROOT, args.category, dirName);
  if (existsSync(target)) {
    throw new Error(`Target already exists: ${target}`);
  }
  copyTree(TEMPLATE_DIR, target);
  walkAndReplace(target, args, num);
  walkAndRenameFiles(target, args);
  updateRegistry(args, num, dirName);

  process.stdout.write(
    [
      '',
      `Created tool ${padded} ${args.slug}`,
      `  path:     src/tools/${args.category}/${dirName}/`,
      `  category: ${args.category}`,
      `  name:     ${args.name}`,
      '',
      'Next steps:',
      `  1. Edit ${args.category}/${dirName}/logic.ts with the real algorithm.`,
      `  2. Add tests to ${args.category}/${dirName}/logic.test.ts.`,
      `  3. Wire UI in ${args.category}/${dirName}/render.ts.`,
      '',
    ].join('\n'),
  );
}

main();
