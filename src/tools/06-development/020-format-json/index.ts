import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'format-json',
  number: 20,
  category: '06-development',
  name: 'JSON formatter',
  description: 'Pretty-print or minify JSON. Surface parse errors with context.',
  tags: ['json', 'format', 'pretty', 'development'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
