import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/html-vite';

// Storybook 8 (HTML + Vite) configuration.
//
// Registry shape lives at `src/tools/index.ts` and exports
// `TOOLS: readonly ToolModule<never>[]`. The shape is defined in
// `src/lib/types.ts`. Tools are NOT factories — they expose
// `render(host, initial): { dispose }` and mount onto the host element.
// Story authors wrap this via the `mountTool` helper (added in SB-04 / #43).
//
// Known issue (folded into SB-03 / #42): preview.ts toolbar `theme` items now
// match the live app's 7 themes (clean / linear / vercel / paper / swiss /
// aurora / matrix). SB-16 (#54) folds the `[data-theme]` attribute into
// `[data-preset]` + `[data-density]` later.

// Static dirs guarded by existsSync — `public/design-showcase/` is gitignored
// (extracted from the IT Tools zip via `pnpm design:extract`); CI clones do
// not have it. Storybook 8.6 hard-fails when a `staticDirs` path is missing,
// so we conditionally include the path only when it actually exists.
const HERE = dirname(fileURLToPath(import.meta.url));
const DESIGN_SHOWCASE = resolve(HERE, '../public/design-showcase');
const staticDirs: string[] = existsSync(DESIGN_SHOWCASE) ? ['../public/design-showcase'] : [];

const config: StorybookConfig = {
  // SB-17 (#55): MDX docs pages live under `src/stories/_mdx/`. The
  // glob picks them up alongside CSF `*.stories.ts`.
  stories: ['../src/stories/**/*.stories.ts', '../src/stories/_mdx/*.mdx'],
  // SB-18 (#56): in-Storybook axe panel via `@storybook/addon-a11y`.
  // SB-17 (#55): MDX rendering via `@storybook/addon-docs`.
  // WCAG 2.1 AA rules enabled — see `.storybook/preview.ts` `parameters.a11y`.
  // No rules disabled (per existing `feedback_wcag_axe.md` memory).
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  staticDirs,
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  // Pages deploy sub-path (SB-21 / #59). Serves under
  // https://pratiyush.github.io/developer-tools/storybook/.
  // The `base` is only applied for production builds — dev runs at `/`.
  async viteFinal(viteConfig, { configType }) {
    if (configType === 'PRODUCTION') {
      viteConfig.base = '/developer-tools/storybook/';
    }
    return viteConfig;
  },
};

export default config;
