import type { Meta, StoryObj } from '@storybook/html';
import '../_styles/foundations.css';
import { toast } from '../../ui/feedback/toast';

const meta: Meta = {
  title: 'Foundations / Feedback / Toast',
};

export default meta;

function host(child: HTMLElement): HTMLElement {
  const root = document.createElement('div');
  root.className = 'dt-foundation-host';
  root.style.padding = '24px';
  root.appendChild(child);
  return root;
}

function trigger(label: string, fire: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.style.padding = '8px 14px';
  button.style.marginRight = '8px';
  button.style.background = 'var(--bg-surface, #fff)';
  button.style.border = '1px solid var(--line, #e5e7eb)';
  button.style.borderRadius = '6px';
  button.style.cursor = 'pointer';
  button.style.font = 'inherit';
  button.addEventListener('click', fire);
  return button;
}

export const Tones: StoryObj = {
  name: 'Toast / Tones (click to fire)',
  render: () => {
    const row = document.createElement('div');
    row.appendChild(trigger('Success', () => toast('Saved to clipboard', { tone: 'success' })));
    row.appendChild(trigger('Error', () => toast('Failed to save', { tone: 'error' })));
    row.appendChild(trigger('Info', () => toast('Heads up', { tone: 'info' })));
    row.appendChild(trigger('Neutral', () => toast('Hello, Storybook')));
    return host(row);
  },
};

export const Stacked: StoryObj = {
  name: 'Toast / Stacked queue',
  render: () => {
    const row = document.createElement('div');
    row.appendChild(
      trigger('Fire 3 toasts', () => {
        toast('First in queue', { tone: 'info' });
        toast('Second after a beat', { tone: 'success' });
        toast('Third — error tone', { tone: 'error' });
      }),
    );
    return host(row);
  },
};

export const Sticky: StoryObj = {
  name: 'Toast / Sticky (duration: 0)',
  render: () => {
    const row = document.createElement('div');
    let current: ReturnType<typeof toast> | null = null;
    row.appendChild(
      trigger('Show sticky', () => {
        if (current !== null) current.dismiss();
        current = toast('Won’t auto-dismiss. Click × to close.', { duration: 0 });
      }),
    );
    return host(row);
  },
};
