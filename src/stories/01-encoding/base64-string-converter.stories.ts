import type { Meta, StoryObj } from '@storybook/html';
import { mountTool } from '../_helpers/mount-tool';
import { tool, DEFAULT_STATE } from '../../tools/01-encoding/001-base64-string-converter';
import type { State } from '../../tools/01-encoding/001-base64-string-converter/url-state';

// SB-04 (#43): first real-component story — mounts the production base64
// `render(host, state)` factory and returns the host element to Storybook.
// State variants are wired into the toolbar via argTypes; flipping a control
// re-mounts with the chosen options so the same code path the live app runs
// is exercised here.

const meta: Meta<State> = {
  title: 'Tools / 01-encoding / Base64 String Converter',
  parameters: {
    docs: {
      description: {
        component:
          'See spec: [.specification/base64-string-converter.md](./../../../.specification/base64-string-converter.md)',
      },
    },
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['encode', 'decode'] },
    urlsafe: { control: 'boolean' },
    input: { control: 'text' },
  },
  args: DEFAULT_STATE,
};

export default meta;

type Story = StoryObj<State>;

const render = (args: State): HTMLElement => mountTool(tool, args);

export const Default: Story = {
  render,
};

export const Empty: Story = {
  args: { ...DEFAULT_STATE, input: '' },
  render,
};

/**
 * Decode mode with a deliberately invalid base64 payload — the live tool
 * surfaces the error in-pane. Storybook's A11y panel should still pass
 * because the error UI uses accessible markup (`role="alert"`-friendly
 * messaging from the tool itself).
 */
export const Error: Story = {
  args: {
    mode: 'decode',
    urlsafe: false,
    input: '!!!not-valid-base64===',
  },
  render,
};

/**
 * Practical max input — large textarea exercise. Picked to avoid jsdom
 * memory issues during the smoke test but still stress visual layout.
 */
export const WithMaxInput: Story = {
  args: {
    mode: 'encode',
    urlsafe: false,
    input: 'abcdefghij'.repeat(500), // 5,000 chars
  },
  render,
};

/**
 * URL-safe encode variant — verifies the toggle propagates from `args`
 * through `parseParams` -> render.
 */
export const UrlSafe: Story = {
  args: {
    mode: 'encode',
    urlsafe: true,
    input: 'subjects?id=1&filter=a+b',
  },
  render,
};

/**
 * Decoded state pre-filled — confirms the same factory handles round-trip.
 */
export const DecodedRoundTrip: Story = {
  args: {
    mode: 'decode',
    urlsafe: false,
    input: 'SGVsbG8sIFN0b3J5Ym9vayE=', // base64("Hello, Storybook!")
  },
  render,
};
