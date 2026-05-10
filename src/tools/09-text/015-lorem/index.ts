import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'lorem',
  number: 15,
  category: '09-text',
  name: 'Lorem ipsum',
  description: 'Classic placeholder text. N paragraphs, opens with the canonical phrase.',
  tags: ['lorem', 'placeholder', 'text'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
