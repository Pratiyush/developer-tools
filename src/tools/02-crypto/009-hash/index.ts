import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'hash',
  number: 9,
  category: '02-crypto',
  name: 'Hash text',
  description:
    'SHA-1, SHA-256, SHA-384, SHA-512 in your browser via WebCrypto. UTF-8 in, hex out — nothing leaves the page.',
  tags: ['hash', 'sha256', 'sha512', 'crypto', 'digest'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
