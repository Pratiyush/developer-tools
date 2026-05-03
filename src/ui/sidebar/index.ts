import { translate } from '../../lib/i18n';
import type { ToolModule } from '../../lib/types';
import { input } from '../primitives';

export interface SidebarHandle {
  el: HTMLElement;
  setActive(id: string | null): void;
  dispose(): void;
}

export interface SidebarOptions {
  tools: readonly ToolModule<unknown>[];
  onSelect?: (id: string) => void;
}

export function sidebar(opts: SidebarOptions): SidebarHandle {
  const el = document.createElement('aside');
  el.classList.add('dt-sidebar');

  // Brand
  const brand = document.createElement('div');
  brand.classList.add('dt-sidebar__brand');
  const mark = document.createElement('span');
  mark.classList.add('dt-sidebar__brand-mark');
  mark.textContent = 'DT';
  const name = document.createElement('span');
  name.textContent = translate('site.brand');
  brand.append(mark, name);
  el.appendChild(brand);

  // Search
  const searchWrap = document.createElement('div');
  searchWrap.classList.add('dt-sidebar__search');
  let query = '';
  const searchInput = input({
    type: 'search',
    placeholder: translate('sidebar.search.placeholder'),
    ariaLabel: translate('sidebar.search.aria'),
    onInput: (value) => {
      query = value.toLowerCase().trim();
      renderList();
    },
  });
  searchWrap.appendChild(searchInput);
  el.appendChild(searchWrap);

  // List container
  const list = document.createElement('div');
  list.classList.add('dt-sidebar__list');
  el.appendChild(list);

  // Foot
  const foot = document.createElement('div');
  foot.classList.add('dt-sidebar__foot');
  const foot1 = document.createElement('div');
  foot1.textContent = translate('sidebar.foot.line1');
  const foot2 = document.createElement('div');
  foot2.textContent = translate('sidebar.foot.line2');
  foot.append(foot1, foot2);
  el.appendChild(foot);

  let activeId: string | null = null;

  function renderList(): void {
    const filtered = opts.tools.filter((tool) => {
      if (!query) return true;
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.id.toLowerCase().includes(query)
      );
    });

    list.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.classList.add('dt-sidebar__group-h');
      empty.textContent = query ? translate('sidebar.empty.search') : translate('sidebar.empty');
      list.appendChild(empty);
      return;
    }

    const groups = new Map<string, ToolModule<unknown>[]>();
    for (const tool of filtered) {
      const list = groups.get(tool.category) ?? [];
      list.push(tool);
      groups.set(tool.category, list);
    }

    const sortedCategories = Array.from(groups.keys()).sort();
    for (const category of sortedCategories) {
      const group = document.createElement('div');
      group.classList.add('dt-sidebar__group');

      const header = document.createElement('div');
      header.classList.add('dt-sidebar__group-h');
      header.textContent = formatCategory(category);
      group.appendChild(header);

      const tools = groups.get(category) ?? [];
      tools.sort((a, b) => a.number - b.number);
      for (const tool of tools) {
        const link = document.createElement('a');
        link.classList.add('dt-sidebar__item');
        if (tool.id === activeId) link.classList.add('dt-sidebar__item--active');
        link.href = `#/${tool.id}`;
        link.textContent = tool.name;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          opts.onSelect?.(tool.id);
        });
        group.appendChild(link);
      }
      list.appendChild(group);
    }
  }

  renderList();

  return {
    el,
    setActive(id) {
      activeId = id;
      renderList();
    },
    dispose() {
      // No persistent listeners outside of input/onInput which lives on the
      // detached input element — GC will handle it once the sidebar is
      // removed from the DOM.
    },
  };
}

function formatCategory(slug: string): string {
  // '01-encoding' → 'Encoding'
  const parts = slug.split('-');
  if (parts.length < 2) return slug;
  const rest = parts.slice(1).join(' ');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}
