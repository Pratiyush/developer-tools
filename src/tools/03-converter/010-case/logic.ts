/**
 * Case converter — turn arbitrary input into a chosen "case" (camel,
 * snake, kebab, etc.) by first splitting on word boundaries and then
 * re-emitting in the target style.
 */

export const CASES = [
  'camel',
  'pascal',
  'snake',
  'screamingSnake',
  'kebab',
  'screamingKebab',
  'dot',
  'path',
  'sentence',
  'title',
  'lower',
  'upper',
] as const;
export type Case = (typeof CASES)[number];

export const CASE_LABELS: Record<Case, string> = {
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  screamingSnake: 'SCREAMING_SNAKE',
  kebab: 'kebab-case',
  screamingKebab: 'SCREAMING-KEBAB',
  dot: 'dot.case',
  path: 'path/case',
  sentence: 'Sentence case',
  title: 'Title Case',
  lower: 'lowercase',
  upper: 'UPPERCASE',
};

/** Split into words. Handles camelCase, PascalCase, snake_case, kebab-case,
 *  acronyms, digits, mixed punctuation. */
export function splitWords(input: string): readonly string[] {
  if (!input) return [];
  return (
    input
      // Insert a separator between camelCase humps: lowercase→Uppercase.
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      // Insert separator between consecutive uppercase + lowercase trail
      // ("HTTPRequest" → "HTTP Request").
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      // Replace runs of separators (_-/.\s) with a single space.
      .replace(/[_\-/.\s]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
  );
}

export function toCase(input: string, target: Case): string {
  const words = splitWords(input);
  if (words.length === 0) return '';
  switch (target) {
    case 'camel':
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w.toLowerCase())))
        .join('');
    case 'pascal':
      return words.map((w) => capitalize(w.toLowerCase())).join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'screamingSnake':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'screamingKebab':
      return words.map((w) => w.toUpperCase()).join('-');
    case 'dot':
      return words.map((w) => w.toLowerCase()).join('.');
    case 'path':
      return words.map((w) => w.toLowerCase()).join('/');
    case 'sentence':
      return capitalize(words.join(' ').toLowerCase());
    case 'title':
      return words.map((w) => capitalize(w.toLowerCase())).join(' ');
    case 'lower':
      return input.toLowerCase();
    case 'upper':
      return input.toUpperCase();
  }
}

function capitalize(w: string): string {
  if (!w) return w;
  return (w[0] ?? '').toUpperCase() + w.slice(1);
}
