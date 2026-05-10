import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'color',
  number: 18,
  category: '03-converter',
  name: 'Color converter',
  description: 'Hex ↔ RGB ↔ HSL with a live swatch. Type any format, copy any.',
  tags: ['color', 'hex', 'rgb', 'hsl', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
