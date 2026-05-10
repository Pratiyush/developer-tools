#!/usr/bin/env tsx
/**
 * One-shot pruner for the 2026-05-07 theme cull. Removes every CSS rule
 * specific to mono / grid / linear / paper / swiss / aurora / matrix from
 * `src/style.css`, leaving editorial, clean, and vercel.
 *
 * Two passes:
 *   1. Strip standalone `[data-theme='X'] { ... }` blocks for removed
 *      themes. Each one is a single brace-balanced block at file scope.
 *   2. From comma-separated selector lists, remove any entry whose only
 *      attribute selector is a removed theme. If the entire list becomes
 *      empty after pruning, drop the whole rule.
 *
 * Idempotent: running twice is a no-op (the second pass finds nothing).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname_ = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(__dirname_, '../src/style.css');

const REMOVED = new Set(['mono', 'grid', 'linear', 'paper', 'swiss', 'aurora', 'matrix']);

function main(): void {
  const before = readFileSync(CSS_PATH, 'utf8');
  let src = before;
  src = stripThemeBlocks(src);
  src = pruneSelectorLists(src);
  if (src === before) {
    console.info('• No removed-theme references found.');
    return;
  }
  writeFileSync(CSS_PATH, src);
  console.info(`✓ Pruned ${REMOVED.size} themes; ${before.length - src.length} bytes removed.`);
}

/**
 * Remove standalone `[data-theme='X'] { ... }` blocks. The opening
 * selector is at column 0; the matching `}` is the first column-0 close
 * after it.
 */
function stripThemeBlocks(src: string): string {
  const lines = src.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const match = /^\[data-theme='([a-z]+)'\]\s*\{/.exec(line);
    if (match && REMOVED.has(match[1] ?? '')) {
      // Skip until matching close at column 0.
      i++;
      while (i < lines.length && lines[i] !== '}') i++;
      i++; // skip the closing '}'
      // Also eat one trailing blank line if present so we don't leave a
      // double newline behind.
      if (i < lines.length && (lines[i] ?? '').trim() === '') i++;
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

/**
 * Walk the CSS top to bottom. For each rule whose selector list contains
 * a comma, drop entries that name a removed theme; if the list ends up
 * empty, drop the entire rule (selector + body + trailing close brace).
 */
function pruneSelectorLists(src: string): string {
  // We split by `}` so each piece is `<selector-list> { <decls>` with the
  // body terminator missing. Rebuild later. This is brittle but fine for
  // our hand-authored CSS — no nested `{}` outside @media (which we keep
  // as-is because @media bodies don't open with `[data-theme=`).
  const out: string[] = [];
  let buf = '';
  let depth = 0;
  for (const ch of src) {
    if (ch === '{') {
      depth++;
      buf += ch;
    } else if (ch === '}') {
      depth--;
      buf += ch;
      if (depth === 0) {
        out.push(buf);
        buf = '';
      }
    } else {
      buf += ch;
    }
  }
  if (buf) out.push(buf);

  return out
    .map((chunk) => prunChunk(chunk))
    .filter((chunk): chunk is string => chunk !== null)
    .join('');
}

function prunChunk(chunk: string): string | null {
  const openIdx = chunk.indexOf('{');
  if (openIdx === -1) return chunk;
  const selPart = chunk.slice(0, openIdx);
  const rest = chunk.slice(openIdx);

  // Skip @media wrappers and at-rules (the inner @media bodies are
  // chunked separately above).
  if (/^\s*@/.test(selPart)) return chunk;

  if (!selPart.includes(',')) {
    // Single selector — keep unless it's a removed theme.
    const m = /\[data-theme='([a-z]+)'\]/.exec(selPart);
    if (m && REMOVED.has(m[1] ?? '')) return null;
    return chunk;
  }

  const selectors = selPart
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const kept = selectors.filter((s) => {
    const m = /\[data-theme='([a-z]+)'\]/.exec(s);
    if (!m) return true;
    return !REMOVED.has(m[1] ?? '');
  });
  if (kept.length === 0) return null;
  if (kept.length === selectors.length) return chunk;
  // Preserve the original indentation of the first kept selector.
  const indent = (/^\s*/.exec(selPart) ?? [''])[0];
  return indent + kept.join(',\n' + indent) + ' ' + rest.trimStart();
}

main();
