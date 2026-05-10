import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'user-agent',
  number: 25,
  category: '04-web',
  name: 'User-agent parser',
  description: 'Detect browser, OS, and device class from any User-Agent string. Default seeds with your own.',
  tags: ['user-agent', 'browser', 'os', 'web'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
