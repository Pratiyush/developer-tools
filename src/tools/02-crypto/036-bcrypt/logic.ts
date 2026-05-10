/**
 * Bcrypt hash + verify. WebCrypto doesn't expose bcrypt (it pre-dates the
 * Eksblowfish standard), so we lean on `bcryptjs` — a pure-JS port that
 * works in browsers and Node alike.
 *
 * Educational note: bcrypt is the password-hashing function you reach for
 * when you need a slow, salted, adaptively expensive hash. The cost factor
 * (4–17 in this UI) doubles the work each step. Tune until a single hash
 * takes ~250 ms on the target hardware.
 */

import bcrypt from 'bcryptjs';

export const COST_MIN = 4;
export const COST_MAX = 14; // bcryptjs caps at 17, but anything >14 is multi-second in the browser
export const COST_DEFAULT = 10;

/** Generate a salt + hash for a plain-text password. */
export async function hashPassword(password: string, cost: number): Promise<string> {
  const c = clampCost(cost);
  const salt = await bcrypt.genSalt(c);
  return bcrypt.hash(password, salt);
}

/** Verify a password against an existing bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!isProbablyBcryptHash(hash)) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** Surface bcrypt's cost factor from a hash so we can show it in the UI. */
export function costOf(hash: string): number | null {
  // Format: $2[abxy]$<cost>$<22-char-salt><31-char-hash>
  const m = /^\$2[abxy]\$(\d{2})\$/.exec(hash);
  if (!m) return null;
  const c = parseInt(m[1] ?? '', 10);
  return Number.isFinite(c) ? c : null;
}

function isProbablyBcryptHash(s: string): boolean {
  return /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s.trim());
}

function clampCost(c: number): number {
  if (!Number.isFinite(c)) return COST_DEFAULT;
  return Math.max(COST_MIN, Math.min(COST_MAX, Math.round(c)));
}
