/**
 * UUID v4 generator.
 *
 * Backed by `crypto.randomUUID()` when available (every modern browser +
 * Node 19+). Falls back to a manual CSPRNG-driven implementation for
 * older runtimes — produces identical RFC 4122 §4.4 output.
 */

export type UuidCase = 'lower' | 'upper';
export type UuidFormat = 'hyphen' | 'plain' | 'braces' | 'urn';

export interface FormatOptions {
  readonly case: UuidCase;
  readonly format: UuidFormat;
}

/** Generate one v4 UUID. Always returns 36-char canonical lowercase. */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return manualUuid();
}

/** Generate `count` UUIDs. Useful for bulk seeding. */
export function generateUuids(count: number): readonly string[] {
  if (!Number.isInteger(count) || count < 1) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(generateUuid());
  return out;
}

/**
 * Apply a case + bracket format to an existing canonical UUID. Idempotent
 * for case (UPPER → UPPER stays UPPER) and lossless across formats.
 */
export function formatUuid(uuid: string, opts: FormatOptions): string {
  const canonical = uuid.toLowerCase();
  const stripped = canonical.replace(/-/g, '');
  let core: string;
  switch (opts.format) {
    case 'plain':
      core = stripped;
      break;
    case 'braces':
      core = `{${canonical}}`;
      break;
    case 'urn':
      core = `urn:uuid:${canonical}`;
      break;
    case 'hyphen':
    default:
      core = canonical;
      break;
  }
  return opts.case === 'upper' ? core.toUpperCase() : core;
}

/** Validate canonical hyphenated UUID with relaxed case. */
export function isValidUuid(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.trim());
}

export interface UuidAnatomy {
  readonly timeLow: string;
  readonly timeMid: string;
  readonly timeHiAndVersion: string;
  readonly clockSeqHiAndReserved: string;
  readonly clockSeqLow: string;
  readonly node: string;
  readonly version: number;
  /** Human-readable variant per RFC 4122 §4.1.1. */
  readonly variant: 'NCS' | 'RFC 4122' | 'Microsoft' | 'reserved';
}

/** Decompose a canonical hyphenated UUID into its RFC 4122 fields. */
export function parseUuidAnatomy(input: string): UuidAnatomy | null {
  const t = input.trim().toLowerCase();
  if (!isValidUuid(t)) return null;
  const [timeLow, timeMid, timeHiAndVersion, clockSeq, node] = t.split('-') as [
    string,
    string,
    string,
    string,
    string,
  ];
  const version = parseInt(timeHiAndVersion[0] ?? '0', 16);
  const variantBits = parseInt(clockSeq[0] ?? '0', 16);
  // RFC 4122 §4.1.1: variant lives in the top 3 bits of clock_seq_hi.
  let variant: UuidAnatomy['variant'];
  if ((variantBits & 0x8) === 0) variant = 'NCS';
  else if ((variantBits & 0xc) === 0x8) variant = 'RFC 4122';
  else if ((variantBits & 0xe) === 0xc) variant = 'Microsoft';
  else variant = 'reserved';
  return {
    timeLow,
    timeMid,
    timeHiAndVersion,
    clockSeqHiAndReserved: clockSeq.slice(0, 2),
    clockSeqLow: clockSeq.slice(2, 4),
    node,
    version,
    variant,
  };
}

/** Manual CSPRNG-backed v4 UUID (used as a fallback for old runtimes). */
function manualUuid(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(bytes);
  } else {
    // Last-ditch: Math.random — not cryptographically strong, but our
    // entire deployment target has WebCrypto, so this branch is only for
    // the most stripped-down test environments.
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  // Per RFC 4122 §4.4: set version (4) and variant (1, 0, x, x).
  // bytes[6] & 0x0f → low nibble; OR with 0x40 sets the version.
  // bytes[8] & 0x3f → low 6 bits; OR with 0x80 sets the variant.
  bytes[6] = (bytes[6] ?? 0) & 0x0f;
  bytes[6] = (bytes[6] ?? 0) | 0x40;
  bytes[8] = (bytes[8] ?? 0) & 0x3f;
  bytes[8] = (bytes[8] ?? 0) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
