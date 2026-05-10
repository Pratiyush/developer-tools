import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'chmod',
  number: 16,
  category: '08-measurement',
  name: 'chmod calculator',
  description: 'Build Unix file permissions from rwx checkboxes — see octal, symbolic, and the full chmod command.',
  tags: ['chmod', 'permissions', 'unix', 'measurement'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
