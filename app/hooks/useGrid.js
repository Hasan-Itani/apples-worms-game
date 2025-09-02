"use client";
import { useState, useMemo } from "react";

export function useGrid(initialSize = 3, initialWorms = 1) {
  const [gridSize, setGridSize] = useState(initialSize);
  const [worms, setWorms] = useState(initialWorms);
  const [openedTiles, setOpenedTiles] = useState(0);

  const totalBoxes = gridSize * gridSize;
  const minWorms = gridSize === 3 ? 1 : 2;
  const maxWorms = totalBoxes - 1;

  const clampWorms = (val) => Math.min(Math.max(val, minWorms), maxWorms);

  const setGridSizeClamped = (size) => {
    setGridSize(size);
    setWorms((prev) => {
      const tb = size * size;
      const min = size === 3 ? 1 : 2;
      const max = tb - 1;
      return Math.min(Math.max(prev, min), max);
    });
  };

  const applesRemaining = useMemo(() => totalBoxes - worms, [totalBoxes, worms]);
  const chanceOfApple = useMemo(() => {
    const remaining = applesRemaining + worms;
    return remaining > 0 ? Math.round((applesRemaining / remaining) * 100) : 0;
  }, [applesRemaining, worms]);
  const chanceOfWorm = useMemo(() => 100 - chanceOfApple, [chanceOfApple]);

  return {
    gridSize,
    setGridSizeClamped,
    worms,
    setWorms: (valOrFn) => setWorms((prev) => clampWorms(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)),
    totalBoxes,
    openedTiles,
    minWorms,
    maxWorms,
    applesRemaining,
    chanceOfApple,
    chanceOfWorm,
  };
}
