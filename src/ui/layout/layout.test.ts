import { describe, expect, it } from 'vitest';
import { grid } from './grid';
import { formGrid } from './form-grid';
import { push } from './push';
import { grow } from './grow';

describe('grid', () => {
  it('defaults cols to 1 and gap to md', () => {
    const el = grid();
    expect(el.classList.contains('dt-grid')).toBe(true);
    expect(el.dataset.cols).toBe('1');
    expect(el.dataset.gap).toBe('md');
  });

  it('clamps invalid cols to 1', () => {
    const el = grid({ cols: 0 });
    expect(el.dataset.cols).toBe('1');
  });

  it('writes provided cols and gap', () => {
    const el = grid({ cols: 4, gap: 'lg' });
    expect(el.dataset.cols).toBe('4');
    expect(el.dataset.gap).toBe('lg');
  });

  it('appends children in order', () => {
    const a = document.createElement('span');
    const b = document.createElement('span');
    const el = grid({ children: [a, b] });
    expect(el.children).toHaveLength(2);
    expect(el.children[0]).toBe(a);
    expect(el.children[1]).toBe(b);
  });
});

describe('formGrid', () => {
  it('renders one label/field pair per entry', () => {
    const f1 = document.createElement('input');
    f1.id = 'in1';
    const f2 = document.createElement('input');
    f2.id = 'in2';
    const el = formGrid({
      entries: [
        { label: 'Name', field: f1 },
        { label: 'Email', field: f2 },
      ],
    });
    const labels = el.querySelectorAll<HTMLLabelElement>('.dt-form-grid__label');
    const fields = el.querySelectorAll('.dt-form-grid__field');
    expect(labels).toHaveLength(2);
    expect(fields).toHaveLength(2);
    expect(labels[0]?.htmlFor).toBe('in1');
    expect(labels[1]?.htmlFor).toBe('in2');
  });

  it('skips htmlFor when the field has no id', () => {
    const f = document.createElement('input');
    const el = formGrid({ entries: [{ label: 'X', field: f }] });
    const label = el.querySelector<HTMLLabelElement>('.dt-form-grid__label');
    expect(label?.htmlFor).toBe('');
  });

  it('renders hint when provided', () => {
    const f = document.createElement('input');
    f.id = 'h';
    const el = formGrid({ entries: [{ label: 'X', field: f, hint: 'Optional' }] });
    expect(el.querySelector('.dt-form-grid__hint')?.textContent).toBe('Optional');
  });
});

describe('push', () => {
  it('renders a hidden spacer', () => {
    const el = push();
    expect(el.classList.contains('dt-push')).toBe(true);
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('grow', () => {
  it('renders an empty .dt-grow when no children', () => {
    const el = grow();
    expect(el.classList.contains('dt-grow')).toBe(true);
    expect(el.children).toHaveLength(0);
  });

  it('appends children in order', () => {
    const a = document.createElement('span');
    const b = document.createElement('span');
    const el = grow({ children: [a, b] });
    expect(el.children).toHaveLength(2);
  });
});
