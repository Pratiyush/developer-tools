import { expect, test } from '@playwright/test';

/**
 * E2E coverage for the runtime theme switcher.
 *
 * Locked design (2026-05-07): default theme = `editorial`. Two alternates
 * (`clean`, `vercel`). The original ten-theme set was pruned in a
 * follow-up to focus the surface area — see `marketing/pivots/`.
 */

const THEMES = ['editorial', 'clean', 'vercel'] as const;

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

  test('defaults to the Editorial theme on first visit', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('dt.theme'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'editorial');
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
    // Aurora was pruned with the rest of the original 10-theme set;
    // Vercel is the dark-leaning alternate now.
    await page.locator('.dt-theme-switcher').click();
    await page.locator('.dt-dropdown__item:has-text("Vercel")').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vercel');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vercel');

    const stored = await page.evaluate(() => localStorage.getItem('dt.theme'));
    expect(stored).toBe('vercel');
  });

  test('renders the tool grid once tools are registered', async ({ page }) => {
    // The home page renders one `.dt-home__grid` per category section.
    // Just assert at least one is visible and contains tool cards.
    await expect(page.locator('.dt-home__grid').first()).toBeVisible();
    await expect(page.locator('.dt-home__grid .dt-card').first()).toBeVisible();
  });
});

function labelFor(theme: (typeof THEMES)[number]): string {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}
