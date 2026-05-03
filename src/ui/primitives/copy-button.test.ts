import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyButton } from './copy-button';

describe('copyButton', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(() => Promise.resolve()) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders a button with the default label', () => {
    const handle = copyButton({ text: () => 'hello' });
    expect(handle.el.tagName).toBe('BUTTON');
    expect(handle.el.classList.contains('dt-copy')).toBe(true);
    expect(handle.el.textContent).toContain('Copy');
    handle.dispose();
  });

  it('copies the text returned by the getter', async () => {
    const handle = copyButton({ text: () => 'payload' });
    handle.el.click();
    await Promise.resolve();
    await Promise.resolve();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- vi.mocked inspects the mock; never invokes it
    expect(vi.mocked(navigator.clipboard.writeText)).toHaveBeenCalledWith('payload');
    handle.dispose();
  });

  it('flips into copied state after a successful copy', async () => {
    const handle = copyButton({ text: () => 'x', resetMs: 1000 });
    handle.el.click();
    // Wait for the click handler's async chain to complete.
    await vi.waitFor(() => {
      expect(handle.el.classList.contains('dt-copy--copied')).toBe(true);
    });
    expect(handle.el.textContent).toContain('Copied');
    handle.dispose();
  });

  it('reverts to the original label after the reset timeout', async () => {
    const handle = copyButton({ text: () => 'x', resetMs: 60 });
    handle.el.click();
    await vi.waitFor(() => {
      expect(handle.el.classList.contains('dt-copy--copied')).toBe(true);
    });
    await vi.waitFor(
      () => {
        expect(handle.el.classList.contains('dt-copy--copied')).toBe(false);
      },
      { timeout: 1000 },
    );
    expect(handle.el.textContent).toContain('Copy');
    handle.dispose();
  });

  it('dispose() clears the timer and detaches the listener', () => {
    const handle = copyButton({ text: () => 'x' });
    handle.dispose();
    handle.el.click();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- vi.mocked inspects the mock; never invokes it
    expect(vi.mocked(navigator.clipboard.writeText)).not.toHaveBeenCalled();
  });
});
