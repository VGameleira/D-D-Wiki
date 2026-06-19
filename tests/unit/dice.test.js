import { describe, it, expect } from 'vitest';
import { rollDie, rollDice, rollAndSum, rollWithAdvantage, rollWithDisadvantage } from '../../src/utils/dice.js';

describe('rollDie', () => {
  it('deve retornar um valor entre 1 e N', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(20);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });
});

describe('rollDice', () => {
  it('deve retornar um array com N elementos', () => {
    const results = rollDice(4, 6);
    expect(results).toHaveLength(4);
    results.forEach(r => {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    });
  });
});

describe('rollAndSum', () => {
  it('deve retornar objeto com total, rolls, modifier e expression', () => {
    const result = rollAndSum(2, 10, 3);
    expect(result.rolls).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(5);
    expect(result.total).toBeLessThanOrEqual(23);
    expect(result.modifier).toBe(3);
    expect(result.expression).toBe('2d10+3');
  });

  it('deve funcionar sem modifier', () => {
    const result = rollAndSum(1, 20);
    expect(result.modifier).toBe(0);
    expect(result.expression).toBe('1d20');
  });
});

describe('rollWithAdvantage', () => {
  it('deve retornar o maior de 2 dados', () => {
    for (let i = 0; i < 50; i++) {
      const { result, rolls } = rollWithAdvantage();
      expect(result).toBe(Math.max(...rolls));
      expect(rolls).toHaveLength(2);
    }
  });
});

describe('rollWithDisadvantage', () => {
  it('deve retornar o menor de 2 dados', () => {
    for (let i = 0; i < 50; i++) {
      const { result, rolls } = rollWithDisadvantage();
      expect(result).toBe(Math.min(...rolls));
      expect(rolls).toHaveLength(2);
    }
  });
});
