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
  'topbar.menu.aria': string;

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
  'error.paste.failed': string;
  'error.parse.failed': string;
  'error.back.home': string;

  // Day 1 — base64-string-converter
  'tools.base64.mode.aria': string;
  'tools.base64.mode.encode': string;
  'tools.base64.mode.decode': string;
  'tools.base64.urlsafe.label': string;
  'tools.base64.urlsafe.aria': string;
  // Pane labels are format-aware: in encode mode the source is plain text and
  // the result is base64; decode mode swaps them. Two keys instead of generic
  // "input/output" so the visible header tells the user what content lives
  // there. ARIA labels stay role-oriented for assistive tech consumers.
  'tools.base64.label.text': string;
  'tools.base64.label.base64': string;
  'tools.base64.source.aria': string;
  'tools.base64.result.aria': string;
  'tools.base64.placeholder.encode': string;
  'tools.base64.placeholder.decode': string;
  'tools.base64.swap': string;
  'tools.base64.copy': string;
  'tools.base64.copied': string;
  'tools.base64.paste': string;
  'tools.base64.paste.aria': string;
  'tools.base64.pasted': string;
  'tools.base64.chars': string;
  'tools.base64.lengths': string;
  // Explainer — concise blog-style section that lives below the workspace.
  // Bodies are deliberately short to keep 15-locale translation tractable.
  'tools.base64.explainer.heading': string;
  'tools.base64.explainer.intro': string;
  'tools.base64.explainer.mechanic': string;
  'tools.base64.explainer.example.label': string;
  'tools.base64.explainer.uses': string;
  'tools.base64.explainer.warning': string;
  'tools.base64.explainer.tryauth': string;
  // Deep-dive expandable sections — click to reveal a technical breakdown.
  // Headings are translated; the long-form bodies live as inline content
  // (universal code blocks, hex/binary tables) inside render.ts.
  'tools.base64.deepdive.encoding.title': string;
  'tools.base64.deepdive.encoding.intro': string;
  'tools.base64.deepdive.alphabet.title': string;
  'tools.base64.deepdive.alphabet.intro': string;
  'tools.base64.deepdive.uses.title': string;
  'tools.base64.deepdive.uses.intro': string;
  'tools.base64.deepdive.pitfalls.title': string;
  'tools.base64.deepdive.pitfalls.intro': string;

  // Day 2 — base64-basic-auth (HTTP Basic Authorization header builder)
  'tools.basicauth.mode.aria': string;
  'tools.basicauth.mode.encode': string;
  'tools.basicauth.mode.decode': string;
  'tools.basicauth.username.label': string;
  'tools.basicauth.username.aria': string;
  'tools.basicauth.username.placeholder': string;
  'tools.basicauth.password.label': string;
  'tools.basicauth.password.aria': string;
  'tools.basicauth.password.placeholder': string;
  'tools.basicauth.password.show': string;
  'tools.basicauth.password.hide': string;
  'tools.basicauth.header.label': string;
  'tools.basicauth.header.aria': string;
  'tools.basicauth.header.placeholder': string;
  'tools.basicauth.copy.header': string;
  'tools.basicauth.copy.username': string;
  'tools.basicauth.copy.password': string;
  'tools.basicauth.paste.header': string;
  'tools.basicauth.invalid': string;
  'tools.basicauth.heading': string;
  'tools.basicauth.intro': string;

  // Topbar language switcher — overrides browser default for the session;
  // the override is held in memory only, so a hard reload reverts to the
  // detected/persisted locale.
  'topbar.language.aria': string;
  'topbar.language.label': string;
}

export type TranslationKey = keyof Translations;
