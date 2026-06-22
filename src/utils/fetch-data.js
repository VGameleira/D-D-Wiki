const cache = new Map();
const DEFAULT_TTL = 300000;

export async function loadData(endpoint, ttlMs = DEFAULT_TTL) {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }

  const url = `/data/${endpoint}.json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Falha ao carregar ${url}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    cache.set(endpoint, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(`[loadData] Erro ao carregar "${endpoint}":`, err);
    throw err;
  }
}

export function clearCache() {
  cache.clear();
}

export function invalidateCache(endpoint) {
  cache.delete(endpoint);
}
