// app/utils/jackpots.js
export function computeBaseJackpotValues(bet, worms, gridSize) {
  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);
  const rarityFactor = 1 + (worms / totalBoxes) * 4;
  const minGrowth = 1.02;
  const maxGrowth = 1.5;

  const denom = Math.max(apples - 1, 1);
  const values = Array.from({ length: apples }, (_, i) => {
    const progress = i / denom;
    const dynamicGrowth =
      minGrowth + (maxGrowth - minGrowth) * (progress * progress);
    const value = bet * rarityFactor * Math.pow(dynamicGrowth, i);
    return +value.toFixed(2);
  });

  return { values, apples, totalBoxes };
}
