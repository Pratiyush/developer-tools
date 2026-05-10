import type { Meta, StoryObj } from '@storybook/html';
import '../_styles/foundations.css';
import { segment } from '../../ui/primitives/segment';
import { status } from '../../ui/primitives/status';
import { stat, statGrid } from '../../ui/primitives/stat';
import { kvList } from '../../ui/data-display/kv-list';

// SB-07 (#46): RTL baseline. Each story exercises the SB-14 primitives
// inside an explicit RTL container so the visual matrix has a deterministic
// snapshot. The locale toolbar (default `ar`) also flips `<html dir>` for
// the surrounding chrome — these stories use a nested `dir="rtl"` so the
// snapshot is stable even when run under LTR locales.

const meta: Meta = {
  title: 'Foundations / RTL',
};

export default meta;

function rtlHost(child: HTMLElement): HTMLElement {
  const root = document.createElement('div');
  root.className = 'dt-foundation-host';
  root.setAttribute('dir', 'rtl');
  root.style.padding = '24px';
  root.style.maxWidth = '720px';
  root.appendChild(child);
  return root;
}

export const SegmentRtl: StoryObj = {
  name: 'Segment / RTL',
  render: () =>
    rtlHost(segment({ items: ['الكل', 'مرشح', 'مرتب'], selected: 0, ariaLabel: 'تصفية' })),
};

export const StatusRtl: StoryObj = {
  name: 'Status / RTL',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '12px';
    wrap.style.flexWrap = 'wrap';
    wrap.appendChild(status({ label: 'نشط', tone: 'success' }));
    wrap.appendChild(status({ label: 'خطأ', tone: 'danger' }));
    wrap.appendChild(status({ label: 'تحذير', tone: 'warning' }));
    return rtlHost(wrap);
  },
};

export const StatGridRtl: StoryObj = {
  name: 'Stat grid / RTL',
  render: () =>
    rtlHost(
      statGrid({
        stats: [
          { label: 'الأدوات', value: '42', delta: '+3', deltaPositive: true },
          { label: 'الأخطاء', value: '7', delta: '-2', deltaPositive: false },
          { label: 'اللغات', value: '15' },
        ],
      }),
    ),
};

export const KvListRtl: StoryObj = {
  name: 'KV list / RTL',
  render: () =>
    rtlHost(
      kvList({
        entries: [
          { key: 'المعرف', value: '123', mono: true, copyable: true },
          { key: 'الاسم', value: 'محول قاعدة 64', copyable: true },
          { key: 'الحالة', value: 'نشط' },
        ],
      }).el,
    ),
};

// Keep `stat` in the import graph (single-card variant cheap to render).
export const StatSingleRtl: StoryObj = {
  name: 'Stat / RTL',
  render: () => rtlHost(stat({ label: 'إجمالي', value: '532' })),
};
