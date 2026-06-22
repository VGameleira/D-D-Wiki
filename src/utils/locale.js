const STORAGE_KEY = 'torre-do-sabio-lang';
const DEFAULT_LANG = 'pt-BR';

let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang !== 'pt-BR' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.setAttribute('lang', lang);
  document.dispatchEvent(
    new CustomEvent('lang-change', { detail: { lang } })
  );
}

export function initLocale() {
  document.documentElement.setAttribute('lang', currentLang);
}
