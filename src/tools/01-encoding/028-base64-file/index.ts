import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'base64-file',
  number: 28,
  category: '01-encoding',
  name: 'Base64 file',
  description:
    'Encode any file to base64 + data URI (drag-drop) or decode a base64 / data-URI string back to a downloadable file.',
  tags: ['base64', 'file', 'data-uri', 'encoding'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
