/**
 * `.dt-form-grid` — two-column label/field grid. Each entry is a `{ label,
 * field }` pair; a `<label>` tag is generated and tied to the field via
 * `htmlFor` when the field has an `id`.
 */

export interface FormGridEntry {
  readonly label: string;
  readonly field: HTMLElement;
  readonly hint?: string;
}

export interface FormGridOptions {
  readonly entries: readonly FormGridEntry[];
}

export function formGrid(options: FormGridOptions): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-form-grid';

  for (const entry of options.entries) {
    const labelEl = document.createElement('label');
    labelEl.className = 'dt-form-grid__label';
    labelEl.textContent = entry.label;
    if (entry.field.id !== '') labelEl.htmlFor = entry.field.id;

    const fieldWrap = document.createElement('div');
    fieldWrap.className = 'dt-form-grid__field';
    fieldWrap.appendChild(entry.field);
    if (entry.hint !== undefined) {
      const hintEl = document.createElement('p');
      hintEl.className = 'dt-form-grid__hint';
      hintEl.textContent = entry.hint;
      fieldWrap.appendChild(hintEl);
    }

    root.appendChild(labelEl);
    root.appendChild(fieldWrap);
  }

  return root;
}
