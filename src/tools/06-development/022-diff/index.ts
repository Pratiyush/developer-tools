import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'diff',
  number: 22,
  category: '06-development',
  name: 'Text diff',
  description: 'Line-by-line difference between two text blocks. Adds / removes / unchanged.',
  tags: ['diff', 'compare', 'development'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
