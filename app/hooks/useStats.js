// hooks/useStats.js
import { useMemo, useState } from "react";

/**
 * Custom React hook to track game board stats.
 *
 * Responsibilities:
 * - Track how many tiles (boxes) the user has opened so far.
 * - Compute applesRemaining = totalBoxes - worms.
 * - Compute chanceOfApple / chanceOfWorm as percentages.
 *
 * @param {number} totalBoxes - Total number of boxes in the grid.
 * @param {number} worms - Number of worm boxes in the grid.
 * @returns {{
 *   openedTiles: number,
 *   setOpenedTiles: Function,
 *   applesRemaining: number,
 *   chanceOfApple: number,
 *   chanceOfWorm: number
 * }}
 *
 * Example:
 * const { openedTiles, setOpenedTiles, chanceOfApple } = useStats(25, 3);
 */
export function useStats(totalBoxes, worms) {
  const [openedTiles, setOpenedTiles] = useState(0);

  // Apples available before opening tiles = total boxes - worms
  const applesRemaining = useMemo(
    () => totalBoxes - worms,
    [totalBoxes, worms]
  );

  // Probability of drawing an apple vs worm
  const chanceOfApple = useMemo(() => {
    const remaining = applesRemaining + worms; // = totalBoxes
    return remaining > 0 ? Math.round((applesRemaining / remaining) * 100) : 0;
  }, [applesRemaining, worms]);

  const chanceOfWorm = 100 - chanceOfApple;

  return {
    openedTiles,
    setOpenedTiles,
    applesRemaining,
    chanceOfApple,
    chanceOfWorm,
  };
}
