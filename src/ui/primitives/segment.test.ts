import { describe, expect, it } from 'vitest';
import { segment, type SegmentChangeDetail } from './segment';

function selected(root: HTMLElement): number {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.dt-segment__item'));
  return buttons.findIndex((b) => b.dataset.state === 'active');
}

describe('segment', () => {
  it('renders one button per item with the first selected by default', () => {
    const el = segment({ items: ['One', 'Two', 'Three'] });
    const buttons = el.querySelectorAll<HTMLButtonElement>('.dt-segment__item');
    expect(buttons).toHaveLength(3);
    expect(selected(el)).toBe(0);
    expect(buttons[0]?.getAttribute('aria-selected')).toBe('true');
    expect(buttons[1]?.getAttribute('aria-selected')).toBe('false');
  });

  it('honors initial selected index', () => {
    const el = segment({ items: ['A', 'B', 'C'], selected: 2 });
    expect(selected(el)).toBe(2);
  });

  it('clamps out-of-range initial index', () => {
    const el = segment({ items: ['A', 'B'], selected: 99 });
    expect(selected(el)).toBe(1);
  });

  it('writes data-tone attribute', () => {
    const el = segment({ items: ['A'], tone: 'secondary' });
    expect(el.dataset.tone).toBe('secondary');
    expect(el.classList.contains('dt-segment--secondary')).toBe(true);
  });

  it('cycles selection on click and fires dt-segment-change', () => {
    const el = segment({ items: ['A', 'B', 'C'] });
    const seen: SegmentChangeDetail[] = [];
    el.addEventListener('dt-segment-change', (e) =>
      seen.push((e as CustomEvent<SegmentChangeDetail>).detail),
    );
    const buttons = el.querySelectorAll<HTMLButtonElement>('.dt-segment__item');
    buttons[1]?.click();
    expect(selected(el)).toBe(1);
    expect(seen).toEqual([{ index: 1, value: 'B' }]);
  });

  it('ArrowRight wraps from last to first', () => {
    const el = segment({ items: ['A', 'B', 'C'], selected: 2 });
    const last = el.querySelectorAll<HTMLButtonElement>('.dt-segment__item')[2];
    last?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(selected(el)).toBe(0);
  });

  it('ArrowLeft wraps from first to last', () => {
    const el = segment({ items: ['A', 'B', 'C'] });
    const first = el.querySelectorAll<HTMLButtonElement>('.dt-segment__item')[0];
    first?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(selected(el)).toBe(2);
  });

  it('Home / End jump to first / last', () => {
    const el = segment({ items: ['A', 'B', 'C'] });
    const second = el.querySelectorAll<HTMLButtonElement>('.dt-segment__item')[1];
    second?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(selected(el)).toBe(2);
    const last = el.querySelectorAll<HTMLButtonElement>('.dt-segment__item')[2];
    last?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(selected(el)).toBe(0);
  });

  it('invokes onChange callback', () => {
    const calls: number[] = [];
    const el = segment({ items: ['A', 'B'], onChange: (i) => calls.push(i) });
    el.querySelectorAll<HTMLButtonElement>('.dt-segment__item')[1]?.click();
    expect(calls).toEqual([1]);
  });

  it('uses ariaLabel when provided', () => {
    const el = segment({ items: ['A'], ariaLabel: 'Encoding' });
    expect(el.getAttribute('aria-label')).toBe('Encoding');
  });
});
