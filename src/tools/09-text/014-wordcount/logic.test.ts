import { describe, expect, it } from 'vitest';
import { countWords } from './logic';

describe('wordcount logic', () => {
  it('counts simple text', () => {
    const r = countWords('Hello world.');
    expect(r.words).toBe(2);
    expect(r.chars).toBe(12);
    expect(r.charsNoSpaces).toBe(11);
    expect(r.sentences).toBe(1);
  });

  it('counts paragraphs', () => {
    const r = countWords('Para one.\n\nPara two.\n\nPara three.');
    expect(r.paragraphs).toBe(3);
  });

  it('estimates reading time', () => {
    const text = 'word '.repeat(440).trim();
    expect(countWords(text).readingMinutes).toBe(2);
  });

  it('zeros for empty input', () => {
    const r = countWords('');
    expect(r.words).toBe(0);
    expect(r.chars).toBe(0);
    expect(r.paragraphs).toBe(0);
  });
});
