import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'text-unicode',
  number: 19,
  category: '09-text',
  name: 'Unicode inspector',
  description: 'Per-character codepoint, hex, UTF-8 / UTF-16 bytes, and category.',
  tags: ['unicode', 'codepoint', 'text'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
