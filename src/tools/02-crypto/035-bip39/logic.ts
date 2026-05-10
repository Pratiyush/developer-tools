/**
 * BIP39 mnemonic generator + decoder.
 *
 * Wraps `@scure/bip39` with the standard English wordlist. We expose the
 * five canonical mnemonic lengths (12 / 15 / 18 / 21 / 24 words) which
 * map to entropy sizes 128 / 160 / 192 / 224 / 256 bits respectively.
 */

import {
  entropyToMnemonic,
  generateMnemonic,
  mnemonicToEntropy,
  validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

export const WORD_COUNTS = [12, 15, 18, 21, 24] as const;
export type WordCount = (typeof WORD_COUNTS)[number];

export const ENTROPY_BITS_FOR_WORDS: Record<WordCount, number> = {
  12: 128,
  15: 160,
  18: 192,
  21: 224,
  24: 256,
};

export function generate(words: WordCount): string {
  return generateMnemonic(wordlist, ENTROPY_BITS_FOR_WORDS[words]);
}

export function entropyHexFor(mnemonic: string): string | null {
  const trimmed = mnemonic.trim();
  if (!trimmed) return null;
  if (!validateMnemonic(trimmed, wordlist)) return null;
  const bytes = mnemonicToEntropy(trimmed, wordlist);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromEntropyHex(hex: string): string | null {
  const trimmed = hex.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]+$/.test(trimmed)) return null;
  if (trimmed.length % 2 !== 0) return null;
  // Length must be 16/20/24/28/32 bytes (128/160/192/224/256 bits).
  const ok = [16, 20, 24, 28, 32].includes(trimmed.length / 2);
  if (!ok) return null;
  const bytes = new Uint8Array(trimmed.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
  }
  return entropyToMnemonic(bytes, wordlist);
}

export function isValid(mnemonic: string): boolean {
  const trimmed = mnemonic.trim();
  if (!trimmed) return false;
  return validateMnemonic(trimmed, wordlist);
}
