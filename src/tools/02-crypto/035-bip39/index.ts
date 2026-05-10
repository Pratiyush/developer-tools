import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'bip39',
  number: 35,
  category: '02-crypto',
  name: 'BIP39 mnemonic',
  description:
    'Generate a BIP39 seed phrase (12/15/18/21/24 words, English wordlist). Also decodes any valid mnemonic back to its raw entropy.',
  tags: ['bip39', 'mnemonic', 'seed-phrase', 'crypto'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
