#!/usr/bin/env tsx
/**
 * One-shot retrofit: walk every `src/tools/<cat>/<NNN-slug>/render.ts` and
 * inject `num: N` into each `panel({ ... })` call in document order.
 *
 * - Skips files that already have `num:` (idempotent).
 * - Numbers panels 1..N in the order they appear in the source.
 * - Inserts `num: N,` as the first property inside the panel object so it
 *   stays adjacent to the opening brace and doesn't fight other formatting.
 */

import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = dirname(__filename_);
const ROOT = resolve(__dirname_, '..');
const TOOLS_DIR = resolve(ROOT, 'src/tools');

function walk(dir: string, files: string[]): string[] {
  for (const entry of readdirSync(dir)) {
    const p = resolve(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (entry === 'render.ts') files.push(p);
  }
  return files;
}

let edited = 0;
let skipped = 0;
for (const file of walk(TOOLS_DIR, [])) {
  const src = readFileSync(file, 'utf8');
  if (/\bnum:/.test(src)) {
    skipped++;
    continue;
  }
  // Walk through the source, find each `panel({` opening, and inject
  // `num: N,` right after the brace. Track the running counter.
  let counter = 0;
  let out = '';
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf('panel({', i);
    if (idx === -1) {
      out += src.slice(i);
      break;
    }
    counter++;
    const after = idx + 'panel({'.length;
    // Detect indentation of the next non-whitespace line so we can match
    // existing formatting.
    let j = after;
    while (j < src.length && (src[j] === ' ' || src[j] === '\n')) j++;
    // Look for the indentation of the current key (whitespace from the last newline).
    const lineStart = src.lastIndexOf('\n', j) + 1;
    const indent = src.slice(lineStart, j);
    const isMultiLine = src.slice(after, j).includes('\n');
    out += src.slice(i, after);
    if (isMultiLine) {
      out += `\n${indent}num: ${counter},`;
    } else {
      out += ` num: ${counter},`;
    }
    i = after;
  }
  if (counter > 0 && out !== src) {
    writeFileSync(file, out);
    edited++;
    console.log(`✓ ${file.replace(`${ROOT}/`, '')} (${counter} panel${counter === 1 ? '' : 's'})`);
  }
}
console.log(`\nDone — ${edited} files retrofitted, ${skipped} skipped (already had num:).`);
