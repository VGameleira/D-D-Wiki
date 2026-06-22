const STORAGE_KEY = 'torre-do-sabio-theme';
const THEME_ATTR = 'data-theme';

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

export function initTheme() {
  const saved = safeGet(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute(THEME_ATTR);
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute(THEME_ATTR, theme);
  safeSet(STORAGE_KEY, theme);

  document.dispatchEvent(
    new CustomEvent('theme-change', { detail: { theme } })
  );
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute(THEME_ATTR) || 'light';
}
