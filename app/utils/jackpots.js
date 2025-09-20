// app/utils/jackpots.js

/**
 * Compute the base jackpot progression values for a given bet and board configuration.
 *
 * The jackpot values scale based on:
 * - Grid size (total number of boxes)
 * - Number of worms (rarity factor increases with more worms)
 * - A quadratic growth curve from minGrowth → maxGrowth
 *
 * @param {number} bet - The player's bet amount.
 * @param {number} worms - Number of worm boxes on the grid.
 * @param {number} gridSize - Size of the grid (gridSize × gridSize).
 * @returns {{ values: number[], apples: number, totalBoxes: number }}
 *   - values: array of jackpot payout values (floored to 2 decimals)
 *   - apples: number of apple boxes (non-worm)
 *   - totalBoxes: gridSize × gridSize
 *
 * Example:
 * computeBaseJackpotValues(100, 3, 5)
 *   → { values: [102.00, 104.08, …], apples: 22, totalBoxes: 25 }
 */
export function computeBaseJackpotValues(bet, worms, gridSize) {
  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);

  // More worms = higher rarity factor multiplier (1.0 → 5.0)
  const rarityFactor = 1 + (worms / totalBoxes) * 4;

  // Growth bounds for jackpot increase per step
  const minGrowth = 1.02;
  const maxGrowth = 1.5;

  const denom = Math.max(apples - 1, 1); // avoid div/0

  const values = Array.from({ length: apples }, (_, i) => {
    const progress = i / denom; // 0 → 1 progression
    // Quadratic easing: slower growth early, faster late
    const dynamicGrowth =
      minGrowth + (maxGrowth - minGrowth) * (progress * progress);
    const value = bet * rarityFactor * Math.pow(dynamicGrowth, i);
    return +value.toFixed(2);
  });

  return { values, apples, totalBoxes };
}
