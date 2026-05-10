import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'nato',
  number: 13,
  category: '09-text',
  name: 'NATO phonetic',
  description:
    'Spell text out using the ICAO/NATO phonetic alphabet. Letters → words; digits and a few common punctuation included.',
  tags: ['nato', 'phonetic', 'spelling', 'text'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
