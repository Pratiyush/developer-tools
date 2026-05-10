import type { Meta, StoryObj } from '@storybook/html';

interface StoryContext {
  globals: {
    theme?: string;
    preset?: string;
    density?: string;
  };
}

const THEMES = ['mono', 'editorial', 'grid', 'aurora', 'clean'] as const;
const PRESETS = ['linear', 'vercel', 'paper', 'swiss', 'aurora', 'clean', 'matrix'] as const;
const DENSITIES = ['default', 'compact'] as const;

const TOKEN_GROUPS = {
  color: [
    '--bg',
    '--bg-2',
    '--bg-3',
    '--panel',
    '--fg',
    '--fg-dim',
    '--fg-faint',
    '--accent',
    '--accent-2',
    '--border',
    '--border-2',
  ],
  semantic: [
    '--dt-success',
    '--dt-success-bg',
    '--dt-warning',
    '--dt-warning-bg',
    '--dt-danger',
    '--dt-danger-bg',
    '--dt-focus-ring',
  ],
  shapeType: [
    '--radius',
    '--radius-sm',
    '--dt-control-sm',
    '--dt-control-md',
    '--dt-control-lg',
    '--font-body',
    '--font-head',
    '--font-mono',
  ],
} as const;

const meta = {
  title: 'Developer Tools Design System',
  // SB-22 (#60) tag-taxonomy: WIP. The CSS this story loads
  // (/design-showcase/themes.css, /design-showcase/system-tokens.css,
  // /design-showcase/system-components.css) lives in the gitignored
  // public/design-showcase/ extracted from the IT Tools zip. CI clones
  // don't have those files, so smoke + visual regression MUST skip these
  // stories. The canonical design-system primitives are in
  // src/stories/00-foundations/* (SB-14 / #52) with bundled CSS.
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A governed Storybook layer for the developer-tools UI extracted from `IT Tools (2).zip`: tokens, presets, reusable primitives, states, responsive app frame, and visual verification rules.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Foundations: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Foundations');
    root.append(tokenSection('Color Tokens', TOKEN_GROUPS.color));
    root.append(tokenSection('Semantic Tokens', TOKEN_GROUPS.semantic));
    root.append(tokenSection('Shape + Type Tokens', TOKEN_GROUPS.shapeType));
    root.append(typeScale());
    return root;
  },
};

export const Presets: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Presets');
    const grid = document.createElement('section');
    grid.className = 'dt-grid';
    grid.innerHTML = PRESETS.map((preset) => presetCard(preset)).join('');
    root.append(grid);
    return root;
  },
};

export const Buttons: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Buttons');
    root.append(section('Core Buttons', buttonsMarkup()));
    root.append(section('Icon + Destructive', iconButtonMarkup()));
    return root;
  },
};

export const Forms: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Forms');
    root.append(section('Inputs', formsMarkup()));
    root.append(section('Validation', validationMarkup()));
    return root;
  },
};

export const ToolCards: Story = {
  name: 'Tool Cards',
  render: (_args, context) => {
    const root = shell(context, 'Tool Cards');
    const panel = document.createElement('section');
    panel.className = 'dt-grid';
    panel.innerHTML = `
      ${toolCard('Hash text', 'MD5, SHA-1, SHA-256, SHA-512 in your browser.', '##', 'a3f2b9c1...', 'mono', true)}
      ${toolCard('Color converter', 'HEX, RGB, HSL and OKLCH all at once.', '**', '#6366f1', 'swatch')}
      ${toolCard('Regex tester', 'Live-match patterns against test strings.', '/x/', '/^[a-z]+$/', 'chip')}
      ${toolCard('Password generator', 'Strong, random passwords with options.', '***', '32 chars', 'chip')}
    `;
    root.append(panel);
    return root;
  },
};

export const Navigation: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Navigation');
    const grid = document.createElement('div');
    grid.className = 'dt-grid';
    grid.append(section('Sidebar List', navMarkup()), section('Search + Command', commandMarkup()));
    root.append(grid);
    return root;
  },
};

export const Results: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Results');
    const grid = document.createElement('div');
    grid.className = 'dt-grid';
    grid.append(section('Key-value Rows', kvMarkup()), section('Stats + Output', resultMarkup()));
    root.append(grid);
    return root;
  },
};

