import { expect, test } from '@playwright/test';

/**
 * E2E coverage for the runtime theme switcher.
 *
 * Locked design (2026-04-29): default theme = `clean`. Six alternates.
 * Reference screenshots live at marketing/research/design-samples/.
 */

const THEMES = ['clean', 'linear', 'vercel', 'paper', 'swiss', 'aurora', 'matrix'] as const;

test.describe('theme switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders the home shell with sidebar, topbar, and hero', async ({ page }) => {
    await expect(page.locator('.dt-sidebar')).toBeVisible();
    await expect(page.locator('.dt-topbar')).toBeVisible();
    await expect(page.locator('.dt-home__hero h1')).toContainText('100 dev tools');
  });

  test('defaults to the Clean theme on first visit', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('dt.theme'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'clean');
  });

  test('cycles through every locked theme via the dropdown', async ({ page }) => {
    for (const theme of THEMES) {
      await page.locator('.dt-theme-switcher').click();
      await page
        .locator(`.dt-dropdown__item:has-text("${labelFor(theme)}")`)
        .first()
        .click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    }
  });

  test('persists the chosen theme across reload', async ({ page }) => {
    await page.locator('.dt-theme-switcher').click();
    await page.locator('.dt-dropdown__item:has-text("Aurora")').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'aurora');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'aurora');

    const stored = await page.evaluate(() => localStorage.getItem('dt.theme'));
    expect(stored).toBe('aurora');
  });

  test('renders a usable empty-state when the registry has no tools', async ({ page }) => {
    await expect(page.locator('.dt-home__empty')).toContainText('No tools yet');
  });
});

function labelFor(theme: (typeof THEMES)[number]): string {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}
