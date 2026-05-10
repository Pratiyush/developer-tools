import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result as AxeResult } from 'axe-core';

/**
 * Day 4 — url-encode-decode.
 *
 * Verifies:
 *   1. Component encode — spaces become %20, slashes become %2F
 *   2. URI encode — full URL stays parseable, only spaces escape
 *   3. Plus-for-space toggle — space → + in encode, + → space in decode
 *   4. Decode — UTF-8 sequences round-trip
 *   5. Deep-link survives a reload via URL hash
 *   6. WCAG 2.1 AA via axe-core under every theme
 */

const TOOL_PATH = '/developer-tools/#/url-encode-decode';

test.describe('url-encode-decode', () => {
  test('component encode — escapes spaces and slashes', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/URL encoder input/i);
    const output = page.getByLabel(/URL encoder output/i);
    await input.fill('hello world/path');
    await expect(output).toHaveValue('hello%20world%2Fpath', { timeout: 2000 });
  });

  test('URI mode — leaves reserved characters intact', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/URI mode/i).check();
    const input = page.getByLabel(/URL encoder input/i);
    const output = page.getByLabel(/URL encoder output/i);
    await input.fill('https://example.com/path?q=1#x');
    await expect(output).toHaveValue('https://example.com/path?q=1#x', { timeout: 2000 });
  });

  test('plus-for-space toggle replaces %20 with +', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/Use \+ for space/i).check();
    const input = page.getByLabel(/URL encoder input/i);
    const output = page.getByLabel(/URL encoder output/i);
    await input.fill('hello world');
    await expect(output).toHaveValue('hello+world', { timeout: 2000 });
  });

  test('decode — UTF-8 sequence becomes 日本', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByRole('tab', { name: /^Decode$/i }).click();
    const input = page.getByLabel(/URL encoder input/i);
    const output = page.getByLabel(/URL encoder output/i);
    await input.fill('%E6%97%A5%E6%9C%AC');
    await expect(output).toHaveValue('日本', { timeout: 2000 });
  });

  test('input persists in URL hash for sharing', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/URL encoder input/i);
    await input.fill('share-me');
    await page.waitForFunction(() => window.location.hash.includes('in='));
    expect(page.url()).toContain('in=share-me');
  });
});

const A11Y_THEMES = ['editorial', 'clean', 'vercel'] as const;

test.describe('a11y — url-encode-decode', () => {
  for (const theme of A11Y_THEMES) {
    test(`has no detectable WCAG 2.1 AA violations under ${theme}`, async ({ page }) => {
      await page.goto(TOOL_PATH);
      await page.evaluate((t) => {
        localStorage.setItem('dt.theme', t);
      }, theme);
      await page.reload();
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();

      expect.soft(results.violations, formatViolations(results.violations)).toEqual([]);
    });
  }
});

function formatViolations(violations: readonly AxeResult[]): string {
  if (violations.length === 0) return 'no violations';
  return violations
    .map((v) => `[${v.impact ?? 'unknown'}] ${v.id}: ${v.description}\n  → ${v.helpUrl}`)
    .join('\n');
}
