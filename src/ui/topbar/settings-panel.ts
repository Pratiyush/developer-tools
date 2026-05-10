/**
 * Topbar settings panel — runtime tool-visibility chooser.
 *
 * Renders a gear-icon button that opens a popover anchored under the
 * topbar. Inside the popover the user can:
 *   1. Switch between "show all" and "show only the selected" modes.
 *   2. Tick / untick individual tools in a scrollable list (subset mode).
 *   3. Hit "Recording mode" to collapse to just the currently-open tool.
 *   4. Quick-action: "Show all" / "Hide all" buttons.
 *
 * Why this lives in the topbar (vs. a dedicated route): the user wanted a
 * one-click toggle they can reach during recording without leaving the tool
 * they're filming. A modal would steal focus; an inline popover doesn't.
 *
 * State model: this component is presentational. It reads + writes through
 * the {@link tool-visibility} module. The owning code (main.ts) listens via
 * `onVisibilityChange` and rebuilds the layout.
 */

import { translate } from '../../lib/i18n';
import {
  applyVisibility,
  getVisibility,
  setVisibility,
  showOnly,
  type VisibilityState,
} from '../../lib/tool-visibility';
import type { ToolMeta } from '../../lib/types';
import { button, icon } from '../primitives';

export interface SettingsPanelOptions {
  tools: readonly ToolMeta[];
  /** ID of the currently-open tool (for the "recording mode" preset). */
  getActiveToolId?: () => string | null;
}

export interface SettingsPanelHandle {
  el: HTMLElement;
  dispose(): void;
}

