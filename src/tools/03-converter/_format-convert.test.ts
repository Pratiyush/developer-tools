import { describe, expect, it } from 'vitest';
import { convert } from './_format-convert';

describe('format-convert engine', () => {
  it('JSON → YAML', () => {
    const r = convert('{"a":1,"b":["x","y"]}', 'json', 'yaml');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.output).toContain('a: 1');
      expect(r.output).toContain('- x');
    }
  });

  it('YAML → JSON', () => {
    const r = convert('a: 1\nb:\n  - x\n  - y\n', 'yaml', 'json');
    expect(r.ok && r.output).toBe('{\n  "a": 1,\n  "b": [\n    "x",\n    "y"\n  ]\n}');
  });

  it('JSON → TOML', () => {
    const r = convert('{"name":"alice","age":30}', 'json', 'toml');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.output).toContain('name = "alice"');
      expect(r.output).toContain('age = 30');
    }
  });

  it('TOML → YAML', () => {
    const r = convert('name = "alice"\nage = 30\n', 'toml', 'yaml');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.output).toContain('name: alice');
      expect(r.output).toContain('age: 30');
    }
  });

  it('JSON → JSON round-trip is identity', () => {
    const r = convert('{"x":1}', 'json', 'json');
    expect(r.ok && JSON.parse(r.output)).toEqual({ x: 1 });
  });

  it('returns ok:false on bad input', () => {
    const r = convert('{ not valid json', 'json', 'yaml');
    expect(r.ok).toBe(false);
  });

  it('TOML output errors on non-object root', () => {
    // YAML can carry a top-level scalar; TOML can't.
    const r = convert('"just a string"', 'json', 'toml');
    expect(r.ok).toBe(false);
  });

  it('empty input → empty output', () => {
    const r = convert('', 'json', 'yaml');
    expect(r.ok && r.output).toBe('');
  });
});
