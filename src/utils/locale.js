const STORAGE_KEY = 'torre-do-sabio-lang';
const DEFAULT_LANG = 'pt-BR';

function safeGet(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* localStorage indisponível */
  }
}

let currentLang = safeGet(STORAGE_KEY, DEFAULT_LANG);

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang !== 'pt-BR' && lang !== 'en') return;
  currentLang = lang;
  safeSet(STORAGE_KEY, lang);
  document.documentElement.setAttribute('lang', lang);
  document.dispatchEvent(
    new CustomEvent('lang-change', { detail: { lang } })
  );
}

export function initLocale() {
  document.documentElement.setAttribute('lang', currentLang);
}
