import { expect, test } from '@playwright/test';

/**
 * SB-22 (#60) — Storybook smoke E2E.
 *
 * Boots Storybook (via webServer in `playwright.smoke.config.ts`),
 * picks 3 random stories from the stories index, navigates to each one
 * inside the preview iframe, and asserts no `console.error` /
 * `console.warn` fired during navigation or after.
 *
 * Performance budget: cold-start < 5 s. Soft budget for v0.x — logs a
 * warning, does NOT fail the build (consola via stdout for visibility).
 */

interface StoryEntry {
  readonly id: string;
  readonly type?: string;
}

interface StoriesIndex {
  readonly entries: Record<string, StoryEntry>;
}

const COLD_START_BUDGET_MS = 5_000;

/**
 * Known-benign warnings emitted by Storybook itself (not by stories).
 * Anything that's specifically the test runtime / framework chatter goes
 * here so we only react to warnings that came from our own code.
 */
const BENIGN_WARNING_PATTERNS: readonly RegExp[] = [/in-browser Babel transformer/i, /sourcemap/i];

function isBenignWarning(text: string): boolean {
  return BENIGN_WARNING_PATTERNS.some((p) => p.test(text));
}

test.describe('Storybook smoke', () => {
  test('boots cleanly + 3 random stories render with no console errors', async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') errors.push(text);
      else if (type === 'warning' && !isBenignWarning(text)) warnings.push(text);
    });
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    const startedAt = Date.now();
    await page.goto('/');
    const coldStartMs = Date.now() - startedAt;

    const indexResponse = await page.request.get(
      `${baseURL ?? 'http://127.0.0.1:6006'}/index.json`,
    );
    expect(indexResponse.ok(), 'Storybook /index.json must be reachable').toBe(true);
    const index = (await indexResponse.json()) as StoriesIndex;
    const stories = Object.values(index.entries).filter(
      (e) => e.type === 'story' || e.type === undefined,
    );
    expect(stories.length, 'Storybook should expose at least 3 stories').toBeGreaterThanOrEqual(3);

    // Deterministic sample: first, middle, last. Avoids flaky randomness on CI.
    const picks = [
      stories[0],
      stories[Math.floor(stories.length / 2)],
      stories[stories.length - 1],
    ];

    for (const story of picks) {
      if (story === undefined) continue;
      await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);
      // Give the story render hook ~500ms to settle (covers async tool mounts).
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    if (coldStartMs > COLD_START_BUDGET_MS) {
      // Soft budget — warn but do not fail (SB-22 spec: soft for v0.x).

      console.warn(
        `[smoke] cold-start exceeded ${COLD_START_BUDGET_MS}ms budget: ${coldStartMs}ms`,
      );
    } else {
      console.info(`[smoke] cold-start ${coldStartMs}ms (budget ${COLD_START_BUDGET_MS}ms)`);
    }

    expect(errors, `console.error fired during smoke: ${errors.join(' | ')}`).toEqual([]);
    expect(warnings, `console.warn fired during smoke: ${warnings.join(' | ')}`).toEqual([]);
  });
});
