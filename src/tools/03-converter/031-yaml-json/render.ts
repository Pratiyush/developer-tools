import { makeConverterRender } from '../_converter-render';
export const render = makeConverterRender({
  from: 'yaml',
  to: 'json',
  i18nPrefix: 'tools.yamljson',
});
export { DEFAULT_STATE } from './url-state';
