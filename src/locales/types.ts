/**
 * Public translation contract. Every locale file exports a `Translations`
 * record keyed by these strings. Add a key here when introducing a new
 * user-facing string.
 *
 * Style: regular labels are neutral. **Error messages** are lightly funny
 * but always informative (see `feedback_funny_errors` memory).
 */
export interface Translations {
  'site.brand': string;
  'site.tagline': string;
  'site.copyright': string;
  'site.author': string;

  'nav.home': string;

  'home.hero.title': string;
  'home.hero.subtitle': string;
  'home.empty': string;

  'sidebar.search.placeholder': string;
  'sidebar.search.aria': string;
  'sidebar.empty': string;
  'sidebar.empty.search': string;
  'sidebar.foot.line1': string;
  'sidebar.foot.line2': string;

  'topbar.theme.aria': string;
  'topbar.github.aria': string;

  'tool.placeholder.title': string;
  'tool.placeholder.body': string;

  'footer.privacy': string;
  'footer.disclaimer': string;
  'footer.license': string;
  'footer.security': string;
  'footer.repo': string;

  // Error messages — funny first line, useful second line. {id} is the
  // unknown tool slug; {format} is the input format we expected; etc.
  'error.404.title': string;
  'error.404.body': string;
  'error.unknown': string;
  'error.copy.failed': string;
  'error.parse.failed': string;
  'error.back.home': string;

  // Day 1 — base64-string-converter
  'tools.base64.mode.aria': string;
  'tools.base64.mode.encode': string;
  'tools.base64.mode.decode': string;
  'tools.base64.urlsafe.label': string;
  'tools.base64.urlsafe.aria': string;
  'tools.base64.input.label': string;
  'tools.base64.input.aria': string;
  'tools.base64.input.placeholder': string;
  'tools.base64.output.label': string;
  'tools.base64.output.aria': string;
  'tools.base64.swap': string;
  'tools.base64.copy': string;
  'tools.base64.lengths': string;
}

export type TranslationKey = keyof Translations;
