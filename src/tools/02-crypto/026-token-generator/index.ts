import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'token-generator',
  number: 26,
  category: '02-crypto',
  name: 'Token generator',
  description:
    'Random API tokens with named alphabets (base64url / hex / alnum / numeric / base58). Live entropy hint, browser CSPRNG.',
  tags: ['token', 'random', 'security', 'entropy', 'crypto'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
