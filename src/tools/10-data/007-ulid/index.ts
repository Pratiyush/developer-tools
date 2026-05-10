import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'ulid',
  number: 7,
  category: '10-data',
  name: 'ULID generator',
  description:
    'Sortable, monotonic identifiers in Crockford base32. 48-bit timestamp + 80 random bits. Local CSPRNG.',
  tags: ['ulid', 'identifier', 'sortable', 'crockford', 'data'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
