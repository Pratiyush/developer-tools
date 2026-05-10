import { describe, expect, it } from 'vitest';
import { tabs, type TabsChangeDetail } from './tabs';

function makeItems(): { id: string; label: string; content: HTMLElement }[] {
  const make = (id: string): { id: string; label: string; content: HTMLElement } => {
    const content = document.createElement('div');
    content.textContent = `${id}-content`;
    return { id, label: id.toUpperCase(), content };
  };
  return [make('a'), make('b'), make('c')];
}

function active(root: HTMLElement): string | undefined {
  const trigger = root.querySelector<HTMLButtonElement>('[data-state="active"][role="tab"]');
  return trigger?.dataset.value;
}

describe('tabs', () => {
  it('renders one trigger + one panel per item with the first selected', () => {
    const el = tabs({ items: makeItems() });
    expect(el.querySelectorAll('[role="tab"]')).toHaveLength(3);
    expect(el.querySelectorAll('[role="tabpanel"]')).toHaveLength(3);
    expect(active(el)).toBe('a');
    expect(el.querySelector('#a-panel')?.getAttribute('aria-labelledby')).toBe('a-tab');
  });

  it('honors initial selected id', () => {
    const el = tabs({ items: makeItems(), selected: 'c' });
    expect(active(el)).toBe('c');
  });

  it('writes tone class for pill variant', () => {
    const el = tabs({ items: makeItems(), tone: 'pill' });
    expect(el.classList.contains('dt-tabs--pill')).toBe(true);
  });

  it('cycles selection on click + fires dt-tabs-change', () => {
    const el = tabs({ items: makeItems() });
    const seen: TabsChangeDetail[] = [];
    el.addEventListener('dt-tabs-change', (e) =>
      seen.push((e as CustomEvent<TabsChangeDetail>).detail),
    );
    el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
    expect(active(el)).toBe('b');
    expect(seen).toEqual([{ id: 'b', index: 1 }]);
  });

  it('ArrowRight wraps last → first', () => {
    const el = tabs({ items: makeItems(), selected: 'c' });
    el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[2]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(active(el)).toBe('a');
  });

  it('Home / End jump', () => {
    const el = tabs({ items: makeItems() });
    el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    expect(active(el)).toBe('c');
    el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[2]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    expect(active(el)).toBe('a');
  });

  it('aria-selected + tabindex track the active tab', () => {
    const el = tabs({ items: makeItems() });
    const triggers = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    expect(triggers.map((t) => t.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
      'false',
    ]);
    expect(triggers.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
  });

  it('hides inactive panels', () => {
    const el = tabs({ items: makeItems() });
    const panels = Array.from(el.querySelectorAll<HTMLDivElement>('[role="tabpanel"]'));
    expect(panels.map((p) => p.hidden)).toEqual([false, true, true]);
  });

  it('calls onChange', () => {
    const calls: string[] = [];
    const el = tabs({ items: makeItems(), onChange: (id) => calls.push(id) });
    el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[2]?.click();
    expect(calls).toEqual(['c']);
  });
});
