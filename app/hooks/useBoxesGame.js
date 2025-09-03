"use client";
import { useState, useEffect } from "react";

export function useBoxesGame(
  gridSize = 4,
  worms = 2,
  manualRunning = false,
  stopManualGame = () => {}
) {
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
  const collectApples = () => {
    const newGrid = grid.map((cell) => (cell === "🍎" ? "❓" : cell));
    setGrid(newGrid);
    setScore(0); // reset score after collecting
  };

  const handleClick = (index) => {
    if (!manualRunning) return; // prevent clicking unless game started
    if (grid[index] !== "❓") return;

    const newGrid = [...grid];
    if (bombs.includes(index)) {
      newGrid[index] = "💣";
      setGrid(newGrid);
      setTimeout(() => {
        alert(`💀 Worm! Game Over. You collected ${score} 🍎`);
        stopManualGame(); // stop game instantly
        resetGame();
      }, 200);
    } else {
      newGrid[index] = "🍎";
      setGrid(newGrid);
      setScore((prev) => prev + 1);
    }
  };

  return { grid, score, handleClick, resetGame, collectApples };
}
