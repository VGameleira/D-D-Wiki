import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { escapeHtml } from '../../src/utils/sanitize.js';
import { loadData, clearCache } from '../../src/utils/fetch-data.js';
import { getLang, setLang, initLocale } from '../../src/utils/locale.js';

const mockStorage = {};
const mockLocalStorage = {
  getItem: (key) => mockStorage[key] ?? null,
  setItem: (key, value) => { mockStorage[key] = value; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
};

describe('escapeHtml', () => {
  it('deve escapar tags HTML', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('deve escapar aspas duplas', () => {
    expect(escapeHtml('"teste"')).toBe('&quot;teste&quot;');
  });

  it('deve escapar &', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('deve retornar string vazia para null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('deve manter string normal inalterada', () => {
    expect(escapeHtml(' texto normal ')).toBe(' texto normal ');
  });

  it('deve escapar string vazia', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('loadData — error handling', () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve lançar erro quando fetch falha', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    await expect(loadData('test')).rejects.toThrow('Network error');
  });

  it('deve lançar erro para resposta HTTP não-ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    await expect(loadData('test')).rejects.toThrow('404');
  });

  it('deve retornar dados cacheados na segunda chamada', async () => {
    const mockData = [{ id: 1, name: 'test' }];
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result1 = await loadData('cached-test');
    expect(result1).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const result2 = await loadData('cached-test');
    expect(result2).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('deve refetch após TTL expirar', async () => {
    vi.useFakeTimers();
    const mockData1 = [{ id: 1 }];
    const mockData2 = [{ id: 2 }];

    let callCount = 0;
    vi.spyOn(global, 'fetch').mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(callCount === 1 ? mockData1 : mockData2),
      });
    });

    await loadData('ttl-test', 1000);
    vi.advanceTimersByTime(1500);
    const result = await loadData('ttl-test', 1000);
    expect(result).toEqual(mockData2);
    expect(callCount).toBe(2);

    vi.useRealTimers();
  });
});

describe('locale — localStorage fallback', () => {
  beforeEach(() => {
    mockStorage['torre-do-sabio-lang'] = 'pt-BR';
    vi.stubGlobal('localStorage', mockLocalStorage);
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deve usar pt-BR como padrão quando localStorage falha', () => {
    vi.spyOn(mockLocalStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const lang = getLang();
    expect(lang).toBe('pt-BR');
  });

  it('deve persistir idioma mesmo com localStorage bloqueado', () => {
    vi.stubGlobal('document', {
      documentElement: { setAttribute: () => {} },
      dispatchEvent: () => {},
    });
    vi.spyOn(mockLocalStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    expect(() => setLang('en')).not.toThrow();
    expect(getLang()).toBe('en');
    vi.unstubAllGlobals();
  });

  it('deve rejeitar idiomas inválidos', () => {
    vi.stubGlobal('document', {
      documentElement: { setAttribute: () => {} },
      dispatchEvent: () => {},
    });
    setLang('pt-BR');
    setLang('invalid');
    expect(getLang()).toBe('pt-BR');
    vi.unstubAllGlobals();
  });
});
