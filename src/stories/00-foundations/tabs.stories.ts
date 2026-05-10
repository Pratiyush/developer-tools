import type { Meta, StoryObj } from '@storybook/html';
import '../_styles/foundations.css';
import { tabs } from '../../ui/primitives/tabs';

const meta: Meta = {
  title: 'Foundations / Primitives / Tabs',
};

export default meta;

function host(child: HTMLElement): HTMLElement {
  const root = document.createElement('div');
  root.className = 'dt-foundation-host';
  root.style.padding = '24px';
  root.style.maxWidth = '720px';
  root.appendChild(child);
  return root;
}

function panelOf(text: string): HTMLElement {
  const div = document.createElement('div');
  div.style.padding = '16px';
  div.style.background = 'var(--bg-surface-2, #f4f4f5)';
  div.style.borderRadius = '8px';
  div.textContent = text;
  return div;
}

export const Underline: StoryObj = {
  name: 'Underline',
  render: () =>
    host(
      tabs({
        ariaLabel: 'Encoding',
        items: [
          { id: 'encode', label: 'Encode', content: panelOf('Encoding panel') },
          { id: 'decode', label: 'Decode', content: panelOf('Decoding panel') },
          { id: 'inspect', label: 'Inspect', content: panelOf('Inspector panel') },
        ],
      }),
    ),
};

export const Pill: StoryObj = {
  name: 'Pill',
  render: () =>
    host(
      tabs({
        tone: 'pill',
        ariaLabel: 'View',
        items: [
          { id: 'grid', label: 'Grid', content: panelOf('Grid layout') },
          { id: 'list', label: 'List', content: panelOf('List layout') },
        ],
      }),
    ),
};

export const PreselectedThird: StoryObj = {
  name: 'Preselected (third)',
  render: () =>
    host(
      tabs({
        selected: 'inspect',
        items: [
          { id: 'encode', label: 'Encode', content: panelOf('Encoding panel') },
          { id: 'decode', label: 'Decode', content: panelOf('Decoding panel') },
          { id: 'inspect', label: 'Inspect', content: panelOf('Inspector panel') },
        ],
      }),
    ),
};
