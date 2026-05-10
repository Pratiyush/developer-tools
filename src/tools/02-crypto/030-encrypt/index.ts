import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'encrypt',
  number: 30,
  category: '02-crypto',
  name: 'Encrypt / decrypt',
  description:
    'AES-256-GCM with a passphrase-derived key (PBKDF2 250k iterations). Authenticated encryption — wrong passphrase or tampering fails loudly.',
  tags: ['encrypt', 'aes', 'pbkdf2', 'crypto'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
