/**
 * Line-based diff using a tiny LCS algorithm. Output is a sequence of
 * "equal" / "added" / "removed" rows. Sufficient for display; not aiming
 * at git's full Myers diff edge cases.
 */

export type Op = 'eq' | 'add' | 'del';
export interface DiffRow {
  readonly op: Op;
  readonly text: string;
  readonly lineA?: number;
  readonly lineB?: number;
}

export function diffLines(a: string, b: string): readonly DiffRow[] {
  const A = a === '' ? [] : a.split('\n');
  const B = b === '' ? [] : b.split('\n');
  const lcs = computeLcs(A, B);
  const rows: DiffRow[] = [];
  let i = 0, j = 0, k = 0;
  while (i < A.length || j < B.length) {
    const lineA = A[i];
    const lineB = B[j];
    const lcsLine = lcs[k];
    if (lcsLine !== undefined && lineA === lcsLine && lineB === lcsLine) {
      rows.push({ op: 'eq', text: lcsLine, lineA: i + 1, lineB: j + 1 });
      i++; j++; k++;
    } else if (lineA !== undefined && (lcsLine === undefined || lineA !== lcsLine)) {
      rows.push({ op: 'del', text: lineA, lineA: i + 1 });
      i++;
    } else if (lineB !== undefined) {
      rows.push({ op: 'add', text: lineB, lineB: j + 1 });
      j++;
    }
  }
  return rows;
}

function computeLcs(A: readonly string[], B: readonly string[]): readonly string[] {
  const m = A.length, n = B.length;
  // dp[i][j] = LCS length of A[0..i] vs B[0..j]
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        dp[i]![j] = (dp[i - 1]?.[j - 1] ?? 0) + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]?.[j] ?? 0, dp[i]?.[j - 1] ?? 0);
      }
    }
  }
  const out: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (A[i - 1] === B[j - 1]) {
      out.push(A[i - 1] ?? '');
      i--; j--;
    } else if ((dp[i - 1]?.[j] ?? 0) >= (dp[i]?.[j - 1] ?? 0)) {
      i--;
    } else {
      j--;
    }
  }
  return out.reverse();
}

export interface DiffStats {
  readonly added: number;
  readonly removed: number;
  readonly unchanged: number;
}

export function statsFor(rows: readonly DiffRow[]): DiffStats {
  let added = 0, removed = 0, unchanged = 0;
  for (const r of rows) {
    if (r.op === 'add') added++;
    else if (r.op === 'del') removed++;
    else unchanged++;
  }
  return { added, removed, unchanged };
}

/**
 * Word-level diff. Splits both sides on whitespace boundaries (keeping the
 * whitespace as separate tokens so we can faithfully reconstruct the input)
 * then runs the same LCS algorithm. Useful when the user wants to see
 * intra-line changes.
 */
export function diffWords(a: string, b: string): readonly DiffRow[] {
  const A = tokenize(a);
  const B = tokenize(b);
  const lcs = computeLcs(A, B);
  const rows: DiffRow[] = [];
  let i = 0, j = 0, k = 0;
  while (i < A.length || j < B.length) {
    const tA = A[i];
    const tB = B[j];
    const lcsTok = lcs[k];
    if (lcsTok !== undefined && tA === lcsTok && tB === lcsTok) {
      rows.push({ op: 'eq', text: lcsTok });
      i++; j++; k++;
    } else if (tA !== undefined && (lcsTok === undefined || tA !== lcsTok)) {
      rows.push({ op: 'del', text: tA });
      i++;
    } else if (tB !== undefined) {
      rows.push({ op: 'add', text: tB });
      j++;
    }
  }
  return rows;
}

/** Tokenize on whitespace, preserving the whitespace as standalone tokens. */
function tokenize(s: string): readonly string[] {
  const out: string[] = [];
  let buf = '';
  let inWs = /\s/.test(s.charAt(0));
  for (const ch of s) {
    const isWs = /\s/.test(ch);
    if (isWs === inWs) {
      buf += ch;
    } else {
      if (buf) out.push(buf);
      buf = ch;
      inWs = isWs;
    }
  }
  if (buf) out.push(buf);
  return out;
}
