/**
 * Regex tester — given a pattern + flags + test string, return matches
 * (each with capture groups) or a parse error.
 */

export interface MatchInfo {
  readonly match: string;
  readonly index: number;
  readonly groups: readonly string[];
  /** ES2018 named-capture groups (`(?<name>…)`). Empty if none. */
  readonly namedGroups: Readonly<Record<string, string>>;
}

export interface RegexSuccess {
  readonly ok: true;
  readonly matches: readonly MatchInfo[];
}
export interface RegexFailure {
  readonly ok: false;
  readonly error: string;
}
export type RegexResult = RegexSuccess | RegexFailure;

/** Test `pattern` (with `flags`) against `subject`. Always uses /g internally
 *  so we can collect all matches; we ignore the user's `g` setting. */
export function testRegex(pattern: string, flags: string, subject: string): RegexResult {
  let re: RegExp;
  try {
    const safeFlags = (flags + 'g').replace(/(.)(?=.*\1)/g, ''); // dedupe
    re = new RegExp(pattern, safeFlags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'invalid regex' };
  }
  const matches: MatchInfo[] = [];
  let m: RegExpExecArray | null;
  let safety = 0;
  while ((m = re.exec(subject)) !== null) {
    if (++safety > 10_000) break;
    const named: Record<string, string> = {};
    if (m.groups) {
      for (const [k, v] of Object.entries(m.groups)) named[k] = v ?? '';
    }
    matches.push({
      match: m[0],
      index: m.index,
      groups: m.slice(1).map((g) => g ?? ''),
      namedGroups: named,
    });
    if (m[0].length === 0) re.lastIndex++; // avoid empty-match infinite loop
  }
  return { ok: true, matches };
}
