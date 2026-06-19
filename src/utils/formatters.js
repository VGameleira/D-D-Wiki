/**
 * Funções de formatação de texto e dados para D&D.
 */

/**
 * Formata o nível de uma magia.
 * @param {number} level - 0 para truques, 1-9 para magias
 * @returns {string}
 */
export function formatSpellLevel(level) {
  if (level === 0) return 'Truque';
  if (level === 1) return '1º círculo';
  if (level === 2) return '2º círculo';
  if (level === 3) return '3º círculo';
  if (level === 4) return '4º círculo';
  if (level === 5) return '5º círculo';
  if (level === 6) return '6º círculo';
  if (level === 7) return '7º círculo';
  if (level === 8) return '8º círculo';
  if (level === 9) return '9º círculo';
  return `Nível ${level}`;
}

/**
 * Formata o nível ordinal de classe (1º, 2º, etc.).
 * @param {number} level
 * @returns {string}
 */
export function formatLevel(level) {
  if (level === 1) return '1º';
  if (level === 2) return '2º';
  if (level === 3) return '3º';
  return `${level}º`;
}

/**
 * Formata um bônus de proficiência.
 * @param {number} bonus
 * @returns {string}
 */
export function formatProfBonus(bonus) {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

/**
 * Capitaliza a primeira letra de uma string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converte um slug para título legível.
 * Ex: 'bola-de-fogo' -> 'Bola de Fogo'
 * @param {string} slug
 * @returns {string}
 */
export function slugToTitle(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Trunca um texto para um número máximo de caracteres.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trimEnd() + '...';
}
