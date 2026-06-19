/**
 * Motor de busca full-text simples.
 *
 * Indexa arrays de objetos por campos específicos e
 * permite busca por termo com relevância básica.
 */

/**
 * Cria um índice de busca a partir de uma lista de itens.
 * @param {Array<Object>} items
 * @param {Array<string>} fields - Campos a serem indexados
 * @returns {Map<string, Array<{item: Object, score: number}>>}
 */
export function createIndex(items, fields) {
  const index = new Map();

  for (const item of items) {
    for (const field of fields) {
      const value = item[field];
      if (!value) continue;

      const words = String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/);

      for (const word of words) {
        if (word.length < 2) continue;

        if (!index.has(word)) {
          index.set(word, []);
        }

        const existing = index.get(word).find(e => e.item === item);
        if (existing) {
          existing.score += 1;
        } else {
          index.get(word).push({ item, score: 1 });
        }
      }
    }
  }

  return index;
}

/**
 * Busca itens no índice por um termo.
 * @param {Map} index
 * @param {string} term
 * @param {number} [limit=20]
 * @returns {Array<{item: Object, score: number}>}
 */
export function searchIndex(index, term, limit = 20) {
  if (!term || term.length < 2) return [];

  const normalized = term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const seen = new Map();
  const terms = normalized.split(/\s+/);

  for (const word of terms) {
    for (const [key, entries] of index) {
      if (!key.startsWith(word)) continue;

      for (const entry of entries) {
        const existing = seen.get(entry.item);
        if (existing) {
          existing.score += entry.score;
        } else {
          seen.set(entry.item, { item: entry.item, score: entry.score });
        }
      }
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
