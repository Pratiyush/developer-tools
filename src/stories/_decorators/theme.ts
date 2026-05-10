/**
 * Storybook decorator that writes the toolbar's theme / preset / density
 * globals onto the document root so CSS rules keyed on `[data-theme]`,
 * `[data-preset]`, `[data-density]` actually apply.
 *
 * Storybook's HTML framework calls the decorator with `(storyFn, context)`;
 * we only read `context.globals`. The decorator returns the rendered DOM
 * unchanged.
 *
 * SB-16 (#54) folds `[data-theme]` into `[data-preset]` later. Until then,
 * both attributes are written so the live app's CSS (which still keys on
 * `[data-theme]`) and the design system's CSS (`[data-preset]`/`[data-density]`)
 * both repaint together.
 */

interface ThemeGlobals {
  readonly theme?: string;
  readonly preset?: string;
  readonly density?: string;
}

/**
 * Apply the toolbar globals to a root element. Exported separately from the
 * Storybook-shaped decorator so unit tests can drive it without pulling in
 * Storybook's runtime.
 */
export function applyThemeGlobals(globals: ThemeGlobals, root: HTMLElement): void {
  if (typeof globals.theme === 'string' && globals.theme.length > 0) {
    root.dataset.theme = globals.theme;
  }
  if (typeof globals.preset === 'string' && globals.preset.length > 0) {
    root.dataset.preset = globals.preset;
  }
  if (typeof globals.density === 'string' && globals.density.length > 0) {
    root.dataset.density = globals.density;
  }
}

interface DecoratorContext {
  readonly globals: ThemeGlobals;
}

type StoryFn = (context: DecoratorContext) => unknown;

/**
 * Storybook HTML decorator. Reads `context.globals` and applies them to
 * `document.documentElement` before delegating to the wrapped story.
 */
export function themeDecorator(storyFn: StoryFn, context: DecoratorContext): unknown {
  if (typeof document !== 'undefined') {
    applyThemeGlobals(context.globals, document.documentElement);
  }
  return storyFn(context);
}
