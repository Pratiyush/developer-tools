/**
 * SB-24 (#62) — Toast queue.
 *
 * Headless API: `toast(message, options?)` mounts a temporary toast
 * element in a singleton portal at the document root and auto-dismisses
 * after `options.duration ?? 4000` ms. Subsequent calls stack visually
 * in the portal — newest at the bottom.
 *
 * Manual control: the call returns a `{ dismiss }` handle so the caller
 * can close early (e.g. cancellation on user action).
 */

export type ToastTone = 'success' | 'error' | 'info' | 'neutral';

export interface ToastOptions {
  readonly tone?: ToastTone;
  readonly duration?: number;
  readonly ariaLive?: 'polite' | 'assertive';
}

export interface ToastHandle {
  readonly el: HTMLDivElement;
  dismiss(): void;
}

const PORTAL_ID = 'dt-toast-portal';
const DEFAULT_DURATION = 4_000;

function ensurePortal(): HTMLElement {
  const existing = document.getElementById(PORTAL_ID);
  if (existing !== null) return existing;
  const portal = document.createElement('div');
  portal.id = PORTAL_ID;
  portal.className = 'dt-toast-portal';
  portal.setAttribute('role', 'region');
  portal.setAttribute('aria-label', 'Notifications');
  document.body.appendChild(portal);
  return portal;
}

export function toast(message: string, options: ToastOptions = {}): ToastHandle {
  const portal = ensurePortal();

  const el = document.createElement('div');
  el.className = 'dt-toast';
  el.dataset.tone = options.tone ?? 'neutral';
  el.dataset.state = 'enter';
  el.setAttribute('role', options.tone === 'error' ? 'alert' : 'status');
  el.setAttribute(
    'aria-live',
    options.ariaLive ?? (options.tone === 'error' ? 'assertive' : 'polite'),
  );

  const body = document.createElement('span');
  body.className = 'dt-toast__body';
  body.textContent = message;
  el.appendChild(body);

  const dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'dt-toast__dismiss';
  dismissBtn.setAttribute('aria-label', 'Dismiss notification');
  dismissBtn.textContent = '×';
  el.appendChild(dismissBtn);

  portal.appendChild(el);

  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const dismiss = (): void => {
    if (disposed) return;
    disposed = true;
    if (timer !== undefined) clearTimeout(timer);
    el.dataset.state = 'exit';
    // Allow CSS transition to play; remove after one frame budget.
    setTimeout(() => {
      if (el.parentNode === portal) portal.removeChild(el);
    }, 200);
  };

  dismissBtn.addEventListener('click', dismiss);

  const duration = options.duration ?? DEFAULT_DURATION;
  if (duration > 0) {
    timer = setTimeout(dismiss, duration);
  }

  return { el, dismiss };
}

/**
 * Removes the portal node and any toasts in it. Useful for tests; in
 * production the portal naturally drains as toasts auto-dismiss.
 */
export function __clearToasts(): void {
  const portal = document.getElementById(PORTAL_ID);
  if (portal !== null && portal.parentNode !== null) portal.parentNode.removeChild(portal);
}
