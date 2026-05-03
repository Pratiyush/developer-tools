/**
 * Consent gate for analytics. Stores user choice in `localStorage` under
 * `dt.consent`. Honours `navigator.doNotTrack === '1'` unconditionally.
 */

const STORAGE_KEY = 'dt.consent';

export type ConsentValue = 'all' | 'rejected' | 'unset';

type Listener = (v: ConsentValue) => void;
const listeners = new Set<Listener>();

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getConsent(): ConsentValue {
  const raw = safeStorage()?.getItem(STORAGE_KEY);
  if (raw === 'all' || raw === 'rejected') return raw;
  return 'unset';
}

export function setConsent(v: 'all' | 'rejected'): void {
  const store = safeStorage();
  if (store) {
    try {
      store.setItem(STORAGE_KEY, v);
    } catch {
      // Quota or privacy-mode error — listeners still fire so UI can react.
    }
  }
  for (const cb of listeners) cb(v);
}

export function isAllowed(): boolean {
  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
    return false;
  }
  return getConsent() === 'all';
}

/**
 * Subscribe to consent changes. Fires on `setConsent` and on cross-tab
 * `storage` events. Returns an unsubscribe function.
 */
export function onConsentChange(cb: Listener): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent): void => {
    if (e.key === STORAGE_KEY) cb(getConsent());
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return (): void => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}
