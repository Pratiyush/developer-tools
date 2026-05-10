import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'yaml-json',
  number: 31,
  category: '03-converter',
  name: 'YAML → JSON',
  description: 'Convert YAML to formatted JSON. Powered by js-yaml.',
  tags: ['yaml', 'json', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
