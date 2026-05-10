import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'regex',
  number: 21,
  category: '06-development',
  name: 'Regex tester',
  description: 'Live-match a JavaScript pattern against a test string. Capture groups, match indices, all there.',
  tags: ['regex', 'pattern', 'development'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
