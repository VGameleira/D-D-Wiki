/**
 * Utilitários para rolagem de dados D&D.
 */

/**
 * Rola um dado de N lados.
 * @param {number} sides - Número de lados (ex: 20 para d20)
 * @returns {number}
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rola múltiplos dados do mesmo tipo.
 * @param {number} count - Quantidade de dados
 * @param {number} sides - Número de lados
 * @returns {number[]}
 */
export function rollDice(count, sides) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  return results;
}

/**
 * Rola dados e retorna a soma.
 * @param {number} count - Quantidade de dados
 * @param {number} sides - Número de lados
 * @param {number} [modifier=0] - Modificador a adicionar
 * @returns {{ total: number, rolls: number[], modifier: number, expression: string }}
 */
export function rollAndSum(count, sides, modifier = 0) {
  const rolls = rollDice(count, sides);
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return {
    total,
    rolls,
    modifier,
    expression: `${count}d${sides}${modifier ? modStr : ''}`,
  };
}

/**
 * Rola com vantagem (2d20, pega o maior).
 * @param {number} sides
 * @returns {{ result: number, rolls: number[] }}
 */
export function rollWithAdvantage(sides = 20) {
  const rolls = [rollDie(sides), rollDie(sides)];
  return { result: Math.max(...rolls), rolls };
}

/**
 * Rola com desvantagem (2d20, pega o menor).
 * @param {number} sides
 * @returns {{ result: number, rolls: number[] }}
 */
export function rollWithDisadvantage(sides = 20) {
  const rolls = [rollDie(sides), rollDie(sides)];
  return { result: Math.min(...rolls), rolls };
}
