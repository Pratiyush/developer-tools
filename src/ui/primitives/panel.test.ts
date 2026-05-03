import { describe, expect, it } from 'vitest';
import { panel } from './panel';

describe('panel', () => {
  it('wraps body in a section.dt-panel', () => {
    const body = document.createElement('div');
    body.textContent = 'inside';
    const el = panel({ body });
    expect(el.tagName).toBe('SECTION');
    expect(el.classList.contains('dt-panel')).toBe(true);
    expect(el.contains(body)).toBe(true);
  });

  it('renders the label above the body when provided', () => {
    const el = panel({ label: 'Input', body: document.createElement('div') });
    const label = el.querySelector('.dt-panel__label');
    expect(label?.textContent).toBe('Input');
  });

  it('accepts a string body and wraps it', () => {
    const el = panel({ body: 'plain text' });
    expect(el.textContent).toContain('plain text');
  });

  it('appends an extra className when given', () => {
    const el = panel({ body: '', className: 'custom' });
    expect(el.classList.contains('custom')).toBe(true);
  });
});
