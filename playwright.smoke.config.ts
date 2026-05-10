import { defineConfig, devices } from '@playwright/test';

/**
 * SB-22 (#60) — Storybook smoke E2E config.
 *
 * Separate from `playwright.config.ts` (which targets the live app on
 * :5173) so the smoke test can boot Storybook on :6006 without
 * conflicting webServer entries. Runs as `pnpm test:smoke`.
 */
export default defineConfig({
  testDir: 'tests/visual',
  testMatch: '**/storybook-smoke.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:6006',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium-smoke', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm storybook --ci --no-open',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
