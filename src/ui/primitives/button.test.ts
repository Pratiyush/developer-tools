import { describe, expect, it, vi } from 'vitest';
import { button } from './button';

describe('button', () => {
  it('renders a labeled secondary button by default', () => {
    const el = button({ label: 'Save' });
    expect(el.tagName).toBe('BUTTON');
    expect(el.type).toBe('button');
    expect(el.classList.contains('dt-btn')).toBe(true);
    expect(el.classList.contains('dt-btn--secondary')).toBe(false);
    expect(el.textContent).toContain('Save');
  });

  it('applies a variant class for primary / ghost / icon', () => {
    expect(button({ label: 'Go', variant: 'primary' }).classList.contains('dt-btn--primary')).toBe(
      true,
    );
    expect(button({ label: '×', variant: 'icon' }).classList.contains('dt-btn--icon')).toBe(true);
    expect(button({ label: '×', variant: 'ghost' }).classList.contains('dt-btn--ghost')).toBe(true);
  });

  it('hooks the onClick handler', () => {
    const handler = vi.fn();
    const el = button({ label: 'Click', onClick: handler });
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sets disabled when requested', () => {
    const el = button({ label: 'No', disabled: true });
    expect(el.disabled).toBe(true);
  });

  it('uses the explicit ariaLabel over the text label', () => {
    const el = button({ iconName: 'copy', variant: 'icon', ariaLabel: 'Copy URL' });
    expect(el.getAttribute('aria-label')).toBe('Copy URL');
  });
});
