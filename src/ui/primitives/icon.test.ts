import { describe, expect, it } from 'vitest';
import { icon } from './icon';

describe('icon', () => {
  it('returns a span carrying the dt-icon class', () => {
    const el = icon('copy');
    expect(el.tagName).toBe('SPAN');
    expect(el.classList.contains('dt-icon')).toBe(true);
  });

  it('renders an inline SVG inside', () => {
    const el = icon('check');
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('respects the size option', () => {
    const el = icon('search', { size: 24 });
    expect(el.style.width).toBe('24px');
    expect(el.style.height).toBe('24px');
  });

  it('marks aria-hidden by default', () => {
    expect(icon('x').getAttribute('aria-hidden')).toBe('true');
  });

  it('applies the ariaLabel and removes aria-hidden when given', () => {
    const el = icon('github', { ariaLabel: 'GitHub' });
    expect(el.getAttribute('aria-label')).toBe('GitHub');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });
});
