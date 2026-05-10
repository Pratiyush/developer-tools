import { describe, expect, it } from 'vitest';
import { status } from './status';

describe('status', () => {
  it('renders label inside a .dt-status span with data-tone', () => {
    const el = status({ label: 'Active', tone: 'success' });
    expect(el.tagName).toBe('SPAN');
    expect(el.classList.contains('dt-status')).toBe(true);
    expect(el.dataset.tone).toBe('success');
    expect(el.querySelector('.dt-status__label')?.textContent).toBe('Active');
  });

  it('defaults tone to neutral when omitted', () => {
    const el = status({ label: 'Idle' });
    expect(el.dataset.tone).toBe('neutral');
  });

  it('inserts an icon element when provided and tags it', () => {
    const icon = document.createElement('svg');
    const el = status({ label: 'Warn', tone: 'warning', icon });
    const inserted = el.querySelector('.dt-status__icon');
    expect(inserted).toBe(icon);
  });

  it('renders without an icon when none is given', () => {
    const el = status({ label: 'Plain' });
    expect(el.querySelector('.dt-status__icon')).toBeNull();
  });
});
