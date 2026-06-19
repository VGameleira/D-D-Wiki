import { describe, it, expect } from 'vitest';
import {
  formatSpellLevel,
  formatLevel,
  formatProfBonus,
  capitalize,
  slugToTitle,
  truncate,
} from '../../src/utils/formatters.js';

describe('formatSpellLevel', () => {
  it('deve retornar "Truque" para nível 0', () => {
    expect(formatSpellLevel(0)).toBe('Truque');
  });

  it('deve retornar "1º círculo" para nível 1', () => {
    expect(formatSpellLevel(1)).toBe('1º círculo');
  });

  it('deve retornar "9º círculo" para nível 9', () => {
    expect(formatSpellLevel(9)).toBe('9º círculo');
  });
});

describe('formatLevel', () => {
  it('deve formatar níveis ordinais', () => {
    expect(formatLevel(1)).toBe('1º');
    expect(formatLevel(2)).toBe('2º');
    expect(formatLevel(3)).toBe('3º');
    expect(formatLevel(10)).toBe('10º');
  });
});

describe('formatProfBonus', () => {
  it('deve adicionar + para bônus positivos', () => {
    expect(formatProfBonus(2)).toBe('+2');
  });

  it('deve manter - para negativos', () => {
    expect(formatProfBonus(-1)).toBe('-1');
  });
});

describe('capitalize', () => {
  it('deve capitalizar primeira letra', () => {
    expect(capitalize('bola de fogo')).toBe('Bola de fogo');
  });

  it('deve retornar string vazia para input vazio', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('slugToTitle', () => {
  it('deve converter slug para título', () => {
    expect(slugToTitle('bola-de-fogo')).toBe('Bola De Fogo');
  });
});

describe('truncate', () => {
  it('deve truncar texto longo', () => {
    const text = 'a'.repeat(200);
    const result = truncate(text, 100);
    expect(result).toHaveLength(103); /* 100 chars + '...' */
    expect(result.endsWith('...')).toBe(true);
  });

  it('não deve truncar texto curto', () => {
    const text = 'texto curto';
    expect(truncate(text, 100)).toBe(text);
  });

  it('deve lidar com null/undefined', () => {
    expect(truncate(null)).toBe('');
    expect(truncate(undefined)).toBe('');
  });
});
