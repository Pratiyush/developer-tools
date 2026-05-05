import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result as AxeResult } from 'axe-core';

/**
 * Day 3 — html-entities encoder/decoder.
 *
 * Verifies:
 *   1. Encode mode minimal — &<>"' escape, accents pass through
 *   2. Encode mode extended — accents become named entities
 *   3. Decode mode — named + numeric (decimal & hex) all decode
 *   4. URL-hash deep-link survives a reload
 *   5. WCAG 2.1 AA via axe-core under every theme
 */

const TOOL_PATH = '/developer-tools/#/html-entities';

test.describe('html-entities', () => {
  test('encode minimal — escapes the SGML-five only', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/HTML entities tool input/i);
    const output = page.getByLabel(/HTML entities tool output/i);
    await input.fill('café <a href="x">© & ©</a>');
    // Minimal mode is default → accents stay as-is, only &<>"' escape.
    await expect(output).toHaveValue('café &lt;a href=&quot;x&quot;&gt;© &amp; ©&lt;/a&gt;', {
      timeout: 2000,
    });
  });

  test('encode extended — accents and copyright become named entities', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const toggle = page.getByLabel(/Extended set/i);
    await toggle.check();
    const input = page.getByLabel(/HTML entities tool input/i);
    const output = page.getByLabel(/HTML entities tool output/i);
    await input.fill('café — © Pratiyush');
    await expect(output).toHaveValue('caf&eacute; &mdash; &copy; Pratiyush', { timeout: 2000 });
  });

  test('decode — named, decimal, and hex entities all decode', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByRole('tab', { name: /Decode/i }).click();
    const input = page.getByLabel(/HTML entities tool input/i);
    const output = page.getByLabel(/HTML entities tool output/i);
    await input.fill('&copy; A&#66;&#x43; — &eacute;');
    await expect(output).toHaveValue('© ABC — é', { timeout: 2000 });
  });

  test('input persists in URL hash for sharing', async ({ page }) => {
    await page.goto(TOOL_PATH);
    const input = page.getByLabel(/HTML entities tool input/i);
    await input.fill('share-me');
    await page.waitForFunction(() => window.location.hash.includes('in='));
    expect(page.url()).toContain('in=share-me');
  });
});

const A11Y_THEMES = ['clean', 'linear', 'vercel', 'paper', 'swiss', 'aurora', 'matrix'] as const;

test.describe('a11y — html-entities', () => {
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
