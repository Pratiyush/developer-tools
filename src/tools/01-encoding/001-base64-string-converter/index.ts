import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'base64-string-converter',
  number: 1,
  category: '01-encoding',
  name: 'Base64 string converter',
  description:
    'Encode and decode UTF-8 strings to base64. URL-safe variant for JWT segments. Hash-routed for sensitive paste.',
  tags: ['base64', 'encoding', 'utf-8', 'url-safe', 'jwt'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
