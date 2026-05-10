import type { Meta, StoryObj } from '@storybook/html';

interface StoryArgs {
  path: string;
  title: string;
}

interface StoryContext {
  globals: {
    theme?: string;
    density?: string;
  };
}

const DESIGN_ROOT = '/design-showcase';
const THEMES = ['mono', 'editorial', 'grid', 'aurora', 'clean'] as const;
const DENSITIES = ['default', 'compact'] as const;

const screens = [
  { id: 'home', title: 'Home', path: 'index.html' },
  { id: 'hash', title: 'Hash text', path: 'tools/hash.html' },
  { id: 'encrypt', title: 'Encrypt / decrypt', path: 'tools/encrypt.html' },
  { id: 'jwt', title: 'JWT parser', path: 'tools/jwt.html' },
  { id: 'bcrypt', title: 'Bcrypt hash', path: 'tools/bcrypt.html' },
  { id: 'base64', title: 'Base64 string', path: 'tools/base64.html' },
  { id: 'jsonYaml', title: 'JSON to YAML', path: 'tools/json-yaml.html' },
  { id: 'color', title: 'Color converter', path: 'tools/color.html' },
  { id: 'case', title: 'Case converter', path: 'tools/case.html' },
  { id: 'urlEncode', title: 'URL encode/decode', path: 'tools/url-encode.html' },
  { id: 'htmlEscape', title: 'HTML escape', path: 'tools/html-escape.html' },
  { id: 'userAgent', title: 'User-agent parser', path: 'tools/user-agent.html' },
  { id: 'qr', title: 'QR code generator', path: 'tools/qr.html' },
  { id: 'ascii', title: 'ASCII art', path: 'tools/ascii.html' },
  { id: 'regex', title: 'Regex tester', path: 'tools/regex.html' },
  { id: 'formatJson', title: 'JSON formatter', path: 'tools/format-json.html' },
  { id: 'diff', title: 'Text diff', path: 'tools/diff.html' },
  { id: 'mathEval', title: 'Math evaluator', path: 'tools/math-eval.html' },
  { id: 'baseConv', title: 'Base converter', path: 'tools/base-conv.html' },
  { id: 'chmod', title: 'chmod calculator', path: 'tools/chmod.html' },
  { id: 'benchmark', title: 'Benchmark', path: 'tools/benchmark.html' },
  { id: 'lorem', title: 'Lorem ipsum', path: 'tools/lorem.html' },
  { id: 'wordcount', title: 'Word counter', path: 'tools/wordcount.html' },
  { id: 'uuid', title: 'UUID generator', path: 'tools/uuid.html' },
  { id: 'ulid', title: 'ULID generator', path: 'tools/ulid.html' },
  { id: 'password', title: 'Password generator', path: 'tools/password.html' },
] as const;

