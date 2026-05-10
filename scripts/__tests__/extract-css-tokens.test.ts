import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractTokens } from '../extract-css-tokens';

function writeCss(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'tokens-test-'));
  const file = join(dir, 'foundations.css');
  writeFileSync(file, content);
  return file;
}

describe('extractTokens', () => {
  it('parses --dt-* tokens into category buckets', () => {
    const file = writeCss(`
      :where(.dt-foundation-host) {
        --dt-success: #22c55e;
        --dt-danger: #ef4444;
        --dt-radius: 8px;
        --dt-gap-md: 16px;
        --dt-shadow-2: 0 4px 12px rgba(0,0,0,0.08);
      }
    `);
    const tokens = extractTokens(file);
    expect(tokens.color?.map((t) => t.name)).toEqual(['--dt-danger', '--dt-success']);
    expect(tokens.radius?.map((t) => t.name)).toEqual(['--dt-radius']);
    expect(tokens.spacing?.map((t) => t.name)).toEqual(['--dt-gap-md']);
    expect(tokens.shadow?.map((t) => t.name)).toEqual(['--dt-shadow-2']);
  });

  it('ignores comments', () => {
    const file = writeCss(`
      /* This block has --dt-fake: red; that must NOT be extracted */
      :where(.dt-foundation-host) {
        --dt-real: blue;
      }
    `);
    const tokens = extractTokens(file);
    const all = Object.values(tokens).flat();
    expect(all.map((t) => t.name)).toEqual(['--dt-real']);
  });

  it('attaches a clean selector to each token (no comment bleed)', () => {
    const file = writeCss(`
      /* Lots of words including --dt-comment-only that should be ignored. */
      :where(.dt-foundation-host) {
        --dt-shadow-1: 0 1px 0 #000;
      }
    `);
    const tokens = extractTokens(file);
    expect(tokens.shadow?.[0]?.source).toBe(':where(.dt-foundation-host)');
  });

  it('returns deterministic order within a category', () => {
    const file = writeCss(`
      :where(.dt-foundation-host) {
        --dt-success: a;
        --dt-danger: b;
        --dt-warning: c;
      }
    `);
    const tokens = extractTokens(file);
    expect(tokens.color?.map((t) => t.name)).toEqual([
      '--dt-danger',
      '--dt-success',
      '--dt-warning',
    ]);
  });

  it('returns an empty map when no tokens match', () => {
    const file = writeCss('.foo { color: red; }');
    const tokens = extractTokens(file);
    expect(tokens).toEqual({});
  });
});
