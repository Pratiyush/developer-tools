import type { Meta, StoryObj } from '@storybook/html';
import '../_styles/foundations.css';
import { grid } from '../../ui/layout/grid';
import { formGrid } from '../../ui/layout/form-grid';
import { push } from '../../ui/layout/push';
import { grow } from '../../ui/layout/grow';

const meta: Meta = {
  title: 'Foundations / Layout',
};

export default meta;

function host(child: HTMLElement): HTMLElement {
  const root = document.createElement('div');
  root.className = 'dt-foundation-host';
  root.style.padding = '24px';
  root.appendChild(child);
  return root;
}

function tile(label: string): HTMLElement {
  const div = document.createElement('div');
  div.textContent = label;
  div.style.padding = '16px';
  div.style.background = 'var(--bg-surface-2, #f4f4f5)';
  div.style.borderRadius = '8px';
  div.style.textAlign = 'center';
  return div;
}

export const Grid2Cols: StoryObj = {
  name: 'Grid / 2 columns',
  render: () => host(grid({ cols: 2, children: ['A', 'B', 'C', 'D'].map(tile) })),
};

export const Grid3ColsLgGap: StoryObj = {
  name: 'Grid / 3 columns, large gap',
  render: () =>
    host(grid({ cols: 3, gap: 'lg', children: ['1', '2', '3', '4', '5', '6'].map(tile) })),
};

export const FormGridBasic: StoryObj = {
  name: 'Form grid / Basic',
  render: () => {
    function input(id: string, placeholder: string): HTMLInputElement {
      const el = document.createElement('input');
      el.id = id;
      el.placeholder = placeholder;
      el.style.padding = '8px 12px';
      el.style.border = '1px solid var(--line, #e5e7eb)';
      el.style.borderRadius = '6px';
      el.style.font = 'inherit';
      el.style.width = '100%';
      return el;
    }
    return host(
      formGrid({
        entries: [
          { label: 'Slug', field: input('slug', 'kebab-case') },
          { label: 'Name', field: input('name', 'Tool name'), hint: 'Shown in the sidebar.' },
          { label: 'Description', field: input('desc', 'One-liner') },
        ],
      }),
    );
  },
};

export const PushHeader: StoryObj = {
  name: 'Push / Header pattern',
  render: () => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.padding = '12px';
    row.style.background = 'var(--bg-surface, #fff)';
    row.style.border = '1px solid var(--line, #e5e7eb)';
    row.style.borderRadius = '8px';

    const title = document.createElement('strong');
    title.textContent = 'Tool title';
    row.appendChild(title);

    row.appendChild(push());

    const a1 = document.createElement('button');
    a1.textContent = 'Action A';
    const a2 = document.createElement('button');
    a2.textContent = 'Action B';
    row.appendChild(a1);
    row.appendChild(a2);

    return host(row);
  },
};

export const GrowSearchRow: StoryObj = {
  name: 'Grow / Search input dominates the row',
  render: () => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    const search = document.createElement('input');
    search.placeholder = 'Search tools…';
    search.style.padding = '8px 12px';
    search.style.border = '1px solid var(--line, #e5e7eb)';
    search.style.borderRadius = '6px';
    search.style.font = 'inherit';
    search.style.width = '100%';

    const filterBtn = document.createElement('button');
    filterBtn.textContent = 'Filter';

    row.appendChild(grow({ children: [search] }));
    row.appendChild(filterBtn);

    return host(row);
  },
};