export function settingsPanel(opts: SettingsPanelOptions): SettingsPanelHandle {
  const wrap = document.createElement('span');
  wrap.classList.add('dt-settings');

  const trigger = button({
    iconName: 'settings',
    variant: 'icon',
    ariaLabel: translate('topbar.settings.aria'),
  });
  trigger.classList.add('dt-settings__trigger');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  wrap.appendChild(trigger);

  let menu: HTMLElement | null = null;

  const onTriggerClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (menu) close();
    else open();
  };
  trigger.addEventListener('click', onTriggerClick);

  const onDocClick = (event: MouseEvent): void => {
    if (!menu) return;
    if (!wrap.contains(event.target as Node)) close();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (!menu) return;
    if (event.key === 'Escape') {
      close();
      trigger.focus();
    }
  };

  function open(): void {
    menu = renderPanel();
    wrap.appendChild(menu);
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
  }

  function close(): void {
    if (!menu) return;
    menu.remove();
    menu = null;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKey);
  }

  /** Build the popover contents from scratch on every open. Cheap (≤ 100
   *  tools) and avoids stale-state bugs where the registry mutates between
   *  opens. */
  function renderPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.classList.add('dt-settings__menu');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', translate('settings.heading'));

    const heading = document.createElement('h2');
    heading.classList.add('dt-settings__heading');
    heading.textContent = translate('settings.heading');
    panel.appendChild(heading);

    const lede = document.createElement('p');
    lede.classList.add('dt-settings__lede');
    lede.textContent = translate('settings.lede');
    panel.appendChild(lede);

    const state = getVisibility();

    // Mode radio (all vs subset). Implemented as two buttons so the
    // dropdown styling carries over and we don't need a fresh primitive.
    const modeRow = document.createElement('div');
    modeRow.classList.add('dt-settings__modes');
    modeRow.setAttribute('role', 'radiogroup');
    modeRow.setAttribute('aria-label', translate('settings.heading'));

    const allBtn = makeModeButton(translate('settings.mode.all'), state.mode === 'all', () => {
      setVisibility({ mode: 'all', ids: state.ids });
      rerender();
    });
    const subsetBtn = makeModeButton(
      translate('settings.mode.subset'),
      state.mode === 'subset',
      () => {
        setVisibility({ mode: 'subset', ids: state.ids });
        rerender();
      },
    );
    modeRow.append(allBtn, subsetBtn);
    panel.appendChild(modeRow);

    // Recording-mode preset — fast path for "isolate the tool I'm recording".
    if (opts.getActiveToolId) {
      const activeId = opts.getActiveToolId();
      if (activeId) {
        const presetRow = document.createElement('div');
        presetRow.classList.add('dt-settings__preset');

        const presetBtn = button({
          label: `${translate('settings.preset.recording')} — ${translate('settings.action.show.only')}`,
          variant: 'primary',
          onClick: () => {
            setVisibility(showOnly(activeId));
            rerender();
          },
        });
        presetBtn.classList.add('dt-settings__preset-btn');

        const note = document.createElement('p');
        note.classList.add('dt-settings__preset-note');
        note.textContent = translate('settings.preset.recording.note');

        presetRow.append(presetBtn, note);
        panel.appendChild(presetRow);
      }
    }

    // Bulk actions — hidden when the registry is empty.
    if (opts.tools.length > 0) {
      const bulkRow = document.createElement('div');
      bulkRow.classList.add('dt-settings__bulk');

      const showAllBtn = button({
        label: translate('settings.action.show.all'),
        variant: 'ghost',
        onClick: () => {
          const allIds = opts.tools.map((t) => t.id);
          setVisibility({ mode: 'subset', ids: allIds });
          rerender();
        },
      });
      const hideAllBtn = button({
        label: translate('settings.action.show.none'),
        variant: 'ghost',
        onClick: () => {
          setVisibility({ mode: 'subset', ids: [] });
          rerender();
        },
      });
      bulkRow.append(showAllBtn, hideAllBtn);
      panel.appendChild(bulkRow);
    }

    // Per-tool checkbox list.
    const list = document.createElement('div');
    list.classList.add('dt-settings__list');
    list.setAttribute('role', 'group');

    if (opts.tools.length === 0) {
      const empty = document.createElement('p');
      empty.classList.add('dt-settings__empty');
      empty.textContent = translate('settings.empty.registry');
      list.appendChild(empty);
    } else {
      const allowed = new Set(state.ids);
      const isAllMode = state.mode === 'all';
      // Pre-sort by category + tool number so the list mirrors the sidebar.
      const sorted = [...opts.tools].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.number - b.number;
      });
      for (const tool of sorted) {
        const item = document.createElement('label');
        item.classList.add('dt-settings__item');
        if (isAllMode) item.classList.add('dt-settings__item--locked');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('dt-settings__checkbox');
        checkbox.checked = isAllMode || allowed.has(tool.id);
        // In "all" mode the checkboxes are informational — disabling them
        // makes that obvious and prevents accidental changes that would
        // be invisible (the mode override wins).
        checkbox.disabled = isAllMode;
        checkbox.addEventListener('change', () => {
          const current = getVisibility();
          const next = new Set(current.ids);
          if (checkbox.checked) next.add(tool.id);
          else next.delete(tool.id);
          // Preserve registry order in the persisted ID list.
          const ordered = opts.tools.map((t) => t.id).filter((id) => next.has(id));
          setVisibility({ mode: 'subset', ids: ordered });
          updateSummary();
        });

        const labelText = document.createElement('span');
        labelText.classList.add('dt-settings__item-label');
        labelText.textContent = tool.name;

        const onlyBtn = document.createElement('button');
        onlyBtn.type = 'button';
        onlyBtn.classList.add('dt-settings__only');
        onlyBtn.textContent = translate('settings.action.show.only');
        onlyBtn.addEventListener('click', (event) => {
          event.preventDefault();
          setVisibility(showOnly(tool.id));
          rerender();
        });

        item.append(checkbox, labelText, onlyBtn);
        list.appendChild(item);
      }
    }
    panel.appendChild(list);

    // Live summary at the bottom — updates without a full re-render when
    // the user is checking individual boxes.
    const summary = document.createElement('p');
    summary.classList.add('dt-settings__summary');
    panel.appendChild(summary);

    function updateSummary(): void {
      const s = getVisibility();
      const total = opts.tools.length;
      const visible = applyVisibility(opts.tools, s).length;
      if (s.mode === 'all') {
        summary.textContent = translate('settings.summary.all', { total });
      } else if (visible === 0) {
        summary.textContent = translate('settings.summary.empty');
      } else {
        summary.textContent = translate('settings.summary.subset', {
          visible,
          total,
        });
      }
    }
    updateSummary();

    return panel;
  }

  /** Re-mounts the panel contents in place after a state change that
   *  affects more than just the summary line (mode flip, preset, bulk). */
  function rerender(): void {
    if (!menu) return;
    const fresh = renderPanel();
    menu.replaceWith(fresh);
    menu = fresh;
  }

  return {
    el: wrap,
    dispose() {
      close();
      trigger.removeEventListener('click', onTriggerClick);
    },
  };
}

function makeModeButton(label: string, active: boolean, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('dt-settings__mode');
  if (active) btn.classList.add('dt-settings__mode--active');
  btn.setAttribute('role', 'radio');
  btn.setAttribute('aria-checked', active ? 'true' : 'false');

  if (active) {
    btn.appendChild(icon('check', { size: 12 }));
  }
  const span = document.createElement('span');
  span.textContent = label;
  btn.appendChild(span);

  btn.addEventListener('click', onClick);
  return btn;
}

/** Re-export the visibility module so consumers can subscribe without a
 *  separate import. */
export type { VisibilityState };
