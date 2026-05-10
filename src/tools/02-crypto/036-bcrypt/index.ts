import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'bcrypt',
  number: 36,
  category: '02-crypto',
  name: 'Bcrypt hash',
  description:
    'Hash a password with bcrypt (cost 4–14, automatic salt) or verify a plaintext against an existing $2a/$2b hash.',
  tags: ['bcrypt', 'password', 'hash', 'crypto'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
