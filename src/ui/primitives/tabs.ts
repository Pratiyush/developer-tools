/**
 * SB-24 (#62) — WAI-ARIA Tabs.
 *
 * Differs from `segment.ts` (also SB-14): tabs are paired with content
 * panels. The factory creates a `<div class="dt-tabs">` containing a
 * `<div role="tablist">` plus one `<div role="tabpanel">` per item.
 *
 * Keyboard: ArrowLeft/Right cycles (with wraparound), Home/End jumps,
 * Enter/Space activates. `data-state="active|inactive"` flips on both
 * the tab and its panel. `aria-selected` + `aria-controls` are wired.
 */

import { variants } from '../_helpers/variants';

export type TabsTone = 'underline' | 'pill';

export interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly content: HTMLElement;
}

export interface TabsOptions {
  readonly items: readonly TabItem[];
  readonly selected?: string;
  readonly tone?: TabsTone;
  readonly ariaLabel?: string;
  readonly onChange?: (id: string) => void;
}

export interface TabsChangeDetail {
  readonly id: string;
  readonly index: number;
}

const tabsRootClass = variants({
  base: 'dt-tabs',
  variants: {
    tone: { underline: '', pill: 'dt-tabs--pill' },
  },
  defaultVariants: { tone: 'underline' },
});

export function tabs(options: TabsOptions): HTMLDivElement {
  const tone: TabsTone = options.tone ?? 'underline';
  const root = document.createElement('div');
  root.className = tabsRootClass({ tone });

  const list = document.createElement('div');
  list.className = 'dt-tabs__list';
  list.setAttribute('role', 'tablist');
  if (options.ariaLabel !== undefined) list.setAttribute('aria-label', options.ariaLabel);

  const triggers: HTMLButtonElement[] = [];
  const panels: HTMLDivElement[] = [];
  const initial =
    options.selected !== undefined
      ? Math.max(
          0,
          options.items.findIndex((it) => it.id === options.selected),
        )
      : 0;
  let activeIndex = options.items.length === 0 ? 0 : Math.min(initial, options.items.length - 1);

  options.items.forEach((item, index) => {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dt-tabs__trigger';
    trigger.id = `${item.id}-tab`;
    trigger.textContent = item.label;
    trigger.setAttribute('role', 'tab');
    trigger.setAttribute('aria-controls', `${item.id}-panel`);
    trigger.dataset.value = item.id;
    trigger.addEventListener('click', () => activate(index));
    trigger.addEventListener('keydown', onKeyDown);
    triggers.push(trigger);
    list.appendChild(trigger);

    const panel = document.createElement('div');
    panel.className = 'dt-tabs__panel';
    panel.id = `${item.id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${item.id}-tab`);
    panel.appendChild(item.content);
    panels.push(panel);
  });

  applyActive(activeIndex);
  root.appendChild(list);
  for (const panel of panels) root.appendChild(panel);

  function onKeyDown(event: KeyboardEvent): void {
    const max = options.items.length - 1;
    let next = activeIndex;
    if (event.key === 'ArrowRight') next = activeIndex === max ? 0 : activeIndex + 1;
    else if (event.key === 'ArrowLeft') next = activeIndex === 0 ? max : activeIndex - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = max;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      return;
    } else return;
    event.preventDefault();
    activate(next);
    triggers[activeIndex]?.focus();
  }

  function activate(nextIndex: number): void {
    if (nextIndex === activeIndex || options.items.length === 0) return;
    activeIndex = nextIndex;
    applyActive(activeIndex);
    const item = options.items[activeIndex];
    if (item === undefined) return;
    options.onChange?.(item.id);
    root.dispatchEvent(
      new CustomEvent<TabsChangeDetail>('dt-tabs-change', {
        bubbles: true,
        detail: { id: item.id, index: activeIndex },
      }),
    );
  }

  function applyActive(index: number): void {
    triggers.forEach((trigger, i) => {
      const isActive = i === index;
      trigger.dataset.state = isActive ? 'active' : 'inactive';
      trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
      trigger.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      const isActive = i === index;
      panel.dataset.state = isActive ? 'active' : 'inactive';
      panel.hidden = !isActive;
    });
  }

  return root;
}
