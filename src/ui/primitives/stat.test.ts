import { describe, expect, it } from 'vitest';
import { stat, statGrid } from './stat';

describe('stat', () => {
  it('renders label and value', () => {
    const el = stat({ label: 'Shipped', value: '42' });
    expect(el.classList.contains('dt-stat')).toBe(true);
    expect(el.querySelector('.dt-stat__label')?.textContent).toBe('Shipped');
    expect(el.querySelector('.dt-stat__value')?.textContent).toBe('42');
    expect(el.querySelector('.dt-stat__delta')).toBeNull();
  });

  it('renders delta with up trend when deltaPositive is true', () => {
    const el = stat({ label: 'Up', value: '10', delta: '+1', deltaPositive: true });
    const delta = el.querySelector<HTMLElement>('.dt-stat__delta');
    expect(delta?.textContent).toBe('+1');
    expect(delta?.dataset.trend).toBe('up');
  });

  it('renders delta with down trend when deltaPositive is false', () => {
    const el = stat({ label: 'Down', value: '5', delta: '-2', deltaPositive: false });
    const delta = el.querySelector<HTMLElement>('.dt-stat__delta');
    expect(delta?.dataset.trend).toBe('down');
  });

  it('renders delta without trend attr when deltaPositive omitted', () => {
    const el = stat({ label: 'Steady', value: '7', delta: 'no change' });
    const delta = el.querySelector<HTMLElement>('.dt-stat__delta');
    expect(delta?.textContent).toBe('no change');
    expect(delta?.dataset.trend).toBeUndefined();
  });
});

describe('statGrid', () => {
  it('wraps multiple stats inside .dt-stat-grid', () => {
    const el = statGrid({
      stats: [
        { label: 'A', value: '1' },
        { label: 'B', value: '2' },
        { label: 'C', value: '3' },
      ],
    });
    expect(el.classList.contains('dt-stat-grid')).toBe(true);
    expect(el.querySelectorAll('.dt-stat')).toHaveLength(3);
  });

  it('renders an empty grid for zero stats', () => {
    const el = statGrid({ stats: [] });
    expect(el.querySelectorAll('.dt-stat')).toHaveLength(0);
  });
});
