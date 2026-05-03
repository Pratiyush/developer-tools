import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'base64-basic-auth',
  number: 2,
  category: '01-encoding',
  name: 'HTTP Basic Auth helper',
  description:
    'Build and read the `Authorization: Basic <base64>` header. UTF-8 round-trip, deep-link, all on-device.',
  tags: ['base64', 'authorization', 'basic-auth', 'http', 'header'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