export const AppFrame: Story = {
  name: 'App Frame',
  render: (_args, context) => {
    setupSystem(context);
    const root = document.createElement('div');
    root.className = 'app dt-story-app-frame';
    root.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-head">
          <a class="brand" href="#"><span class="brand-mark">IT</span><span class="brand-text">IT&nbsp;Tools</span></a>
          <button class="sidebar-collapse" aria-label="Collapse sidebar">⌁</button>
        </div>
        <button class="search-btn"><span class="search-icon">⌕</span><span class="search-label">Search tools...</span><span class="kbd">⌘K</span></button>
        <nav class="sidebar-nav-scroll">
          <div class="nav-section">
            <div class="nav-section-title">Converter</div>
            ${zipNavItem('Base64 string', true)}
            ${zipNavItem('JSON to YAML')}
            ${zipNavItem('Color converter')}
          </div>
          <div class="nav-section">
            <div class="nav-section-title">Development</div>
            ${zipNavItem('Regex tester')}
            ${zipNavItem('JSON formatter')}
            ${zipNavItem('Text diff')}
          </div>
        </nav>
        <div class="sidebar-foot">
          <div class="sidebar-foot-info"><span class="dot"></span><span class="t">v26.5 · 26 tools · local</span></div>
          <div class="sidebar-credit">All processing runs in your browser.</div>
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <button class="icon-btn sidebar-toggle" aria-label="Toggle sidebar">☰</button>
          <div class="crumbs">Home / Converter / Base64 string</div>
          <div class="topbar-actions">
            <button class="icon-btn" aria-label="Search">⌕</button>
            <button class="icon-btn" aria-label="Theme">◐</button>
          </div>
        </div>
        <h1 class="page-title">Base64 string</h1>
        <p class="page-sub">Encode and decode UTF-8 text to and from Base64.</p>
        ${toolBodyMarkup()}
      </main>
    `;
    return root;
  },
};

export const Verification: Story = {
  render: (_args, context) => {
    const root = shell(context, 'Visual Verification');
    root.append(section('Pixel-perfect Guidelines', verificationMarkup()));
    return root;
  },
};

function shell(context: StoryContext, title: string): HTMLElement {
  const settings = setupSystem(context);
  const root = document.createElement('main');
  root.className = 'dt-story-shell';
  root.innerHTML = `
    <header class="dt-story-header">
      <div>
        <div class="dt-label">Developer tools design system</div>
        <h1 class="page-title">${title}</h1>
        <p class="page-sub">Theme: ${settings.theme} · Preset: ${settings.preset} · Density: ${settings.density}</p>
      </div>
      <span class="dt-status" data-tone="success">storybook source</span>
    </header>
  `;
  return root;
}

function setupSystem(context: StoryContext): {
  theme: (typeof THEMES)[number];
  preset: (typeof PRESETS)[number];
  density: (typeof DENSITIES)[number];
} {
  ensureAssets();
  const theme = getTheme(context.globals.theme);
  const preset = getPreset(context.globals.preset);
  const density = getDensity(context.globals.density);
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-preset', preset);
  document.documentElement.setAttribute('data-density', density);
  document.documentElement.setAttribute('data-card', preset === 'aurora' ? 'glass' : 'subtle');
  document.documentElement.setAttribute(
    'data-btn',
    preset === 'swiss' || preset === 'matrix' ? 'square' : 'rounded',
  );
  document.body.style.margin = '0';
  return { theme, preset, density };
}

function ensureAssets(): void {
  addLink('/design-showcase/themes.css', 'design-showcase-css');
  addLink('/design-showcase/system-tokens.css', 'design-system-tokens-css');
  addLink('/design-showcase/system-components.css', 'design-system-components-css');

  if (!document.querySelector('style[data-design-system-story-css]')) {
    const style = document.createElement('style');
    style.dataset.designSystemStoryCss = 'true';
    style.textContent = `
      .dt-story-shell { min-height: 100vh; padding: var(--dt-space-7); background: var(--bg); color: var(--fg); font-family: var(--font-body); }
      .dt-story-header { display: flex; align-items: start; justify-content: space-between; gap: var(--dt-space-6); margin-bottom: var(--dt-space-6); }
      .dt-story-section { margin-bottom: var(--dt-space-6); }
      .dt-story-section-title { margin: 0 0 var(--dt-space-3); color: var(--dt-text); font: 650 var(--dt-text-lg)/1.2 var(--font-head); }
      .dt-token-table { width: 100%; border-collapse: collapse; overflow: hidden; border: 1px solid var(--dt-line); border-radius: var(--radius); }
      .dt-token-table th, .dt-token-table td { padding: 10px 12px; border-bottom: 1px solid var(--dt-line); text-align: left; font-size: 12px; }
      .dt-token-table code { font-family: var(--font-mono); }
      .dt-swatch { width: 34px; height: 22px; border: 1px solid var(--dt-line-strong); border-radius: 5px; display: inline-block; vertical-align: middle; }
      .dt-preset-card { min-height: 170px; }
      .dt-preset-swatches { display: flex; gap: 4px; margin-top: var(--dt-space-4); }
      .dt-preset-swatches span { width: 28px; height: 18px; border: 1px solid var(--dt-line); border-radius: 4px; }
      .dt-type-demo { display: grid; gap: var(--dt-space-3); }
      .dt-story-app-frame { min-height: 100vh; color: var(--fg); background: var(--bg); font-family: var(--font-body); }
      .dt-copy { max-width: 900px; }
      .dt-copy h3 { margin: 18px 0 6px; font-size: 17px; }
      .dt-copy p { color: var(--dt-text-muted); }
      .dt-copy pre { white-space: pre-wrap; background: var(--dt-surface-muted); border: 1px solid var(--dt-line); border-radius: var(--radius-sm); padding: var(--dt-space-4); }
      @media (max-width: 860px) { .dt-story-shell { padding: var(--dt-space-5); } .dt-story-header { display: grid; } }
    `;
    document.head.append(style);
  }
}

function addLink(href: string, key: string): void {
  if (document.querySelector(`link[data-${key}]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute(`data-${key}`, 'true');
  document.head.append(link);
}

function section(title: string, markup: string): HTMLElement {
  const node = document.createElement('section');
  node.className = 'dt-panel dt-story-section';
  node.innerHTML = `<h2 class="dt-story-section-title">${title}</h2>${markup}`;
  return node;
}

function tokenSection(title: string, tokens: readonly string[]): HTMLElement {
  const node = document.createElement('section');
  node.className = 'dt-story-section';
  const styles = getComputedStyle(document.documentElement);
  node.innerHTML = `
    <h2 class="dt-story-section-title">${title}</h2>
    <table class="dt-token-table">
      <thead><tr><th>Token</th><th>Value</th><th>Preview</th></tr></thead>
      <tbody>
        ${tokens
          .map((token) => {
            const value = styles.getPropertyValue(token).trim();
            const canSwatch =
              token.includes('bg') ||
              token.includes('fg') ||
              token.includes('accent') ||
              token.includes('border') ||
              token.includes('success') ||
              token.includes('warning') ||
              token.includes('danger');
            return `<tr><td><code>${token}</code></td><td><code>${value}</code></td><td>${canSwatch ? `<span class="dt-swatch" style="background:${value}"></span>` : ''}</td></tr>`;
          })
          .join('')}
      </tbody>
    </table>
  `;
  return node;
}

function typeScale(): HTMLElement {
  return section(
    'Typography',
    `
      <div class="dt-type-demo">
        <h1 class="page-title">Page title / tool name</h1>
        <p class="page-sub">Page subtitle explains the selected utility in one concise sentence.</p>
        <p>Body copy stays compact because this product is workflow-heavy and scan-first.</p>
        <code>Monospace output, IDs, hashes, commands, and parsed values use var(--font-mono).</code>
      </div>
    `,
  );
}

function presetCard(preset: (typeof PRESETS)[number]): string {
  const swatches: Record<(typeof PRESETS)[number], string[]> = {
    linear: ['#0a0a0a', '#181818', '#6366f1'],
    vercel: ['#000000', '#0a0a0a', '#ffffff'],
    paper: ['#faf8f4', '#ffffff', '#b45309'],
    swiss: ['#fafafa', '#0a0a0a', '#dc2626'],
    aurora: ['#07080f', '#8b5cf6', '#06b6d4'],
    clean: ['#f1f5f9', '#ffffff', '#18a058'],
    matrix: ['#000000', '#003311', '#00ff41'],
  };
  return `
    <article class="dt-panel dt-preset-card" data-preset-card="${preset}">
      <div class="dt-label">${preset}</div>
      <h3 class="dt-tool-card__name">${presetLabel(preset)}</h3>
      <p class="dt-tool-card__desc">${presetNote(preset)}</p>
      <div class="dt-preset-swatches">${swatches[preset].map((color) => `<span style="background:${color}"></span>`).join('')}</div>
    </article>
  `;
}

function buttonsMarkup(): string {
  return `
    <div class="dt-cluster">
      <button class="dt-button">Secondary</button>
      <button class="dt-button" data-variant="primary">Primary</button>
      <button class="dt-button" aria-disabled="true">Disabled</button>
      <button class="dt-button"><span aria-hidden="true">↻</span> Regenerate</button>
      <button class="dt-button" data-variant="primary"><span aria-hidden="true">⧉</span> Copy value</button>
    </div>
  `;
}

function iconButtonMarkup(): string {
  return `
    <div class="dt-cluster">
      <button class="dt-button dt-icon-button" aria-label="Search">⌕</button>
      <button class="dt-button dt-icon-button" aria-label="Favorite">★</button>
      <button class="dt-button dt-icon-button" aria-label="Copy">⧉</button>
      <button class="dt-button" data-variant="danger">Clear history</button>
      <span class="dt-status" data-tone="success">local only</span>
      <span class="dt-status" data-tone="danger">invalid input</span>
    </div>
  `;
}

function formsMarkup(): string {
  return `
    <div class="dt-form-grid">
      <label class="dt-field"><span>Text input</span><input class="dt-input" value="developer-tools" /></label>
      <label class="dt-field"><span>Number</span><input class="dt-input" type="number" value="128" /></label>
      <label class="dt-field"><span>Select</span><select class="dt-select"><option>Base64</option><option>HEX</option><option>URL-safe</option></select></label>
    </div>
    <div class="dt-stack" style="margin-top: var(--dt-space-4);">
      <label class="dt-field"><span>Textarea</span><textarea class="dt-textarea">The quick brown fox jumps over the lazy dog.</textarea></label>
    </div>
  `;
}

function validationMarkup(): string {
  return `
    <div class="dt-form-grid">
      <label class="dt-field">
        <span>Focused-valid pattern</span>
        <input class="dt-input" value="^[a-z]+$" />
        <span class="dt-help">Use semantic status text close to the field.</span>
      </label>
      <label class="dt-field">
        <span>Error state</span>
        <input class="dt-input" aria-invalid="true" value="{ broken json" />
        <span class="dt-help" style="color: var(--dt-danger);">Expected valid JSON object.</span>
      </label>
    </div>
  `;
}

function toolCard(
  name: string,
  desc: string,
  icon: string,
  preview: string,
  previewType: 'mono' | 'swatch' | 'chip',
  favorite = false,
): string {
  const previewMarkup =
    previewType === 'swatch'
      ? `<span class="dt-preview"><span class="dt-preview__swatch" style="background:${preview}"></span><code>${preview}</code></span>`
      : `<span class="dt-preview"><code>${preview}</code></span>`;
  return `
    <a class="dt-tool-card" href="#" data-favorite="${favorite ? 'true' : 'false'}">
      <div class="dt-tool-card__icon">${icon}</div>
      <h3 class="dt-tool-card__name">${name}</h3>
      <p class="dt-tool-card__desc">${desc}</p>
      ${previewMarkup}
      <button class="dt-tool-card__favorite" aria-label="${favorite ? 'Unfavorite' : 'Favorite'}">${favorite ? '★' : '☆'}</button>
    </a>
  `;
}

function navMarkup(): string {
  return `
    <div class="dt-label">Favorites</div>
    <div class="dt-nav-list">
      ${systemNavItem('UUID generator', true)}
      ${systemNavItem('Hash text')}
      ${systemNavItem('Regex tester')}
      ${systemNavItem('JSON formatter')}
    </div>
  `;
}

function commandMarkup(): string {
  return `
    <div class="dt-stack">
      <button class="search-btn"><span class="search-icon">⌕</span><span class="search-label">Search tools...</span><span class="kbd">⌘K</span></button>
      <div class="dt-output">Command palette should preserve focus order, active item styling, category labels, and keyboard navigation across every theme.</div>
    </div>
  `;
}

function systemNavItem(label: string, active = false): string {
  return `
    <a class="dt-nav-item" href="#" data-active="${active ? 'true' : 'false'}">
      <span class="dt-nav-item__icon">⌘</span>
      <span class="dt-nav-item__label">${label}</span>
    </a>
  `;
}

function zipNavItem(label: string, active = false): string {
  return `
    <a class="nav-item ${active ? 'active starred' : ''}" href="#" data-tip="${label}">
      <span class="icon">⌘</span>
      <span class="label">${label}</span>
      <button class="star" aria-label="Favorite">${active ? '★' : '☆'}</button>
    </a>
  `;
}

function kvMarkup(): string {
  return `
    <div class="dt-kv-list">
      ${kvRow('HEX', '#8B5CF6')}
      ${kvRow('RGB', 'rgb(139, 92, 246)')}
      ${kvRow('HSL', 'hsl(262 83.3% 66.3%)')}
      ${kvRow('OKLCH', 'oklch(62.3% 0.214 292.4)')}
    </div>
  `;
}

function kvRow(key: string, value: string): string {
  return `
    <div class="dt-kv-row">
      <span class="dt-kv-row__key">${key}</span>
      <span class="dt-kv-row__value">${value}</span>
      <button class="dt-button dt-icon-button" aria-label="Copy ${key}">⧉</button>
    </div>
  `;
}

function resultMarkup(): string {
  return `
    <div class="dt-stack">
      <div class="dt-stat-grid">
        <div class="dt-stat"><div class="dt-stat__label">Words</div><div class="dt-stat__value">128</div></div>
        <div class="dt-stat"><div class="dt-stat__label">Characters</div><div class="dt-stat__value">742</div></div>
        <div class="dt-stat"><div class="dt-stat__label">Read time</div><div class="dt-stat__value">1m</div></div>
      </div>
      <div class="dt-output">f47ac10b-58cc-4372-a567-0e02b2c3d479</div>
      <div class="dt-color-preview" style="background:#8b5cf6;">#8B5CF6</div>
    </div>
  `;
}

function toolBodyMarkup(): string {
  return `
    <div class="tool-page">
      <div class="field-row two">
        <div class="panel" data-label="PLAIN">
          <div class="panel-label">Plain text</div>
          <textarea>Hello, world</textarea>
        </div>
        <div class="panel" data-label="BASE64">
          <div class="panel-label">Base64</div>
          <textarea>SGVsbG8sIHdvcmxk</textarea>
        </div>
      </div>
      <div class="row">
        <button class="btn">URL-safe</button>
        <button class="btn">Swap</button>
        <button class="btn primary">Copy Base64</button>
      </div>
      <div class="output">Output preview / status text</div>
    </div>
  `;
}

function verificationMarkup(): string {
  return `
    <div class="dt-copy">
      <h3>Coverage matrix</h3>
      <p>Baseline Chromium, Firefox, and WebKit separately. Capture 390x844, 768x1024, 1440x900, and 1920x1080 for every theme and preset.</p>
      <h3>Hard failures</h3>
      <p>Fail on clipped text, overlapping controls, missing icons, unexpected scrollbars, blank panels, broken focus rings, and component layout shifts between states.</p>
      <h3>Diff budgets</h3>
      <p>Use 0.1% max diff for component crops and 0.5% for full pages with dense text. Keep browser-specific baselines because font rasterization differs.</p>
      <h3>Stability</h3>
      <pre><code>await page.emulateMedia({ reducedMotion: 'reduce' });
await page.evaluate(() => document.fonts.ready);
await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.001 });</code></pre>
    </div>
  `;
}

function presetLabel(preset: (typeof PRESETS)[number]): string {
  const labels: Record<(typeof PRESETS)[number], string> = {
    linear: 'Linear-grade dark workbench',
    vercel: 'Black, Geist, sharper edges',
    paper: 'Editorial serif surface',
    swiss: 'Monochrome grid system',
    aurora: 'Glass and gradient dark',
    clean: 'Friendly structured light',
    matrix: 'Green-on-black terminal',
  };
  return labels[preset];
}

function presetNote(preset: (typeof PRESETS)[number]): string {
  const notes: Record<(typeof PRESETS)[number], string> = {
    linear: 'Default production recommendation: dense, quiet, and high contrast.',
    vercel: 'Useful for brand-neutral dark mode with minimal chroma.',
    paper: 'Best for editorial or documentation-heavy variants.',
    swiss: 'Best for strict layouts, sharp borders, and audit-friendly screens.',
    aurora: 'Use sparingly for expressive previews or marketing-adjacent surfaces.',
    clean: 'Best light-mode candidate for everyday utility workflows.',
    matrix: 'Novelty preset, useful as an accessibility stress case for high chroma.',
  };
  return notes[preset];
}

function getTheme(value: string | undefined): (typeof THEMES)[number] {
  return THEMES.includes(value as (typeof THEMES)[number])
    ? (value as (typeof THEMES)[number])
    : 'mono';
}

function getPreset(value: string | undefined): (typeof PRESETS)[number] {
  return PRESETS.includes(value as (typeof PRESETS)[number])
    ? (value as (typeof PRESETS)[number])
    : 'linear';
}

function getDensity(value: string | undefined): (typeof DENSITIES)[number] {
  return DENSITIES.includes(value as (typeof DENSITIES)[number])
    ? (value as (typeof DENSITIES)[number])
    : 'default';
}
