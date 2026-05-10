/**
 * Shared conversion engine for the 4 YAML / JSON / TOML converter tools.
 * Each tool is a thin wrapper that picks a parser + serializer pair from
 * the maps below; this module keeps the IO contract uniform.
 *
 * Why pull this out: the 4 converters are otherwise 90% identical, and
 * having one converter file means one place to touch when js-yaml or
 * smol-toml change semantics, when we want to add CSV support, etc.
 */

import * as YAML from 'js-yaml';
import * as TOML from 'smol-toml';

export type Format = 'json' | 'yaml' | 'toml';

export interface ConvertSuccess {
  readonly ok: true;
  readonly output: string;
}
export interface ConvertFailure {
  readonly ok: false;
  readonly error: string;
}
export type ConvertResult = ConvertSuccess | ConvertFailure;

export function parse(input: string, from: Format): unknown {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (from === 'json') return JSON.parse(trimmed);
  if (from === 'yaml') return YAML.load(trimmed);
  return TOML.parse(trimmed);
}

export function stringify(value: unknown, to: Format): string {
  if (value === null || value === undefined) return '';
  if (to === 'json') return JSON.stringify(value, null, 2);
  if (to === 'yaml') return YAML.dump(value, { indent: 2, lineWidth: -1 });
  // TOML's parse output is always a plain object at the top; if the user
  // hands us a non-object we coerce to an error rather than crash.
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('TOML output must be an object at the top level');
  }
  return TOML.stringify(value);
}

export function convert(input: string, from: Format, to: Format): ConvertResult {
  if (!input.trim()) return { ok: true, output: '' };
  try {
    const parsed = parse(input, from);
    return { ok: true, output: stringify(parsed, to) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'parse error' };
  }
}
