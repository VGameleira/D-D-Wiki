/**
 * Gerenciamento de tema claro/escuro.
 *
 * Persiste a preferência no localStorage e respeita
 * a preferência do sistema (prefers-color-scheme).
 */

const STORAGE_KEY = 'torre-do-sabio-theme';
const THEME_ATTR = 'data-theme';

/**
 * Inicializa o tema: detecta preferência salva ou do sistema.
 */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

/**
 * Alterna entre claro e escuro.
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute(THEME_ATTR);
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

/**
 * Aplica um tema ao documento.
 * @param {'light'|'dark'} theme
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute(THEME_ATTR, theme);
  localStorage.setItem(STORAGE_KEY, theme);

  document.dispatchEvent(
    new CustomEvent('theme-change', { detail: { theme } })
  );
}

/**
 * Retorna o tema atual.
 * @returns {'light'|'dark'}
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute(THEME_ATTR) || 'light';
}
