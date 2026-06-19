/**
 * Carrega dados JSON de /data/ com cache em memória.
 *
 * Uso:
 *   const classes = await loadData('classes');
 *   const mago = await loadData('classes/mago');
 */
const cache = new Map();

/**
 * Carrega um arquivo JSON do diretório de dados.
 * @param {string} endpoint - Caminho sem extensão (ex: 'classes', 'spells/bola-de-fogo')
 * @returns {Promise<Object|Array>}
 */
export async function loadData(endpoint) {
  if (cache.has(endpoint)) {
    return cache.get(endpoint);
  }

  const url = `/data/${endpoint}.json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Falha ao carregar ${url}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    cache.set(endpoint, data);
    return data;
  } catch (err) {
    console.error(`[loadData] Erro ao carregar "${endpoint}":`, err);
    throw err;
  }
}

/**
 * Limpa o cache de dados (útil para recarregar conteúdo).
 */
export function clearCache() {
  cache.clear();
}
