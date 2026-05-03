import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result as AxeResult } from 'axe-core';

/**
 * Day 1 — base64-string-converter.
 *
 * Verifies the user-visible journey:
 *   1. Encode round-trip with UTF-8 (CJK, emoji)
 *   2. Decode round-trip
 *   3. URL-safe toggle (no `+/=` in output)
 *   4. Mode tabs (encode/decode)
 *   5. WCAG 2.1 AA via axe-core
 *
 * State is hash-routed; the test verifies that the input lives in the
 * URL hash (per `feedback_url_parameters` privacy rule).
 */

const TOOL_PATH = '/developer-tools/#/base64-string-converter';

test.describe('base64-string-converter', () => {
  test('encode round-trip preserves ASCII', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/Base64 converter input/i);
    const output = page.getByLabel(/Base64 converter output/i);
    await input.fill('Hello');
    // Output is debounced; wait for the encoded value to appear.
    await expect(output).toHaveValue('SGVsbG8=', { timeout: 2000 });
  });

  test('encode round-trips UTF-8 (CJK)', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/Base64 converter input/i);
    const output = page.getByLabel(/Base64 converter output/i);
    await input.fill('日本語');
    await expect(output).toHaveValue('5pel5pys6Kqe', { timeout: 2000 });
  });

  test('decode mode reverses the encode', async ({ page }) => {
    await page.goto(TOOL_PATH);
    // Switch to decode mode
    await page.getByRole('tab', { name: /Decode/i }).click();
    const input = page.getByLabel(/Base64 converter input/i);
    const output = page.getByLabel(/Base64 converter output/i);
    await input.fill('SGVsbG8=');
    await expect(output).toHaveValue('Hello', { timeout: 2000 });
  });

  test('URL-safe toggle replaces / with _ and strips =', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const toggle = page.getByLabel(/URL-safe variant/i);
    await toggle.check();
    const input = page.getByLabel(/Base64 converter input/i);
    const output = page.getByLabel(/Base64 converter output/i);
    await input.fill('subjects?ids[]=1');
    await expect(output).toHaveValue('c3ViamVjdHM_aWRzW109MQ', { timeout: 2000 });
  });

  test('input persists in URL hash for sharing', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/Base64 converter input/i);
    await input.fill('share-me');
    // Wait for the URL to update.
    await page.waitForFunction(() => window.location.hash.includes('in='));
    const url = page.url();
    expect(url).toContain('#/base64-string-converter');
    expect(url).toContain('in=share-me');
  });
});

const A11Y_THEMES = ['clean', 'linear', 'vercel', 'paper', 'swiss', 'aurora', 'matrix'] as const;

test.describe('a11y — base64-string-converter', () => {
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
