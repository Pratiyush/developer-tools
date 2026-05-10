import { makeConverterRender } from '../_converter-render';
export const render = makeConverterRender({
  from: 'json',
  to: 'toml',
  i18nPrefix: 'tools.jsontoml',
});
export { DEFAULT_STATE } from './url-state';
