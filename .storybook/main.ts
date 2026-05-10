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
// Known issue (fixed in SB-16 / #54): preview.ts toolbar `theme` items don't
// match the live app's 7 themes. The live app reads `[data-theme]`; the
// design system reads `[data-preset]` + `[data-density]`. Until SB-16 lands,
// switching the toolbar produces minimal visual change.

// Static dirs guarded by existsSync — `public/design-showcase/` is gitignored
// (extracted from the IT Tools zip via `pnpm design:extract`); CI clones do
// not have it. Storybook 8.6 hard-fails when a `staticDirs` path is missing,
// so we conditionally include the path only when it actually exists.
const HERE = dirname(fileURLToPath(import.meta.url));
const DESIGN_SHOWCASE = resolve(HERE, '../public/design-showcase');
const staticDirs: string[] = existsSync(DESIGN_SHOWCASE) ? ['../public/design-showcase'] : [];

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.ts'],
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
