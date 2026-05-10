import { makeConverterRender } from '../_converter-render';
export const render = makeConverterRender({
  from: 'json',
  to: 'yaml',
  i18nPrefix: 'tools.jsonyaml',
});
export { DEFAULT_STATE } from './url-state';
