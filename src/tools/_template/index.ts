import type { ToolModule } from '../../lib/types';
import { parseParams, serializeParams, type State } from './url-state';
import { render } from './render';

export const tool: ToolModule<State> = {
  id: '__SLUG__',
  number: 0,
  category: '__CATEGORY__',
  name: '__NAME__',
  description: '__DESCRIPTION__',
  tags: [],
  parseParams,
  serializeParams,
  render,
};
