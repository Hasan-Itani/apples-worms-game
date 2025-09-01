"use client";
import { useState } from "react";

export function useGameLogic() {
  const [gridSize, setGridSize] = useState(3);
  const [worms, setWorms] = useState(1);
  const [bet, setBet] = useState(5);
  const [balance, setBalance] = useState(10000);
  const [openedTiles, setOpenedTiles] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const totalBoxes = gridSize * gridSize;
  const minWorms = gridSize === 3 ? 1 : 2;
  const maxWorms = totalBoxes - 1;

  // Keep worms in range
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

  const applesRemaining = totalBoxes - worms;
  const chanceOfApple = () => {
    const remaining = applesRemaining + worms;
    return remaining > 0 ? Math.round((applesRemaining / remaining) * 100) : 0;
  };
  const chanceOfWorm = () => 100 - chanceOfApple();

  const startGame = () => {
    if (bet > 0 && balance >= bet) {
      setGameStarted(true);
      setBalance((b) => b - bet);
      setOpenedTiles(0);
    }
  };

  return {
    bet, setBet, balance,
    worms, setWorms: (valOrFn) =>
      setWorms((prev) => clampWorms(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)),
    gridSize, setGridSizeClamped, totalBoxes,
    minWorms, maxWorms,
    applesRemaining, openedTiles,
    chanceOfApple: chanceOfApple(),
    chanceOfWorm: chanceOfWorm(),
    gameStarted, startGame,
  };
}
