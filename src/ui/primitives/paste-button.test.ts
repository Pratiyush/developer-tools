import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pasteButton } from './paste-button';

function noop(): void {
  // empty handler used for tests that don't observe the paste payload
}

describe('pasteButton', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText: vi.fn(() => Promise.resolve('clipboard-payload')) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders a button with the default label', () => {
    const handle = pasteButton({ onPaste: noop });
    expect(handle.el.tagName).toBe('BUTTON');
    expect(handle.el.classList.contains('dt-paste')).toBe(true);
    expect(handle.el.textContent).toContain('Paste');
    handle.dispose();
  });

  it('reads the clipboard and forwards the text to onPaste', async () => {
    const onPaste = vi.fn();
    const handle = pasteButton({ onPaste });
    handle.el.click();
    await vi.waitFor(() => {
      expect(onPaste).toHaveBeenCalledWith('clipboard-payload');
    });
    handle.dispose();
  });

  it('flips into pasted state after a successful read', async () => {
    const handle = pasteButton({ onPaste: noop, resetMs: 1000 });
    handle.el.click();
    await vi.waitFor(() => {
      expect(handle.el.classList.contains('dt-paste--pasted')).toBe(true);
    });
    expect(handle.el.textContent).toContain('Pasted');
    handle.dispose();
  });

  it('reverts to the original label after the reset timeout', async () => {
    const handle = pasteButton({ onPaste: noop, resetMs: 60 });
    handle.el.click();
    await vi.waitFor(() => {
      expect(handle.el.classList.contains('dt-paste--pasted')).toBe(true);
    });
    await vi.waitFor(
      () => {
        expect(handle.el.classList.contains('dt-paste--pasted')).toBe(false);
      },
      { timeout: 1000 },
    );
    expect(handle.el.textContent).toContain('Paste');
    handle.dispose();
  });

  it('forwards clipboard errors to onError without throwing', async () => {
    const failure = new Error('denied');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText: vi.fn(() => Promise.reject(failure)) },
    });
    const onPaste = vi.fn();
    const onError = vi.fn();
    const handle = pasteButton({ onPaste, onError });
    handle.el.click();
    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(failure);
    });
    expect(onPaste).not.toHaveBeenCalled();
    expect(handle.el.classList.contains('dt-paste--pasted')).toBe(false);
    handle.dispose();
  });

  it('dispose() clears the timer and detaches the listener', () => {
    const handle = pasteButton({ onPaste: noop });
    handle.dispose();
    handle.el.click();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- vi.mocked inspects the mock; never invokes it
    expect(vi.mocked(navigator.clipboard.readText)).not.toHaveBeenCalled();
  });
});
