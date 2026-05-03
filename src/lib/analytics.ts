/**
 * Analytics call site backed by GTM `dataLayer`.
 *
 * Privacy: NEVER pass raw tool inputs into `props`. Use derived metadata
 * only (length buckets, mode flags, durations). The GTM container script
 * is loaded lazily elsewhere — this module just queues events.
 */
import { isAllowed } from './consent';

interface DataLayerWindow extends Window {
  dataLayer?: Record<string, unknown>[];
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!isAllowed()) return;
  const w = window as DataLayerWindow;
  if (!Array.isArray(w.dataLayer)) return;
  w.dataLayer.push({ event, ...(props ?? {}) });
}
