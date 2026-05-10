import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'rsa-keypair',
  number: 29,
  category: '02-crypto',
  name: 'RSA key pair',
  description:
    'Generate an RSA key pair (2048/3072/4096 bits, RSASSA-PKCS1-v1_5) and export public + private as PEM. Browser-side via WebCrypto.',
  tags: ['rsa', 'pki', 'pem', 'crypto'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
