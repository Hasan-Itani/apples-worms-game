"use client";
import { useState, useEffect } from "react";

export function useBoxesGame(gridSize = 4, worms = 2) {
  const totalBoxes = gridSize * gridSize;

  const generateBombs = (count = 2) => {
    const positions = new Set();
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * totalBoxes));
    }
    return [...positions];
  };

  const [grid, setGrid] = useState(Array(totalBoxes).fill("❓"));
  const [bombs, setBombs] = useState(generateBombs(worms));
  const [score, setScore] = useState(0);

  // reset when gridSize or worms changes
  useEffect(() => {
    setGrid(Array(totalBoxes).fill("❓"));
    setBombs(generateBombs(worms));
    setScore(0);
  }, [gridSize, worms]);

  const resetGame = () => {
    setGrid(Array(totalBoxes).fill("❓"));
    setBombs(generateBombs(worms));
    setScore(0);
  };

  const handleClick = (index) => {
    if (grid[index] !== "❓") return;

    const newGrid = [...grid];
    if (bombs.includes(index)) {
      newGrid[index] = "💣";
      setGrid(newGrid);
      setTimeout(() => {
        alert(`game over, lets try again (should be modal): ${score} 🍎`);
        resetGame();
      }, 300);
    } else {
      newGrid[index] = "🍎";
      setGrid(newGrid);
      setScore((prev) => prev + 1);
    }
  };

  return {
    grid,
    score,
    handleClick,
    resetGame,
  };
}