import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'yaml-toml',
  number: 32,
  category: '03-converter',
  name: 'YAML → TOML',
  description: 'Convert YAML to TOML via js-yaml + smol-toml. Top-level must be a table.',
  tags: ['yaml', 'toml', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
