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

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.ts'],
  // Narrow allowlist (SB-12 / #50). The live app's `public/` contains
  // favicons, manifests, and SEO files that Storybook does not need; only
  // `design-showcase/` is required by the iframe stories.
  staticDirs: ['../public/design-showcase'],
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
