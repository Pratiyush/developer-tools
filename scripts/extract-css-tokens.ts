/**
 * SB-20 (#58) — programmatic CSS-token extraction.
 *
 * Parses a CSS file (default: `src/stories/_styles/foundations.css`) and
 * returns a map of design tokens keyed by category. Used by the Tokens
 * MDX page (SB-17 / #55) and the snapshot guard so accidental token
 * deletions fail CI.
 *
 * No external dep — we lean on a small regex parser tuned for the
 * `--dt-*` token convention. Postcss would be overkill for a flat,
 * deterministic stylesheet.
 *
 * Output:
 *   - Default: prints JSON to stdout.
 *   - `--snapshot`: writes `scripts/__snapshots__/tokens.json`. Used as
 *     the canonical record; CI re-runs without `--snapshot` and diffs
 *     against the committed file (separate CI step or local check).
 *   - `--check`: prints JSON to stdout AND exits 1 if it differs from
 *     the committed snapshot — the CI mode.
 *
 * Flags:
 *   --source <path>   override the input CSS file
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const DEFAULT_SOURCE = join(REPO_ROOT, 'src', 'stories', '_styles', 'foundations.css');
const SNAPSHOT_FILE = join(REPO_ROOT, 'scripts', '__snapshots__', 'tokens.json');

export interface TokenEntry {
  readonly name: string;
  readonly value: string;
  readonly source: string;
}

export type TokenMap = Readonly<Record<string, readonly TokenEntry[]>>;

const DECL_RE = /(--dt-[a-z0-9-]+)\s*:\s*([^;]+);/g;

function categoryFor(name: string): string {
  // `--dt-color-success` → `color`. `--dt-success` → `color` (semantic).
  // `--dt-shadow-2` → `shadow`. `--dt-radius-sm` → `radius`. etc.
  const stripped = name.replace(/^--dt-/, '');
  const first = stripped.split('-')[0] ?? 'misc';
  switch (first) {
    case 'success':
    case 'danger':
    case 'warning':
    case 'info':
    case 'neutral':
      return 'color';
    case 'shadow':
      return 'shadow';
    case 'radius':
      return 'radius';
    case 'gap':
    case 'space':
      return 'spacing';
    default:
      return first;
  }
}

function parseTokens(cssText: string, selector: string): TokenEntry[] {
  const entries: TokenEntry[] = [];
  // Re-init RegExp each scan to avoid lastIndex state.
  const declRe = new RegExp(DECL_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(cssText)) !== null) {
    const name = m[1];
    const value = m[2];
    if (name === undefined || value === undefined) continue;
    entries.push({ name, value: value.trim(), source: selector });
  }
  return entries;
}

export function extractTokens(sourcePath: string): TokenMap {
  const css = readFileSync(sourcePath, 'utf8');

  // For each `<selector> { … }` block, find declarations. A flat sweep
  // wouldn't know which selector a token belongs to, so we walk blocks.
  const grouped: Record<string, TokenEntry[]> = {};

  // Strip multi-line comments first so they don't bleed into selectors.
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blockRe = /([^{}]+)\{([^{}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(cleaned)) !== null) {
    // Selectors can be multi-line; collapse whitespace.
    const selector = (match[1] ?? '').replace(/\s+/g, ' ').trim();
    const body = match[2] ?? '';
    if (selector.length === 0) continue;
    // Only collect from token-defining selectors (root + :where host).
    if (!selector.includes(':where') && !selector.startsWith(':root')) continue;
    for (const entry of parseTokens(body, selector)) {
      const cat = categoryFor(entry.name);
      const bucket = grouped[cat] ?? [];
      bucket.push(entry);
      grouped[cat] = bucket;
    }
  }

  // Sort within each category for deterministic output.
  for (const k of Object.keys(grouped)) {
    grouped[k] = grouped[k]?.slice().sort((a, b) => a.name.localeCompare(b.name)) ?? [];
  }
  return grouped;
}

function readSnapshot(): string | undefined {
  if (!existsSync(SNAPSHOT_FILE)) return undefined;
  return readFileSync(SNAPSHOT_FILE, 'utf8');
}

function writeSnapshot(json: string): void {
  mkdirSync(dirname(SNAPSHOT_FILE), { recursive: true });
  writeFileSync(SNAPSHOT_FILE, json);
}

function getArg(argv: readonly string[], key: string): string | undefined {
  const idx = argv.indexOf(`--${key}`);
  if (idx === -1 || idx + 1 >= argv.length) return undefined;
  return argv[idx + 1];
}

function main(): void {
  const argv = process.argv.slice(2);
  const source = getArg(argv, 'source') ?? DEFAULT_SOURCE;
  if (!existsSync(source)) {
    process.stderr.write(`[tokens] source CSS not found: ${source}\n`);
    process.exit(1);
  }
  const map = extractTokens(source);
  const json = `${JSON.stringify(map, null, 2)}\n`;

  if (argv.includes('--snapshot')) {
    writeSnapshot(json);
    const count = Object.values(map).reduce((acc, list) => acc + list.length, 0);
    process.stdout.write(
      `[tokens] wrote snapshot with ${count} token${count === 1 ? '' : 's'} → ${SNAPSHOT_FILE}\n`,
    );
    return;
  }

  if (argv.includes('--check')) {
    const committed = readSnapshot();
    if (committed === undefined) {
      process.stderr.write(
        `[tokens] no committed snapshot at ${SNAPSHOT_FILE} — run --snapshot first\n`,
      );
      process.exit(1);
    }
    if (committed !== json) {
      process.stderr.write(
        '[tokens] DRIFT — extracted tokens differ from committed snapshot.\n' +
          '          Run `pnpm tokens:snapshot` to refresh after intentional changes.\n',
      );
      process.exit(1);
    }
    process.stdout.write('[tokens] snapshot in sync\n');
    return;
  }

  process.stdout.write(json);
}

main();
