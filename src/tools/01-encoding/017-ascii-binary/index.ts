import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'ascii-binary',
  number: 17,
  category: '01-encoding',
  name: 'ASCII ↔ binary',
  description: 'Encode any UTF-8 text to its 8-bit binary stream and decode back. Multi-byte chars handled.',
  tags: ['ascii', 'binary', 'encoding'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
