import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'json-yaml',
  number: 33,
  category: '03-converter',
  name: 'JSON → YAML',
  description: 'Convert JSON to YAML. Powered by js-yaml.',
  tags: ['json', 'yaml', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
