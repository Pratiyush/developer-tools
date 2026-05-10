import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Result as AxeResult } from 'axe-core';

/**
 * Day 5 — jwt-decoder.
 *
 * Verifies:
 *   1. Decoded header + payload appear as pretty JSON
 *   2. The "never verifies" warning is always present on a valid decode
 *   3. The unsigned-token (`alg: none`) warning fires
 *   4. Garbage input surfaces the invalid-token error
 *   5. Bearer prefix is tolerated
 *   6. Token persists in URL hash for sharing
 *   7. WCAG 2.1 AA via axe-core under every theme
 */

const TOOL_PATH = '/developer-tools/#/jwt-decoder';

// Canonical RFC 7519 §3.1 token (signature is irrelevant; we never verify).
const RFC_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9' +
  '.eyJpc3MiOiJqb2UiLCJleHAiOjEzMDA4MTkzODAsImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ' +
  '.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

const NONE_TOKEN = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOjF9.';

test.describe('jwt-decoder', () => {
  test('decodes a canonical JWT into header + payload', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/JWT to decode/i).fill(RFC_TOKEN);

    const headerArea = page.getByLabel(/^Header$/i);
    const payloadArea = page.getByLabel(/^Payload$/i);
    // Textareas hold content in `.value`, not textContent — use toHaveValue
    // with a regex so we don't pin every whitespace byte.
    await expect(headerArea).toHaveValue(/"alg":\s*"HS256"/, { timeout: 2000 });
    await expect(payloadArea).toHaveValue(/"iss":\s*"joe"/);
  });

  test('shows the "never verified" standing warning on a valid decode', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/JWT to decode/i).fill(RFC_TOKEN);
    await expect(page.getByText(/Decoding never verifies/i)).toBeVisible();
  });

  test('flags an unsigned (alg=none) token with an extra warning', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/JWT to decode/i).fill(NONE_TOKEN);
    await expect(page.getByText(/unsigned/i)).toBeVisible();
  });

  test('shows an error for garbage input', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/JWT to decode/i).fill('not.a.jwt');
    await expect(page.getByRole('alert')).toContainText(/JWT/i);
  });

  test('tolerates a leading Bearer prefix', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/JWT to decode/i).fill(`Bearer ${RFC_TOKEN}`);
    await expect(page.getByLabel(/^Header$/i)).toHaveValue(/"alg":\s*"HS256"/);
  });

  test('token persists in URL hash for sharing', async ({ page }) => {
    await page.goto(TOOL_PATH);
    await page.getByLabel(/JWT to decode/i).fill(RFC_TOKEN);
    await page.waitForFunction(() => window.location.hash.includes('jwt='));
    expect(page.url()).toContain('jwt=');
  });
});

const A11Y_THEMES = ['editorial', 'clean', 'vercel'] as const;

test.describe('a11y — jwt-decoder', () => {
  for (const theme of A11Y_THEMES) {
    test(`has no detectable WCAG 2.1 AA violations under ${theme}`, async ({ page }) => {
      await page.goto(TOOL_PATH);
      await page.evaluate((t) => {
        localStorage.setItem('dt.theme', t);
      }, theme);
      await page.reload();
      await page.waitForLoadState('networkidle');
      // Decode a token so the multi-pane output is rendered for axe to see.
      await page.getByLabel(/JWT to decode/i).fill(RFC_TOKEN);

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
