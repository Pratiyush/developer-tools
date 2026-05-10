import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'roman',
  number: 12,
  category: '07-math',
  name: 'Roman numerals',
  description:
    'Encode 1–3999 to canonical Roman numerals (subtractive form) and decode back. Idempotent on round-trip.',
  tags: ['roman', 'numerals', 'math', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
