"use client";
import { useState, useMemo } from "react";

/**
 * Hook to manage game grid settings & probabilities.
 *
 * Responsibilities:
 * - Manage grid size (n × n).
 * - Manage worm count, clamped between valid min/max for the grid.
 * - Compute total boxes, applesRemaining, and chance of apple/worm.
 * - Expose openedTiles counter (but does not auto-update it).
 *
 * @param {number} initialSize - Initial grid dimension (default 3).
 * @param {number} initialWorms - Initial worm count (default 1).
 *
 * @returns {{
 *   gridSize: number,
 *   setGridSizeClamped: Function,
 *   worms: number,
 *   setWorms: Function,
 *   totalBoxes: number,
 *   openedTiles: number,
 *   minWorms: number,
 *   maxWorms: number,
 *   applesRemaining: number,
 *   chanceOfApple: number,
 *   chanceOfWorm: number,
 * }}
 *
 * Example:
 * const { gridSize, setGridSizeClamped, worms, setWorms } = useGrid(5, 2);
 */
export function useGrid(initialSize = 3, initialWorms = 1) {
  const [gridSize, setGridSize] = useState(initialSize);
  const [worms, setWorms] = useState(initialWorms);
  const [openedTiles] = useState(0);

  const totalBoxes = gridSize * gridSize;

  // Valid worm bounds depend on grid size
  const minWorms = gridSize === 3 ? 1 : 2;
  const maxWorms = totalBoxes - 1;

  const clampWorms = (val) => Math.min(Math.max(val, minWorms), maxWorms);

  /**
   * Adjusts grid size, and ensures worm count remains within valid bounds.
   */
  const setGridSizeClamped = (size) => {
    setGridSize(size);
    setWorms((prev) => {
      const tb = size * size;
      const min = size === 3 ? 1 : 2;
      const max = tb - 1;
      return Math.min(Math.max(prev, min), max);
    });
  };

  // Derived stats
  const applesRemaining = useMemo(
    () => totalBoxes - worms,
    [totalBoxes, worms]
  );

  const chanceOfApple = useMemo(() => {
    const remaining = applesRemaining + worms; // = totalBoxes
    return remaining > 0 ? Math.round((applesRemaining / remaining) * 100) : 0;
  }, [applesRemaining, worms]);

  const chanceOfWorm = useMemo(() => 100 - chanceOfApple, [chanceOfApple]);

  return {
    gridSize,
    setGridSizeClamped,
    worms,
    setWorms: (valOrFn) =>
      setWorms((prev) =>
        clampWorms(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)
      ),
    totalBoxes,
    openedTiles,
    minWorms,
    maxWorms,
    applesRemaining,
    chanceOfApple,
    chanceOfWorm,
  };
}
