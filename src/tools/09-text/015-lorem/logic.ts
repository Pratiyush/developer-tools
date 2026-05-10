/**
 * Lorem ipsum generator. Pulls words from a small (~80 word) dictionary
 * — the classic Lorem corpus is ~200 unique words but 80 is plenty for
 * the visual texture of placeholder copy. No external dep.
 */

const LOREM = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur',
  'pretium', 'tincidunt', 'lacus', 'nulla', 'gravida', 'orci', 'a', 'odio',
  'nullam', 'varius', 'turpis', 'ac', 'fermentum', 'integer', 'feugiat',
  'arcu', 'urna', 'porta', 'dui',
] as const;

function pick(rng: () => number): string {
  return LOREM[Math.floor(rng() * LOREM.length)] ?? 'lorem';
}

function capitalize(w: string): string {
  return w ? (w[0]?.toUpperCase() ?? '') + w.slice(1) : '';
}

/** Generate a sentence of `min..max` words. */
function sentence(rng: () => number, min = 6, max = 14): string {
  const n = Math.floor(rng() * (max - min + 1)) + min;
  const words: string[] = [];
  for (let i = 0; i < n; i++) words.push(pick(rng));
  return capitalize(words.join(' ')) + '.';
}

/** Generate a paragraph with `nSentences` sentences. */
function paragraph(rng: () => number, nSentences = 5): string {
  const out: string[] = [];
  for (let i = 0; i < nSentences; i++) out.push(sentence(rng));
  return out.join(' ');
}

/** Top-level: generate `count` paragraphs. */
export function generateLorem(paragraphs: number, startWithClassic = true): string {
  if (paragraphs < 1) return '';
  const rng = Math.random;
  const out: string[] = [];
  for (let i = 0; i < paragraphs; i++) {
    if (i === 0 && startWithClassic) {
      out.push(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
          paragraph(rng, 4),
      );
    } else {
      out.push(paragraph(rng));
    }
  }
  return out.join('\n\n');
}
