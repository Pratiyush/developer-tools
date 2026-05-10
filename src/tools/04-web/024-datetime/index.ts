import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'datetime',
  number: 24,
  category: '04-web',
  name: 'Date & time',
  description: 'Inspect any timestamp — ISO, UTC, local, Unix s/ms, RFC 2822, and a relative description.',
  tags: ['datetime', 'timestamp', 'unix', 'iso', 'web'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
