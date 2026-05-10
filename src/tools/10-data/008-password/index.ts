import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'password',
  number: 8,
  category: '10-data',
  name: 'Password generator',
  description:
    'Strong, random passwords from your browser CSPRNG. Configurable alphabet, exclude ambiguous chars, live entropy meter.',
  tags: ['password', 'random', 'security', 'entropy', 'data'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
