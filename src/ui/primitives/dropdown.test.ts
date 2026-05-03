import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dropdown } from './dropdown';

type Color = 'red' | 'blue' | 'green';

describe('dropdown', () => {
  let host: HTMLElement;
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    trigger = document.createElement('button');
    trigger.textContent = 'Pick';
    host.appendChild(trigger);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('does not render the menu until the trigger is clicked', () => {
    const handle = dropdown<Color>({
      trigger,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
      ],
      value: 'red',
      onChange: () => undefined,
    });
    expect(document.querySelector('.dt-dropdown__menu')).toBeNull();
    handle.dispose();
  });

  it('opens the menu on trigger click and closes on outside click', () => {
    const handle = dropdown<Color>({
      trigger,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
      ],
      value: 'red',
      onChange: () => undefined,
    });
    trigger.click();
    expect(document.querySelector('.dt-dropdown__menu')).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    document.body.click();
    expect(document.querySelector('.dt-dropdown__menu')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    handle.dispose();
  });

  it('closes the menu on Escape', () => {
    const handle = dropdown<Color>({
      trigger,
      options: [{ value: 'red', label: 'Red' }],
      value: 'red',
      onChange: () => undefined,
    });
    trigger.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.dt-dropdown__menu')).toBeNull();
    handle.dispose();
  });

  it('calls onChange with the selected value and closes', () => {
    const handler = vi.fn();
    const handle = dropdown<Color>({
      trigger,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
      ],
      value: 'red',
      onChange: handler,
    });
    trigger.click();
    const blue = document.querySelectorAll<HTMLButtonElement>('.dt-dropdown__item')[1];
    blue?.click();
    expect(handler).toHaveBeenCalledWith('blue');
    expect(document.querySelector('.dt-dropdown__menu')).toBeNull();
    handle.dispose();
  });

  it('marks the active value in the rendered list', () => {
    const handle = dropdown<Color>({
      trigger,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
      ],
      value: 'blue',
      onChange: () => undefined,
    });
    trigger.click();
    const items = document.querySelectorAll('.dt-dropdown__item');
    expect(items[0]?.classList.contains('dt-dropdown__item--active')).toBe(false);
    expect(items[1]?.classList.contains('dt-dropdown__item--active')).toBe(true);
    handle.dispose();
  });

  it('dispose() detaches listeners', () => {
    const handler = vi.fn();
    const handle = dropdown<Color>({
      trigger,
      options: [{ value: 'red', label: 'Red' }],
      value: 'red',
      onChange: handler,
    });
    handle.dispose();
    trigger.click();
    expect(document.querySelector('.dt-dropdown__menu')).toBeNull();
  });
});
