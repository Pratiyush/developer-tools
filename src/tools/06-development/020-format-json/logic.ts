/**
 * JSON pretty-printer + minifier with helpful error messages.
 */

export interface FormatSuccess {
  readonly ok: true;
  readonly output: string;
}
export interface FormatFailure {
  readonly ok: false;
  readonly error: string;
}
export type FormatResult = FormatSuccess | FormatFailure;

export function format(input: string, indent = 2): FormatResult {
  if (!input.trim()) return { ok: true, output: '' };
  try {
    const parsed: unknown = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'invalid JSON' };
  }
}

export function minify(input: string): FormatResult {
  if (!input.trim()) return { ok: true, output: '' };
  try {
    const parsed: unknown = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'invalid JSON' };
  }
}
