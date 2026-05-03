import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for E2E tests.
 *
 * - Runs against the Vite dev server on http://localhost:5173/developer-tools/
 *   (matches `vite.config.ts` `base`).
 * - Vitest unit tests live alongside source as `*.test.ts` (separate runner).
 * - This config picks up `tests/e2e/**\/*.spec.ts` only.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:5173/developer-tools/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173/developer-tools/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
