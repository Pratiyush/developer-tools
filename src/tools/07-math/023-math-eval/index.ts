import type { ToolModule } from '../../../lib/types';
import { render } from './render';
import { DEFAULT_STATE, parseParams, serializeParams, type State } from './url-state';

export const tool: ToolModule<State> = {
  id: 'math-eval',
  number: 23,
  category: '07-math',
  name: 'Math evaluator',
  description: 'Evaluate arithmetic + Math.* expressions safely. No eval(); custom recursive-descent parser.',
  tags: ['math', 'eval', 'calculator'],
  parseParams,
  serializeParams,
  render,
};

export { DEFAULT_STATE };
