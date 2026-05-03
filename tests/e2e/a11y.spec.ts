import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result as AxeResult } from 'axe-core';

/**
 * Accessibility coverage. Runs the aXe-core audit on every locked theme to
 * catch contrast regressions per theme switch.
 *
 * Standard: WCAG 2.1 AA + best-practice. We do NOT exclude any rule by
 * default — fix the source instead. If a single rule needs an exception,
 * add it via `disableRules([...])` with a comment explaining why.
 */

const THEMES = ['clean', 'linear', 'vercel', 'paper', 'swiss', 'aurora', 'matrix'] as const;

test.describe('a11y — home page', () => {
  for (const theme of THEMES) {
    test(`has no detectable WCAG 2.1 AA violations under ${theme}`, async ({ page }) => {
      await page.goto('/');
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
