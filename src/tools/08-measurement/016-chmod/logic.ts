/**
 * chmod calculator. Three triplets of rwx → octal digit per triplet.
 *   read=4, write=2, execute=1.
 */

export interface ChmodPerms {
  readonly user: { r: boolean; w: boolean; x: boolean };
  readonly group: { r: boolean; w: boolean; x: boolean };
  readonly other: { r: boolean; w: boolean; x: boolean };
}

const ZERO: ChmodPerms = {
  user: { r: false, w: false, x: false },
  group: { r: false, w: false, x: false },
  other: { r: false, w: false, x: false },
};

function tripletDigit(t: { r: boolean; w: boolean; x: boolean }): number {
  return (t.r ? 4 : 0) + (t.w ? 2 : 0) + (t.x ? 1 : 0);
}

function tripletString(t: { r: boolean; w: boolean; x: boolean }): string {
  return (t.r ? 'r' : '-') + (t.w ? 'w' : '-') + (t.x ? 'x' : '-');
}

/** Render perms as 3-digit octal. */
export function toOctal(perms: ChmodPerms): string {
  return `${tripletDigit(perms.user)}${tripletDigit(perms.group)}${tripletDigit(perms.other)}`;
}

/** Render perms as `rwxr-xr--`-style symbolic string. */
export function toSymbolic(perms: ChmodPerms): string {
  return tripletString(perms.user) + tripletString(perms.group) + tripletString(perms.other);
}

/** Parse a 3-digit octal back to a ChmodPerms. Returns DEFAULT (all off)
 *  for malformed input — the UI calls this only for the share URL. */
export function fromOctal(input: string): ChmodPerms {
  const s = input.trim();
  if (!/^[0-7]{3}$/.test(s)) return ZERO;
  const u = parseInt(s[0] ?? '0', 10);
  const g = parseInt(s[1] ?? '0', 10);
  const o = parseInt(s[2] ?? '0', 10);
  return {
    user: { r: (u & 4) !== 0, w: (u & 2) !== 0, x: (u & 1) !== 0 },
    group: { r: (g & 4) !== 0, w: (g & 2) !== 0, x: (g & 1) !== 0 },
    other: { r: (o & 4) !== 0, w: (o & 2) !== 0, x: (o & 1) !== 0 },
  };
}
