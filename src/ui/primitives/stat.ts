/**
 * `.dt-stat` — single stat card. Optional delta indicator with positive
 * (`data-trend="up"`) or negative (`data-trend="down"`) styling.
 *
 * `.dt-stat-grid` — wrapper for laying out multiple stat cards.
 *
 * Markup:
 *   <div class="dt-stat-grid">
 *     <div class="dt-stat">
 *       <span class="dt-stat__label">Tools shipped</span>
 *       <span class="dt-stat__value">42</span>
 *       <span class="dt-stat__delta" data-trend="up">+3 this week</span>
 *     </div>
 *     …
 *   </div>
 */

export interface StatOptions {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly deltaPositive?: boolean;
}

export interface StatGridOptions {
  readonly stats: readonly StatOptions[];
}

export function stat(options: StatOptions): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-stat';

  const labelEl = document.createElement('span');
  labelEl.className = 'dt-stat__label';
  labelEl.textContent = options.label;
  root.appendChild(labelEl);

  const valueEl = document.createElement('span');
  valueEl.className = 'dt-stat__value';
  valueEl.textContent = options.value;
  root.appendChild(valueEl);

  if (options.delta !== undefined) {
    const deltaEl = document.createElement('span');
    deltaEl.className = 'dt-stat__delta';
    deltaEl.textContent = options.delta;
    if (options.deltaPositive !== undefined) {
      deltaEl.dataset.trend = options.deltaPositive ? 'up' : 'down';
    }
    root.appendChild(deltaEl);
  }

  return root;
}

export function statGrid(options: StatGridOptions): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'dt-stat-grid';
  for (const opts of options.stats) root.appendChild(stat(opts));
  return root;
}
