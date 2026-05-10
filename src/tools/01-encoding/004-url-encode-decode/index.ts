import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'url-encode-decode',
  number: 4,
  category: '01-encoding',
  name: 'URL encoder/decoder',
  description:
    'Percent-encode text for query strings, paths, fragments — or decode something pasted from a URL bar. Component (`encodeURIComponent`) vs URI (`encodeURI`) variants, plus form-encoded `+`-for-space toggle.',
  tags: ['url', 'encoding', 'percent', 'decode', 'querystring'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
