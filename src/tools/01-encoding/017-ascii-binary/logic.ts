/**
 * ASCII ↔ binary conversion. UTF-8 aware: a single multi-byte char becomes
 * multiple 8-bit groups in binary, and binary→text rebuilds the byte stream
 * before UTF-8 decoding.
 */

export function textToBinary(input: string, separator = ' '): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  const parts: string[] = [];
  for (const b of bytes) {
    parts.push(b.toString(2).padStart(8, '0'));
  }
  return parts.join(separator);
}

export function binaryToText(input: string): string | null {
  // Strip everything except 0/1
  const s = input.replace(/[^01]/g, '');
  if (!s || s.length % 8 !== 0) return null;
  const bytes = new Uint8Array(s.length / 8);
  for (let i = 0; i < s.length; i += 8) {
    const byte = parseInt(s.slice(i, i + 8), 2);
    bytes[i / 8] = byte;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
