import { makeConverterRender } from '../_converter-render';
export const render = makeConverterRender({
  from: 'yaml',
  to: 'toml',
  i18nPrefix: 'tools.yamltoml',
});
export { DEFAULT_STATE } from './url-state';
