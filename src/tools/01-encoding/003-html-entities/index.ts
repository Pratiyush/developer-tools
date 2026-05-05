import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'html-entities',
  number: 3,
  category: '01-encoding',
  name: 'HTML entities encoder/decoder',
  description:
    'Encode the SGML-five (or extended Latin-1 + currency + math + curly quotes) and decode any named or numeric entity (`&copy;`, `&#65;`, `&#x41;`).',
  tags: ['html', 'entities', 'encoding', 'unicode', 'decode'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
