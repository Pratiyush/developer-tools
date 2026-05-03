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
  'error.parse.failed':
    "That doesn't look quite right. Check for stray characters or the wrong format and try again.",
  'error.back.home': '← Back to home',

  // Day 1 — base64-string-converter
  'tools.base64.mode.aria': 'Encode or decode',
  'tools.base64.mode.encode': 'Encode',
  'tools.base64.mode.decode': 'Decode',
  'tools.base64.urlsafe.label': 'URL-safe variant (-_, no padding)',
  'tools.base64.urlsafe.aria': 'Use URL-safe base64 alphabet',
  'tools.base64.input.label': 'Input',
  'tools.base64.input.aria': 'Base64 converter input',
  'tools.base64.input.placeholder':
    'Type or paste — UTF-8, emoji, JWT segments. All round-trip cleanly.',
  'tools.base64.output.label': 'Output',
  'tools.base64.output.aria': 'Base64 converter output',
  'tools.base64.swap': 'Swap ⇄',
  'tools.base64.copy': 'Copy',
  'tools.base64.lengths': '{in} chars in · {out} chars out',
};

export default en;
