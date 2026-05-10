import type { Meta, StoryObj } from '@storybook/html';
import '../_styles/foundations.css';
import { kvRow } from '../../ui/data-display/kv-row';
import { kvList } from '../../ui/data-display/kv-list';
import { output } from '../../ui/data-display/output';
import { preview } from '../../ui/data-display/preview';

const meta: Meta = {
  title: 'Foundations / Data display',
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

export const KvRowDefault: StoryObj = {
  name: 'KV row / Default',
  render: () => host(kvRow({ key: 'Algorithm', value: 'AES-256-GCM' }).el),
};

export const KvRowWithCopy: StoryObj = {
  name: 'KV row / With copy',
  render: () =>
    host(
      kvRow({
        key: 'Token',
        value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4eHgifQ.signature',
        mono: true,
        copyable: true,
      }).el,
    ),
};

export const KvListJwt: StoryObj = {
  name: 'KV list / JWT decoded',
  render: () =>
    host(
      kvList({
        entries: [
          { key: 'alg', value: 'HS256', mono: true, copyable: true },
          { key: 'typ', value: 'JWT', mono: true },
          { key: 'sub', value: '1234567890', mono: true, copyable: true },
          { key: 'iat', value: '1516239022', mono: true },
        ],
      }).el,
    ),
};

export const OutputJson: StoryObj = {
  name: 'Output / JSON',
  render: () =>
    host(
      output({
        language: 'json',
        content: JSON.stringify(
          { name: 'developer-tools', version: '1.2.0', shipped: 42 },
          null,
          2,
        ),
      }),
    ),
};

export const OutputPlain: StoryObj = {
  name: 'Output / Plain',
  render: () => host(output({ content: 'one\ntwo\nthree\nfour' })),
};

export const PreviewWithCaption: StoryObj = {
  name: 'Preview / With caption',
  render: () => {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.style.padding = '8px 16px';
    button.style.background = '#111';
    button.style.color = '#fff';
    button.style.border = '0';
    button.style.borderRadius = '6px';
    return host(preview({ caption: 'Live preview', content: button }));
  },
};
