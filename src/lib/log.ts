/**
 * Consola-backed logger.
 *
 * Privacy contract: NEVER log raw tool inputs. If you must reference user
 * data, pass it through {@link mask} first or summarize (length, type).
 */
import { createConsola, type ConsolaInstance } from 'consola';

type Level = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LEVEL_MAP: Record<Level, number> = {
  silent: -1,
  fatal: 0,
  error: 0,
  warn: 1,
  info: 3,
  debug: 4,
  trace: 5,
};

function resolveLevel(): number {
  // SSR / Node script context: fall back to env defaults.
  if (typeof window === 'undefined') {
    return import.meta.env?.DEV ? LEVEL_MAP.debug : LEVEL_MAP.info;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1') return LEVEL_MAP.debug;
    if (window.localStorage?.getItem('dt.log') === 'debug') return LEVEL_MAP.debug;
  } catch {
    // localStorage / URL access can throw in restricted contexts; ignore.
  }
  return import.meta.env?.DEV ? LEVEL_MAP.debug : LEVEL_MAP.info;
}

export const logger: ConsolaInstance = createConsola({
  level: resolveLevel(),
  defaults: { tag: 'dt' },
});

/** Tagged child logger. Tags surface as a prefix on each line. */
export function getLogger(tag: string): ConsolaInstance {
  return logger.withTag(tag);
}

/**
 * Mask all but the last `keep` characters of `value` for safe log output.
 * Returns `'****'` when `value` is shorter than or equal to `keep`.
 */
export function mask(value: string, keep = 4): string {
  if (!value) return '';
  if (value.length <= keep) return '****';
  const tail = value.slice(-keep);
  return `${'*'.repeat(value.length - keep)}${tail}`;
}
