/** Word counting + reading-time estimation. */

export interface WordCountStats {
  readonly chars: number;
  readonly charsNoSpaces: number;
  readonly words: number;
  readonly sentences: number;
  readonly paragraphs: number;
  /** Estimate at 220 words/minute (average adult reading speed). */
  readonly readingMinutes: number;
}

export function countWords(input: string): WordCountStats {
  const chars = input.length;
  const charsNoSpaces = input.replace(/\s/g, '').length;
  const words = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;
  const sentences = (input.match(/[.!?]+(?:\s|$)/g) ?? []).length;
  const paragraphs =
    input.trim() === '' ? 0 : input.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingMinutes = Math.ceil(words / 220);
  return { chars, charsNoSpaces, words, sentences, paragraphs, readingMinutes };
}
