import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'wordcount',
  number: 14,
  category: '09-text',
  name: 'Word counter',
  description:
    'Words, characters, sentences, paragraphs, reading-time estimate. Updates live as you type.',
  tags: ['wordcount', 'text', 'reading-time'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
