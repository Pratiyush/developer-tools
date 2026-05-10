/**
 * Shared render for the 4 YAML/JSON/TOML converters. Each tool's render.ts
 * is a 5-line file that imports this and supplies its `from` / `to` /
 * i18n key prefix. Keeps the markup consistent without rewriting it 4×.
 */

import { translate } from '../../lib/i18n';
import {
  copyButton,
  heroBlock,
  type CopyButtonHandle,
} from '../../ui/primitives';
import { panel } from '../../ui/primitives/panel';
import { textarea } from '../../ui/primitives/textarea';
import { convert, type Format } from './_format-convert';
import type { TranslationKey } from '../../locales/types';

export interface ConverterState {
  readonly input: string;
}

export interface ConverterRenderConfig {
  readonly from: Format;
  readonly to: Format;
  /** i18n key prefix — e.g. `tools.yamljson` produces `tools.yamljson.heading`. */
  readonly i18nPrefix: string;
}

export function makeConverterRender(cfg: ConverterRenderConfig) {
  return function render(
    host: HTMLElement,
    initial: ConverterState,
    options: { onStateChange?: (next: ConverterState) => void } = {},
  ): { dispose(): void } {
    const doc = host.ownerDocument;
    let state: ConverterState = { ...initial };
    const disposers: (() => void)[] = [];
    const k = (suffix: string): TranslationKey => `${cfg.i18nPrefix}.${suffix}` as TranslationKey;

    const root = doc.createElement('div');
    root.classList.add('dt-tool-page');

    root.appendChild(
      heroBlock({
        eyebrowKey: k('eyebrow'),
        heroKey: k('heading'),
        ledeKey: k('intro'),
        doc,
      }),
    );

    // Input
    const input = textarea({
      value: state.input,
      placeholder: translate(k('placeholder')),
      ariaLabel: translate(k('input.aria')),
      rows: 12,
      onInput: (v) => {
        state = { ...state, input: v };
        refresh();
        options.onStateChange?.(state);
      },
    });
    input.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

    const inBody = doc.createElement('div');
    inBody.classList.add('dt-base64__pane-body');
    inBody.appendChild(input);
    root.appendChild(
      panel({
        label: translate(k('input.label')),
        num: 1,
        right: cfg.from.toUpperCase(),
        body: inBody,
        className: 'dt-base64__pane',
      }),
    );

    // Output
    const out = textarea({
      value: '',
      ariaLabel: translate(k('output.aria')),
      rows: 12,
      readonly: true,
    });
    out.classList.add('dt-base64__textarea', 'dt-base64__textarea--mono');

    const err = doc.createElement('div');
    err.classList.add('dt-jwt__error');
    err.style.display = 'none';

    const outBody = doc.createElement('div');
    outBody.classList.add('dt-base64__pane-body');
    outBody.append(err, out);

    const copyHandle: CopyButtonHandle = copyButton({
      text: () => out.value,
      label: translate('tools.base64.copy'),
    });
    copyHandle.el.classList.add('dt-base64__copy');
    disposers.push(() => copyHandle.dispose());
    const foot = doc.createElement('div');
    foot.classList.add('dt-base64__pane-foot');
    foot.append(copyHandle.el);
    outBody.appendChild(foot);

    root.appendChild(
      panel({
        label: translate(k('output.label')),
        num: 2,
        right: cfg.to.toUpperCase(),
        body: outBody,
        className: 'dt-base64__pane',
      }),
    );

    host.appendChild(root);
    refresh();

    return {
      dispose(): void {
        for (const fn of disposers) fn();
        if (root.parentNode === host) host.removeChild(root);
      },
    };

    function refresh(): void {
      if (!state.input.trim()) {
        out.value = '';
        err.style.display = 'none';
        return;
      }
      const r = convert(state.input, cfg.from, cfg.to);
      if (r.ok) {
        out.value = r.output;
        err.style.display = 'none';
      } else {
        out.value = '';
        err.textContent = r.error;
        err.style.display = 'block';
      }
    }
  };
}

export function makeConverterUrlState() {
  const DEFAULT_STATE: ConverterState = { input: '' };
  const parseParams = (
    _search: URLSearchParams,
    hash: URLSearchParams,
  ): ConverterState => ({ input: hash.get('in') ?? '' });
  const serializeParams = (
    state: ConverterState,
  ): { search: URLSearchParams; hash: URLSearchParams } => {
    const hash = new URLSearchParams();
    if (state.input) hash.set('in', state.input);
    return { search: new URLSearchParams(), hash };
  };
  return { DEFAULT_STATE, parseParams, serializeParams };
}
