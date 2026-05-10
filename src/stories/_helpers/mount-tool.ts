/**
 * Bridge between the live app's tool render contract and Storybook's
 * "return an HTMLElement" expectation.
 *
 * Tools expose `render(host: HTMLElement, initial: S): { dispose }` —
 * they mount onto a host element and return a disposer. Stories need
 * to return a single HTMLElement that Storybook will inject into the
 * preview iframe.
 *
 * `mountTool` creates a wrapper element, calls the tool's `render` into
 * it, and stashes the disposer on the wrapper for Storybook to clean
 * up later via `dt-story-host` MutationObserver semantics.
 */

import type { ToolModule } from '../../lib/types';

type Disposable = HTMLDivElement & {
  __dtDispose?: () => void;
};

export function mountTool<S>(tool: ToolModule<S>, initial: S): HTMLDivElement {
  const host: Disposable = document.createElement('div');
  host.className = 'dt-story-host';
  const handle = tool.render(host, initial);
  // Wrap the disposer so detaching the method from its owner doesn't lose
  // the `this` binding (silenced by typescript-eslint `unbound-method`).
  host.__dtDispose = (): void => {
    handle.dispose();
  };

  // Best-effort cleanup: when the host detaches from the DOM, fire the
  // disposer. Useful for hot-reload + story-switch flows where Storybook
  // discards the previous iframe content.
  const observer = new MutationObserver(() => {
    if (!host.isConnected) {
      handle.dispose();
      observer.disconnect();
    }
  });
  // Observe the parent (set once Storybook attaches the host).
  queueMicrotask(() => {
    if (host.parentNode !== null) {
      observer.observe(host.parentNode, { childList: true });
    }
  });

  return host;
}
