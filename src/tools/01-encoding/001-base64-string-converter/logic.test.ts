import { describe, expect, it } from 'vitest';
import { base64ToText, isValidBase64, textToBase64 } from './logic';

describe('textToBase64', () => {
  it('encodes ASCII', () => {
    expect(textToBase64('Hello')).toBe('SGVsbG8=');
  });

  it('returns empty string for empty input', () => {
    expect(textToBase64('')).toBe('');
  });

  it('round-trips UTF-8 (CJK)', () => {
    expect(textToBase64('日本語')).toBe('5pel5pys6Kqe');
  });

  it('round-trips emoji (surrogate pairs)', () => {
    expect(textToBase64('😀')).toBe('8J+YgA==');
  });

  it('round-trips accented Latin', () => {
    expect(textToBase64('café')).toBe('Y2Fmw6k=');
  });

  it('encodes URL-safe variant: standard "/" becomes "_", padding stripped', () => {
    // "subjects?ids[]=1" produces `c3ViamVjdHM/aWRzW109MQ==` in standard.
    // URL-safe replaces `/` with `_` and strips the `==` padding.
    expect(textToBase64('subjects?ids[]=1')).toBe('c3ViamVjdHM/aWRzW109MQ==');
    expect(textToBase64('subjects?ids[]=1', { makeUrlSafe: true })).toBe(
      'c3ViamVjdHM_aWRzW109MQ',
    );
  });

  it('strips padding in URL-safe mode', () => {
    expect(textToBase64('Hello', { makeUrlSafe: true })).toBe('SGVsbG8');
    expect(textToBase64('Hello!', { makeUrlSafe: true })).toBe('SGVsbG8h');
  });

  it('replaces + with - in URL-safe mode', () => {
    // The 😀 emoji UTF-8 encodes to bytes that produce `+` in standard base64
    // ("8J+YgA==" — note the `+` at index 2).
    const inputProducingPlus = '😀';
    const standard = textToBase64(inputProducingPlus);
    const urlSafe = textToBase64(inputProducingPlus, { makeUrlSafe: true });
    expect(standard).toContain('+');
    expect(urlSafe).not.toContain('+');
    expect(urlSafe).toContain('-');
  });

  it('replaces / with _ in URL-safe mode', () => {
    const standard = textToBase64('subjects?ids[]=1');
    const urlSafe = textToBase64('subjects?ids[]=1', { makeUrlSafe: true });
    expect(standard).toContain('/');
    expect(urlSafe).not.toContain('/');
    expect(urlSafe).toContain('_');
  });
});

describe('base64ToText', () => {
  it('decodes ASCII', () => {
    expect(base64ToText('SGVsbG8=')).toBe('Hello');
  });

  it('returns empty string for empty input', () => {
    expect(base64ToText('')).toBe('');
  });

  it('round-trips UTF-8 (CJK)', () => {
    expect(base64ToText('5pel5pys6Kqe')).toBe('日本語');
  });

  it('round-trips emoji', () => {
    expect(base64ToText('8J+YgA==')).toBe('😀');
  });

  it('strips a data:...;base64, prefix', () => {
    expect(base64ToText('data:text/plain;base64,SGVsbG8=')).toBe('Hello');
    expect(base64ToText('data:image/png;base64,SGVsbG8=')).toBe('Hello');
  });

  it('trims whitespace', () => {
    expect(base64ToText('  SGVsbG8=  \n')).toBe('Hello');
  });

  it('decodes URL-safe variant', () => {
    expect(
      base64ToText('c3ViamVjdHM_aWRzW109MQ', { makeUrlSafe: true }),
    ).toBe('subjects?ids[]=1');
  });

  it('throws on invalid input', () => {
    expect(() => base64ToText('not_base64!!!')).toThrow('Incorrect base64 string');
  });

  it('rejects URL-safe input in standard mode', () => {
    // The `_` character is URL-safe alphabet only.
    expect(() => base64ToText('SGVsbG8_')).toThrow('Incorrect base64 string');
  });
});

describe('round-trip', () => {
  it.each([
    'Hello, world!',
    '日本語',
    '😀🌍🚀',
    'café au lait',
    'Tom & Jerry',
    'subjects?ids[]=1&ids[]=2',
    'A very long string '.repeat(50),
  ])('preserves %s through encode→decode', (input) => {
    expect(base64ToText(textToBase64(input))).toBe(input);
  });

  it.each(['Hello', '日本語', 'subjects?ids[]=1'])(
    'preserves %s through URL-safe encode→decode',
    (input) => {
      expect(
        base64ToText(textToBase64(input, { makeUrlSafe: true }), { makeUrlSafe: true }),
      ).toBe(input);
    },
  );
});

describe('isValidBase64', () => {
  it('accepts valid standard base64', () => {
    expect(isValidBase64('SGVsbG8=')).toBe(true);
    expect(isValidBase64('5pel5pys6Kqe')).toBe(true);
  });

  it('accepts the empty string', () => {
    expect(isValidBase64('')).toBe(true);
  });

  it('accepts whitespace-padded valid input', () => {
    expect(isValidBase64('  SGVsbG8=  \n')).toBe(true);
  });

  it('rejects bare URL-safe characters in standard mode', () => {
    expect(isValidBase64('SGVsbG8_')).toBe(false);
    expect(isValidBase64('c3ViamVjdHM-')).toBe(false);
  });

  it('accepts URL-safe input only when makeUrlSafe=true', () => {
    expect(isValidBase64('c3ViamVjdHM_aWRzW109MQ', { makeUrlSafe: true })).toBe(true);
    expect(isValidBase64('c3ViamVjdHM_aWRzW109MQ')).toBe(false);
  });

  it('rejects non-multiple-of-4 length in standard mode', () => {
    expect(isValidBase64('SGVsbG8')).toBe(false); // missing padding
  });

  it('rejects strings with non-base64 characters', () => {
    expect(isValidBase64('Hello!')).toBe(false);
    expect(isValidBase64('not base64')).toBe(false);
    expect(isValidBase64('日本語')).toBe(false);
  });
});
