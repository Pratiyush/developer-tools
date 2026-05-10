import type { Meta, StoryObj } from '@storybook/html';
import '../_styles/foundations.css';
import { segment } from '../../ui/primitives/segment';
import { status, type StatusTone } from '../../ui/primitives/status';
import { stat, statGrid } from '../../ui/primitives/stat';

interface SegmentArgs {
  items: string[];
  selected: number;
  tone: 'primary' | 'secondary';
}

const meta: Meta<SegmentArgs> = {
  title: 'Foundations / Primitives / Segment',
  argTypes: {
    items: { control: 'object' },
    selected: { control: { type: 'number', min: 0, max: 5, step: 1 } },
    tone: { control: 'inline-radio', options: ['primary', 'secondary'] },
  },
  args: {
    items: ['Encode', 'Decode'],
    selected: 0,
    tone: 'primary',
  },
};

export default meta;

function host(child: HTMLElement): HTMLElement {
  const root = document.createElement('div');
  root.className = 'dt-foundation-host';
  root.style.padding = '24px';
  root.appendChild(child);
  return root;
}

export const SegmentDefault: StoryObj<SegmentArgs> = {
  name: 'Segment / Default',
  render: (args) => host(segment({ items: args.items, selected: args.selected, tone: args.tone })),
};

export const SegmentSecondary: StoryObj<SegmentArgs> = {
  name: 'Segment / Secondary',
  render: (args) =>
    host(segment({ items: args.items, selected: args.selected, tone: 'secondary' })),
};

export const SegmentManyOptions: StoryObj<SegmentArgs> = {
  name: 'Segment / Many options',
  render: () =>
    host(
      segment({
        items: ['UTF-8', 'Latin-1', 'ASCII', 'Hex', 'Base64', 'Base64URL'],
        selected: 0,
        ariaLabel: 'Encoding',
      }),
    ),
};

const STATUS_TONES: readonly StatusTone[] = ['neutral', 'success', 'danger', 'warning', 'info'];

export const StatusAllTones: StoryObj = {
  name: 'Status / All tones',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '12px';
    wrap.style.flexWrap = 'wrap';
    for (const tone of STATUS_TONES) {
      wrap.appendChild(status({ label: tone, tone }));
    }
    return host(wrap);
  },
};

export const StatSingle: StoryObj = {
  name: 'Stat / Single',
  render: () =>
    host(stat({ label: 'Tools shipped', value: '42', delta: '+3 this week', deltaPositive: true })),
};

export const StatGrid: StoryObj = {
  name: 'Stat / Grid',
  render: () =>
    host(
      statGrid({
        stats: [
          { label: 'Tools shipped', value: '42', delta: '+3', deltaPositive: true },
          { label: 'Bugs open', value: '7', delta: '-2', deltaPositive: false },
          { label: 'Locales', value: '15' },
          { label: 'Tests passing', value: '532' },
        ],
      }),
    ),
};
