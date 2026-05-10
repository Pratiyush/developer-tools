import { describe, expect, it } from 'vitest';
import { format, minify } from './logic';

describe('format-json logic', () => {
  it('formats compact JSON', () => {
    const r = format('{"a":1,"b":[2,3]}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it('respects custom indent', () => {
    const r = format('{"a":1}', 4);
    expect(r.ok && r.output).toBe('{\n    "a": 1\n}');
  });

  it('minifies', () => {
    const r = minify('{ "a":  1 }');
    expect(r.ok && r.output).toBe('{"a":1}');
  });

  it('returns ok:false with message on bad JSON', () => {
    const r = format('not json');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBeTruthy();
  });

  it('empty input → empty output', () => {
    expect(format('').ok && (format('') as { output: string }).output).toBe('');
  });
});
