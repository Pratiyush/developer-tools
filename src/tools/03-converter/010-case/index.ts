import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'case',
  number: 10,
  category: '03-converter',
  name: 'Case converter',
  description:
    'camelCase, PascalCase, snake_case, kebab-case, dot.case, path/case — all at once. Acronym-aware splitting.',
  tags: ['case', 'string', 'naming', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
