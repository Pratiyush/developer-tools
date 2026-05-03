import { describe, expect, it, vi } from 'vitest';
import { textarea } from './textarea';

describe('textarea', () => {
  it('renders a 5-row textarea by default', () => {
    const el = textarea();
    expect(el.tagName).toBe('TEXTAREA');
    expect(el.rows).toBe(5);
    expect(el.classList.contains('dt-textarea')).toBe(true);
  });

  it('accepts an initial value and rows override', () => {
    const el = textarea({ value: 'seed', rows: 10 });
    expect(el.value).toBe('seed');
    expect(el.rows).toBe(10);
  });

  it('fires onInput with the new value', () => {
    const handler = vi.fn();
    const el = textarea({ onInput: handler });
    el.value = 'hello';
    el.dispatchEvent(new Event('input'));
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('marks readonly when requested', () => {
    expect(textarea({ readonly: true }).readOnly).toBe(true);
  });
});
