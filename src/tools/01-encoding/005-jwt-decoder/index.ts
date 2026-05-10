import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'jwt-decoder',
  number: 5,
  category: '01-encoding',
  name: 'JWT decoder',
  description:
    'Split a JSON Web Token, base64url-decode each segment, and pretty-print header + payload. Decode-only — never verifies the signature, so treat the result as untrusted until your server confirms it.',
  tags: ['jwt', 'auth', 'token', 'json', 'base64url'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
