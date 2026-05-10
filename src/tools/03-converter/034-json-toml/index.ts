import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'json-toml',
  number: 34,
  category: '03-converter',
  name: 'JSON → TOML',
  description: 'Convert JSON to TOML. Top-level must be a JSON object — TOML root is always a table.',
  tags: ['json', 'toml', 'converter'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