const meta = {
  title: 'Design Screens/Tools',
  render: (args: StoryArgs, context: StoryContext) => renderScreen(args, context),
  argTypes: {
    path: { table: { disable: true } },
    title: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Stories render the HTML pages extracted from `IT Tools (2).zip`. Use the toolbar theme dropdown and viewport selector for cross-browser visual review.',
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const VisualTestingGuide: Story = {
  name: 'Visual Testing Guide',
  args: { title: 'Visual Testing Guide', path: '' },
  render: () => renderGuide(),
  parameters: {
    layout: 'padded',
  },
};

export const Home: Story = {
  args: { title: 'Home', path: 'index.html' },
};

export const HashText: Story = { args: screens[1] };
export const EncryptDecrypt: Story = { args: screens[2] };
export const JwtParser: Story = { args: screens[3] };
export const BcryptHash: Story = { args: screens[4] };
export const Base64String: Story = { args: screens[5] };
export const JsonYaml: Story = { args: screens[6] };
export const ColorConverter: Story = { args: screens[7] };
export const CaseConverter: Story = { args: screens[8] };
export const UrlEncodeDecode: Story = { args: screens[9] };
export const HtmlEscape: Story = { args: screens[10] };
export const UserAgentParser: Story = { args: screens[11] };
export const QrCodeGenerator: Story = { args: screens[12] };
export const AsciiArt: Story = { args: screens[13] };
export const RegexTester: Story = { args: screens[14] };
export const JsonFormatter: Story = { args: screens[15] };
export const TextDiff: Story = { args: screens[16] };
export const MathEvaluator: Story = { args: screens[17] };
export const BaseConverter: Story = { args: screens[18] };
export const ChmodCalculator: Story = { args: screens[19] };
export const Benchmark: Story = { args: screens[20] };
export const LoremIpsum: Story = { args: screens[21] };
export const WordCounter: Story = { args: screens[22] };
export const UuidGenerator: Story = { args: screens[23] };
export const UlidGenerator: Story = { args: screens[24] };
export const PasswordGenerator: Story = { args: screens[25] };

function renderScreen(args: StoryArgs, context: StoryContext): HTMLElement {
  const theme = getTheme(context.globals.theme);
  const density = getDensity(context.globals.density);
  const wrap = document.createElement('div');
  wrap.style.height = '100vh';
  wrap.style.background = '#111';

  const iframe = document.createElement('iframe');
  iframe.title = args.title;
  iframe.src = 'about:blank';
  iframe.style.display = 'block';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.dataset.visualTest = args.title;

  wrap.append(iframe);

  requestAnimationFrame(() => {
    const win = iframe.contentWindow;
    if (win) {
      win.localStorage.setItem('it.theme', JSON.stringify(theme));
      win.localStorage.setItem('it.density', JSON.stringify(density));
    }
    iframe.src = `${DESIGN_ROOT}/${args.path}`;
  });

  return wrap;
}

function renderGuide(): HTMLElement {
  const el = document.createElement('article');
  el.style.maxWidth = '920px';
  el.style.margin = '0 auto';
  el.style.padding = '32px';
  el.style.font = '14px/1.55 system-ui, sans-serif';
  el.style.color = '#111827';
  el.innerHTML = `
    <h1>Visual testing guide</h1>
    <p>Use these stories as the source of truth for the extracted zip screens.</p>
    <h2>Coverage matrix</h2>
    <ul>
      <li>Browsers: Chromium, Firefox, WebKit.</li>
      <li>Viewports: 390x844, 768x1024, 1440x900, 1920x1080.</li>
      <li>Themes: ${THEMES.join(', ')}. Densities: ${DENSITIES.join(', ')}.</li>
      <li>States: default load, focused input, hoverable cards/buttons, sidebar collapsed where available.</li>
    </ul>
    <h2>Pixel-perfect rules</h2>
    <ul>
      <li>Freeze time, animation, random data, and remote fonts before taking baselines.</li>
      <li>Capture full page and key component crops; use a 0.1% diff budget for layout and 0.5% for anti-aliasing-heavy text.</li>
      <li>Fail on overlap, clipped text, unexpected scrollbars, missing icons, blank panels, and shifted navigation.</li>
      <li>Keep one baseline per browser, viewport, and theme. Do not share Chromium baselines with WebKit or Firefox.</li>
    </ul>
    <h2>Suggested Playwright command</h2>
    <pre><code>pnpm storybook
pnpm playwright test --project=chromium --project=firefox --project=webkit</code></pre>
  `;
  return el;
}

function getTheme(value: string | undefined): (typeof THEMES)[number] {
  return THEMES.includes(value as (typeof THEMES)[number])
    ? (value as (typeof THEMES)[number])
    : 'mono';
}

function getDensity(value: string | undefined): (typeof DENSITIES)[number] {
  return DENSITIES.includes(value as (typeof DENSITIES)[number])
    ? (value as (typeof DENSITIES)[number])
    : 'default';
}
