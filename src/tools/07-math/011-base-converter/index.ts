import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'base-converter',
  number: 11,
  category: '07-math',
  name: 'Base converter',
  description:
    'Decimal ↔ binary ↔ hex ↔ octal. BigInt-backed for arbitrary-precision; understands 0x / 0b / 0o prefixes.',
  tags: ['base', 'binary', 'hex', 'octal', 'math'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
