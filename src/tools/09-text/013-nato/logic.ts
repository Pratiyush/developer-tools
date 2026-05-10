/** NATO phonetic alphabet (ICAO/ITU). Letters + digits + a few punctuation. */

const NATO: Record<string, string> = {
  a: 'Alpha', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo',
  f: 'Foxtrot', g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliet',
  k: 'Kilo', l: 'Lima', m: 'Mike', n: 'November', o: 'Oscar',
  p: 'Papa', q: 'Quebec', r: 'Romeo', s: 'Sierra', t: 'Tango',
  u: 'Uniform', v: 'Victor', w: 'Whiskey', x: 'X-ray', y: 'Yankee', z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
  '.': 'Stop', '-': 'Dash', ' ': '(space)',
};

/** Convert each character of `input` to its NATO word. Joined by " ". */
export function toNato(input: string): string {
  if (!input) return '';
  return input
    .split('')
    .map((ch) => NATO[ch.toLowerCase()] ?? ch)
    .join(' ');
}
