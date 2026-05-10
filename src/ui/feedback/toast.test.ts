import { afterEach, describe, expect, it, vi } from 'vitest';
import { __clearToasts, toast } from './toast';

afterEach(() => {
  __clearToasts();
  vi.useRealTimers();
});

describe('toast', () => {
  it('mounts into the singleton portal with the message text', () => {
    const handle = toast('Saved!');
    const portal = document.getElementById('dt-toast-portal');
    expect(portal).not.toBeNull();
    expect(portal?.querySelector('.dt-toast__body')?.textContent).toBe('Saved!');
    expect(handle.el.dataset.tone).toBe('neutral');
  });

  it('applies tone via data-tone', () => {
    const handle = toast('Boom', { tone: 'error' });
    expect(handle.el.dataset.tone).toBe('error');
    expect(handle.el.getAttribute('role')).toBe('alert');
    expect(handle.el.getAttribute('aria-live')).toBe('assertive');
  });

  it('defaults success/info/neutral to role=status + aria-live=polite', () => {
    const success = toast('Ok', { tone: 'success' });
    expect(success.el.getAttribute('role')).toBe('status');
    expect(success.el.getAttribute('aria-live')).toBe('polite');
  });

  it('auto-dismisses after the duration', () => {
    vi.useFakeTimers();
    const handle = toast('Bye', { duration: 1_000 });
    const portal = document.getElementById('dt-toast-portal');
    expect(portal?.contains(handle.el)).toBe(true);
    vi.advanceTimersByTime(1_000);
    // Wait for the 200ms exit transition
    vi.advanceTimersByTime(200);
    expect(portal?.contains(handle.el)).toBe(false);
  });

  it('manual dismiss removes the toast', () => {
    vi.useFakeTimers();
    const handle = toast('Manual');
    handle.dismiss();
    vi.advanceTimersByTime(200);
    expect(document.getElementById('dt-toast-portal')?.contains(handle.el)).toBe(false);
  });

  it('stacks multiple toasts in order', () => {
    toast('first');
    toast('second');
    toast('third');
    const bodies = Array.from(
      document.querySelectorAll<HTMLElement>('#dt-toast-portal .dt-toast__body'),
    );
    expect(bodies.map((b) => b.textContent)).toEqual(['first', 'second', 'third']);
  });

  it('dismiss button removes the toast', () => {
    vi.useFakeTimers();
    const handle = toast('Click me');
    handle.el.querySelector<HTMLButtonElement>('.dt-toast__dismiss')?.click();
    vi.advanceTimersByTime(200);
    expect(document.getElementById('dt-toast-portal')?.contains(handle.el)).toBe(false);
  });

  it('duration <= 0 disables auto-dismiss', () => {
    vi.useFakeTimers();
    const handle = toast('Sticky', { duration: 0 });
    vi.advanceTimersByTime(10_000);
    expect(document.getElementById('dt-toast-portal')?.contains(handle.el)).toBe(true);
    handle.dismiss();
  });
});
