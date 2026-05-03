import { describe, expect, it, vi } from 'vitest';
import { input } from './input';

describe('input', () => {
  it('renders a text input by default', () => {
    const el = input();
    expect(el.tagName).toBe('INPUT');
    expect(el.type).toBe('text');
    expect(el.classList.contains('dt-input')).toBe(true);
  });

  it('accepts an initial value and placeholder', () => {
    const el = input({ value: 'seed', placeholder: 'type…' });
    expect(el.value).toBe('seed');
    expect(el.placeholder).toBe('type…');
  });

  it('fires onInput with the new value', () => {
    const handler = vi.fn();
    const el = input({ onInput: handler });
    el.value = 'hi';
    el.dispatchEvent(new Event('input'));
    expect(handler).toHaveBeenCalledWith('hi');
  });

  it('switches to type=search when requested', () => {
    expect(input({ type: 'search' }).type).toBe('search');
  });

  it('sets aria-label when provided', () => {
    expect(input({ ariaLabel: 'Search' }).getAttribute('aria-label')).toBe('Search');
  });
});
