import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'hmac',
  number: 27,
  category: '02-crypto',
  name: 'HMAC generator',
  description:
    'Sign a message with HMAC + SHA-1/256/384/512 via WebCrypto. Useful for API request signing (AWS sigv4, Stripe events, Slack webhooks).',
  tags: ['hmac', 'sign', 'mac', 'crypto'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
