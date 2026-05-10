import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'uuid',
  number: 6,
  category: '10-data',
  name: 'UUID generator',
  description:
    'RFC 4122 v4 UUIDs from your browser CSPRNG. Bulk generate, format, and copy — nothing leaves the page.',
  tags: ['uuid', 'identifier', 'random', 'rfc4122', 'data'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
