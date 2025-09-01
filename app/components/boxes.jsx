"use client";
import { useState } from "react";

export default function Boxes() {
  const generateBombs = (count = 2) => {
    const positions = new Set();
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * 16));
    }
    return [...positions];
  };

  const [grid, setGrid] = useState(Array(16).fill("❓"));
  const [bombs, setBombs] = useState(generateBombs);
  const [score, setScore] = useState(0);

  const resetGame = () => {
    setGrid(Array(16).fill("❓"));
    setBombs(generateBombs());
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

  return (
    <div className="flex flex-col items-center gap-6 align-center">
      <div className="flex flex-col items-center gap-2 w-full max-w-xl">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-widest">JACKPOT</h2>
          <div className="bg-red-700 text-white font-bold px-4 py-1 rounded">
            NOT AVAILABLE
          </div>
        </div>

        <div className="flex justify-center gap-2 bg-orange-900 p-2 rounded-lg">
          {["€5.40", "€6.17", "€7.19", "€8.63", "€10.79"].map((amount, i) => (
            <div
              key={i}
              className="bg-black text-white px-3 py-2 rounded-md font-bold"
            >
              {amount}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 bg-green-700 p-2 rounded-lg w-full">
          {["€0.00", "€0.00", "€0.00", "€0.00", "€0.00"].map((amount, i) => (
            <div
              key={i}
              className="bg-black text-green-400 px-3 py-2 rounded-md font-bold w-full text-center"
            >
              {amount}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-5 gap-y-5 w-[320px] w-max">
        {grid.map((cell, index) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            className={`w-24 h-24 flex items-center justify-center border-2 border-gray-700 rounded-lg text-3xl cursor-pointer transition
              ${cell === "❓" ? "bg-gray-300 hover:bg-gray-400" : "bg-white"}`}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}
