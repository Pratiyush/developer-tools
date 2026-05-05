import type { Translations } from './types';

const en: Translations = {
  'site.brand': 'Developer Tools',
  'site.tagline': 'A workbench of small developer utilities. Local-only.',
  'site.copyright': 'Copyright © 2026 Pratiyush Kumar. Licensed under AGPL-3.0.',
  'site.author': 'Made by Pratiyush.',

  'nav.home': 'Home',

  'home.hero.title': '100 dev tools, in your browser.',
  'home.hero.subtitle':
    'A workbench of small developer utilities. Local-only — nothing leaves your browser. Each tool deep-links to a shareable URL.',
  'home.empty':
    'No tools yet. The first one ships soon. Run `pnpm new-tool <slug> --category <NN>` to add the first.',

  'sidebar.search.placeholder': 'Search tools…',
  'sidebar.search.aria': 'Search tools',
  'sidebar.empty': 'No tools yet',
  'sidebar.empty.search': 'No matches',
  'sidebar.foot.line1': 'Local-only · all processing runs in your browser.',
  'sidebar.foot.line2': 'Made by Pratiyush.',

  'topbar.theme.aria': 'Theme',
  'topbar.github.aria': 'GitHub repository',
  'topbar.menu.aria': 'Open navigation menu',
  'topbar.language.aria': 'Language',
  'topbar.language.label': 'Language',

  'tool.placeholder.title': 'Tool not yet implemented',
  'tool.placeholder.body': 'Tool logic available; render layer pending.',

  'footer.privacy': 'Privacy',
  'footer.disclaimer': 'Disclaimer',
  'footer.license': 'License',
  'footer.security': 'Security',
  'footer.repo': 'GitHub',

  'error.404.title': 'Lost in the workshop',
  'error.404.body':
    'No tool called "{id}". It may have been renamed, retired, or the link picked up a typo on the way over. The home page knows the way back.',
  'error.unknown':
    'Something broke. The cause is not entirely clear, even to us. A reload usually helps.',
  'error.copy.failed':
    'Clipboard said no. Probably a permissions thing — check your browser settings and try once more.',
  'error.paste.failed':
    'Clipboard kept its mouth shut. Browsers gate paste behind a permission — grant it, or paste with ⌘/Ctrl-V into the field.',
  'error.parse.failed':
    "That doesn't look quite right. Check for stray characters or the wrong format and try again.",
  'error.back.home': '← Back to home',

  // Day 1 — base64-string-converter
  'tools.base64.mode.aria': 'Encode or decode',
  'tools.base64.mode.encode': 'Encode',
  'tools.base64.mode.decode': 'Decode',
  'tools.base64.urlsafe.label': 'URL-safe variant (-_, no padding)',
  'tools.base64.urlsafe.aria': 'Use URL-safe base64 alphabet',
  'tools.base64.label.text': 'Text',
  'tools.base64.label.base64': 'Base64',
  'tools.base64.source.aria': 'Base64 converter input',
  'tools.base64.result.aria': 'Base64 converter output',
  'tools.base64.placeholder.encode':
    'Type or paste — UTF-8, emoji, JWT segments. All round-trip cleanly.',
  'tools.base64.placeholder.decode':
    'Paste a base64 string — JWT segments and URL-safe variants both decode.',
  'tools.base64.swap': 'Swap ⇄',
  'tools.base64.copy': 'Copy',
  'tools.base64.copied': 'Copied',
  'tools.base64.paste': 'Paste',
  'tools.base64.paste.aria': 'Paste from clipboard',
  'tools.base64.pasted': 'Pasted',
  'tools.base64.chars': '{n} chars',
  'tools.base64.lengths': '{in} chars in · {out} chars out',
  'tools.base64.explainer.heading': 'How Base64 works',
  'tools.base64.explainer.intro':
    'Base64 packs arbitrary bytes into 64 printable ASCII characters (A–Z, a–z, 0–9, + /). It exists so binary survives text-only channels — JSON fields, URLs, email bodies, HTTP headers.',
  'tools.base64.explainer.mechanic':
    'Take 3 bytes (24 bits), slice into 4 groups of 6 bits, look each group up in the alphabet, emit 4 ASCII characters. Trailing `=` pads the output to a multiple of 4 when the input does not align.',
  'tools.base64.explainer.example.label': 'Worked example — encoding "Cat"',
  'tools.base64.explainer.uses':
    'You will see it in HTTP Basic Auth (`Authorization: Basic …`), JWT segments, `data:` URIs in CSS/HTML, and email attachments (MIME).',
  'tools.base64.explainer.warning':
    'Not encryption. Anyone with the encoded string can decode it back. Treat base64 as an envelope for transport, never as a secret.',
  'tools.base64.explainer.tryauth': 'Try the Basic Auth helper →',
  'tools.base64.deepdive.encoding.title': 'Step-by-step: encoding "Man" → "TWFu"',
  'tools.base64.deepdive.encoding.intro':
    'Watch one 24-bit chunk turn into four 6-bit indices. The tail cases (1 or 2 leftover bytes) are the same idea with `=` padding.',
  'tools.base64.deepdive.alphabet.title': 'The 64-character alphabet',
  'tools.base64.deepdive.alphabet.intro':
    'Standard base64 (RFC 4648 §4) reserves 64 ASCII characters. The URL-safe variant (§5) swaps two of them so the output survives URLs and filenames.',
  'tools.base64.deepdive.uses.title': 'Where you actually meet base64',
  'tools.base64.deepdive.uses.intro':
    'Anywhere binary needs to ride through a text-only channel. A short tour of the formats you read most:',
  'tools.base64.deepdive.pitfalls.title': 'Things that bite',
  'tools.base64.deepdive.pitfalls.intro':
    'Most "weird base64 bugs" come from one of these. Skim before you debug.',

  'tools.basicauth.mode.aria': 'Build header or read header',
  'tools.basicauth.mode.encode': 'Build',
  'tools.basicauth.mode.decode': 'Read',
  'tools.basicauth.username.label': 'Username',
  'tools.basicauth.username.aria': 'Username for Basic auth',
  'tools.basicauth.username.placeholder': 'aladdin',
  'tools.basicauth.password.label': 'Password',
  'tools.basicauth.password.aria': 'Password for Basic auth',
  'tools.basicauth.password.placeholder': 'open sesame',
  'tools.basicauth.password.show': 'Show',
  'tools.basicauth.password.hide': 'Hide',
  'tools.basicauth.header.label': 'Authorization header',
  'tools.basicauth.header.aria': 'HTTP Authorization header value',
  'tools.basicauth.header.placeholder': 'Basic YWxhZGRpbjpvcGVuIHNlc2FtZQ==',
  'tools.basicauth.copy.header': 'Copy header',
  'tools.basicauth.copy.username': 'Copy username',
  'tools.basicauth.copy.password': 'Copy password',
  'tools.basicauth.paste.header': 'Paste header',
  'tools.basicauth.invalid':
    'That header did not parse. Make sure it looks like `Basic <base64>` and the decoded payload contains a `:` between username and password.',
  'tools.basicauth.heading': 'HTTP Basic Auth helper',
  'tools.basicauth.intro':
    'Builds and reads the `Authorization: Basic <base64>` header used by HTTP Basic Authentication. All on-device — credentials never leave your browser.',

  // Day 3 — html-entities
  'tools.entities.heading': 'HTML entities encoder / decoder',
  'tools.entities.intro':
    'Encode `&`, `<`, `>`, `"`, `\'` (the SGML-five) for safe HTML embedding, or extend to the full Latin-1 + currency + math + curly-quotes set. Decode any named or numeric entity (`&copy;`, `&#65;`, `&#x41;`).',
  'tools.entities.mode.aria': 'Encode or decode',
  'tools.entities.mode.encode': 'Encode',
  'tools.entities.mode.decode': 'Decode',
  'tools.entities.variant.label': 'Extended set (Latin-1 + currency + math)',
  'tools.entities.variant.aria': 'Toggle extended encode set',
  'tools.entities.variant.minimal': 'Minimal',
  'tools.entities.variant.extended': 'Extended',
  'tools.entities.label.text': 'Text',
  'tools.entities.label.html': 'HTML',
  'tools.entities.source.aria': 'HTML entities tool input',
  'tools.entities.result.aria': 'HTML entities tool output',
  'tools.entities.placeholder.encode':
    'Type or paste — emoji and accents survive. Toggle extended for currency / curly quotes.',
  'tools.entities.placeholder.decode':
    'Paste HTML — `&copy;`, `&#65;`, `&#x41;` all decode. Unknown entities pass through untouched.',
  'tools.entities.entities.found': '{n} entities decoded',
  'tools.entities.explainer.minimal.heading': 'Minimal: the SGML-five',
  'tools.entities.explainer.minimal.body':
    'Only `&`, `<`, `>`, `"`, `\'` get escaped. Idempotent on re-decode and the right call when escaping user input for safe HTML embedding (server-rendered templates, attributes).',
  'tools.entities.explainer.extended.heading': 'Extended: Latin-1 + curly quotes + math',
  'tools.entities.explainer.extended.body':
    'Adds `©`, `®`, `™`, `€`, `£`, `¥`, `–`, `—`, `…`, `“ ”`, `‘ ’`, math operators, arrows. Use when you want the source HTML to be ASCII-only after a Markdown / paste.',
  'tools.entities.explainer.numeric.heading': 'Numeric: decimal and hex',
  'tools.entities.explainer.numeric.body':
    'Decode handles both `&#65;` (decimal) and `&#x41;` / `&#X41;` (hex), including astral codepoints — `&#128512;` and `&#x1F600;` both round-trip to 😀.',
};

export default en;
