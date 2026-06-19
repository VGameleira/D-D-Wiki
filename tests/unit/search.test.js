import { describe, it, expect } from 'vitest';
import { createIndex, searchIndex } from '../../src/utils/search.js';

const items = [
  { name: 'Bola de Fogo', school: 'Evocação', level: 3 },
  { name: 'Mão do Mago', school: 'Truque', level: 0 },
  { name: 'Curar Ferimentos', school: 'Conjuração', level: 1 },
];

describe('createIndex', () => {
  it('deve criar um índice a partir de campos', () => {
    const index = createIndex(items, ['name']);
    expect(index.size).toBeGreaterThan(0);
    expect(index.has('bola')).toBe(true);
  });
});

describe('searchIndex', () => {
  it('deve retornar itens correspondentes', () => {
    const index = createIndex(items, ['name']);
    const results = searchIndex(index, 'bola');
    expect(results).toHaveLength(1);
    expect(results[0].item.name).toBe('Bola de Fogo');
  });

  it('deve retornar array vazio para termo curto', () => {
    const index = createIndex(items, ['name']);
    expect(searchIndex(index, 'a')).toHaveLength(0);
  });

  it('deve retornar vazio para termo sem match', () => {
    const index = createIndex(items, ['name']);
    expect(searchIndex(index, 'zzzzz')).toHaveLength(0);
  });

  it('deve respeitar o limit', () => {
    const manyItems = Array.from({ length: 30 }, (_, i) => ({ name: `Item ${i}`, value: i }));
    const index = createIndex(manyItems, ['name']);
    const results = searchIndex(index, 'item', 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
