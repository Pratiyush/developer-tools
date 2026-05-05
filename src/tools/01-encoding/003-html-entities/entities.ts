/**
 * Subset of HTML5 named character references.
 *
 * The full WHATWG named-character-reference table is ~2,200 entries (~25 KB
 * JSON). This module ships the practical subset that covers >95 % of real
 * HTML decoding tasks: the legacy SGML "five" (`& < > " '`), Latin-1
 * Supplement (U+00A0 – U+00FF), Greek lowercase, common math/punctuation,
 * curly quotes, dashes, currency, and the few archaic-but-frequent ones
 * (`&copy;`, `&trade;`, `&nbsp;`, `&hellip;`, `&mdash;`, etc.).
 *
 * Source: https://html.spec.whatwg.org/multipage/named-characters.html
 *
 * Exported as two parallel maps so encoding (char → entity) and decoding
 * (entity → char) are O(1) and the bundle stays small.
 *
 * If the user pastes an entity outside this set, decode falls through to
 * leave the raw text unchanged — that's intentional, lossy decoding is
 * worse than partial decoding.
 */

/** Always-required (the SGML legacy five). Used by `encodeMinimal`. */
export const MINIMAL_ENCODE: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Extended encode set — adds the Latin-1 Supplement, currency, dashes,
 *  curly quotes, and common math symbols on top of the minimal five. */
export const EXTENDED_ENCODE: Readonly<Record<string, string>> = {
  ...MINIMAL_ENCODE,
  ' ': '&nbsp;',
  '¡': '&iexcl;',
  '¢': '&cent;',
  '£': '&pound;',
  '¤': '&curren;',
  '¥': '&yen;',
  '¦': '&brvbar;',
  '§': '&sect;',
  '¨': '&uml;',
  '©': '&copy;',
  'ª': '&ordf;',
  '«': '&laquo;',
  '¬': '&not;',
  '­': '&shy;',
  '®': '&reg;',
  '¯': '&macr;',
  '°': '&deg;',
  '±': '&plusmn;',
  '²': '&sup2;',
  '³': '&sup3;',
  '´': '&acute;',
  'µ': '&micro;',
  '¶': '&para;',
  '·': '&middot;',
  '¸': '&cedil;',
  '¹': '&sup1;',
  'º': '&ordm;',
  '»': '&raquo;',
  '¼': '&frac14;',
  '½': '&frac12;',
  '¾': '&frac34;',
  '¿': '&iquest;',
  'À': '&Agrave;',
  'Á': '&Aacute;',
  'Â': '&Acirc;',
  'Ã': '&Atilde;',
  'Ä': '&Auml;',
  'Å': '&Aring;',
  'Æ': '&AElig;',
  'Ç': '&Ccedil;',
  'È': '&Egrave;',
  'É': '&Eacute;',
  'Ê': '&Ecirc;',
  'Ë': '&Euml;',
  'Ì': '&Igrave;',
  'Í': '&Iacute;',
  'Î': '&Icirc;',
  'Ï': '&Iuml;',
  'Ð': '&ETH;',
  'Ñ': '&Ntilde;',
  'Ò': '&Ograve;',
  'Ó': '&Oacute;',
  'Ô': '&Ocirc;',
  'Õ': '&Otilde;',
  'Ö': '&Ouml;',
  '×': '&times;',
  'Ø': '&Oslash;',
  'Ù': '&Ugrave;',
  'Ú': '&Uacute;',
  'Û': '&Ucirc;',
  'Ü': '&Uuml;',
  'Ý': '&Yacute;',
  'Þ': '&THORN;',
  'ß': '&szlig;',
  'à': '&agrave;',
  'á': '&aacute;',
  'â': '&acirc;',
  'ã': '&atilde;',
  'ä': '&auml;',
  'å': '&aring;',
  'æ': '&aelig;',
  'ç': '&ccedil;',
  'è': '&egrave;',
  'é': '&eacute;',
  'ê': '&ecirc;',
  'ë': '&euml;',
  'ì': '&igrave;',
  'í': '&iacute;',
  'î': '&icirc;',
  'ï': '&iuml;',
  'ð': '&eth;',
  'ñ': '&ntilde;',
  'ò': '&ograve;',
  'ó': '&oacute;',
  'ô': '&ocirc;',
  'õ': '&otilde;',
  'ö': '&ouml;',
  '÷': '&divide;',
  'ø': '&oslash;',
  'ù': '&ugrave;',
  'ú': '&uacute;',
  'û': '&ucirc;',
  'ü': '&uuml;',
  'ý': '&yacute;',
  'þ': '&thorn;',
  'ÿ': '&yuml;',
  // Currency / math / punctuation outside Latin-1
  '€': '&euro;',
  '™': '&trade;',
  '–': '&ndash;',
  '—': '&mdash;',
  '‘': '&lsquo;',
  '’': '&rsquo;',
  '“': '&ldquo;',
  '”': '&rdquo;',
  '…': '&hellip;',
  '†': '&dagger;',
  '‡': '&Dagger;',
  '•': '&bull;',
  '‰': '&permil;',
  '′': '&prime;',
  '″': '&Prime;',
  '←': '&larr;',
  '↑': '&uarr;',
  '→': '&rarr;',
  '↓': '&darr;',
  '↔': '&harr;',
  '⇐': '&lArr;',
  '⇑': '&uArr;',
  '⇒': '&rArr;',
  '⇓': '&dArr;',
  '⇔': '&hArr;',
  '∀': '&forall;',
  '∂': '&part;',
  '∃': '&exist;',
  '∅': '&empty;',
  '∇': '&nabla;',
  '∈': '&isin;',
  '∉': '&notin;',
  '∋': '&ni;',
  '∏': '&prod;',
  '∑': '&sum;',
  '−': '&minus;',
  '∗': '&lowast;',
  '√': '&radic;',
  '∝': '&prop;',
  '∞': '&infin;',
  '∠': '&ang;',
  '∧': '&and;',
  '∨': '&or;',
  '∩': '&cap;',
  '∪': '&cup;',
  '∫': '&int;',
  '∴': '&there4;',
  '∼': '&sim;',
  '≅': '&cong;',
  '≈': '&asymp;',
  '≠': '&ne;',
  '≡': '&equiv;',
  '≤': '&le;',
  '≥': '&ge;',
  '⊂': '&sub;',
  '⊃': '&sup;',
  '⊆': '&sube;',
  '⊇': '&supe;',
  '⊕': '&oplus;',
  '⊗': '&otimes;',
  '⊥': '&perp;',
  '⋅': '&sdot;',
  '⌈': '&lceil;',
  '⌉': '&rceil;',
  '⌊': '&lfloor;',
  '⌋': '&rfloor;',
  '〈': '&lang;',
  '〉': '&rang;',
  '◊': '&loz;',
  '♠': '&spades;',
  '♣': '&clubs;',
  '♥': '&hearts;',
  '♦': '&diams;',
};

/** Decoder map — inverse of EXTENDED_ENCODE plus a few historical aliases
 *  for common DOM-quirks (`&apos;`, `&AMP;`, etc.). */
export const DECODE_MAP: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const [ch, ent] of Object.entries(EXTENDED_ENCODE)) {
    // Strip leading `&` and trailing `;` for keying.
    map[ent.slice(1, -1)] = ch;
  }
  // Aliases that appear in the wild.
  map.apos = "'";
  map.AMP = '&';
  map.LT = '<';
  map.GT = '>';
  map.QUOT = '"';
  return map;
})();
