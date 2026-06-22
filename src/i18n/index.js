import ptBR from './pt-BR.js';
import en from './en.js';
import { getLang } from '../utils/locale.js';

const locales = { 'pt-BR': ptBR, en };

function resolveNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function t(key, params = {}) {
  const lang = getLang();
  const locale = locales[lang] || locales['pt-BR'];
  let value = resolveNested(locale, key);
  if (value === undefined) {
    const fallback = resolveNested(locales['pt-BR'], key);
    value = fallback ?? key;
  }
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  }
  return value;
}
