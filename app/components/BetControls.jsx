"use client";
import { useRef, useState } from "react";

export default function BetControls({
  bet,
  setBet,
  balance,
  worms,
  setWorms,
  minWorms,
  maxWorms,
  gridSize,
  setGridSizeClamped,
  startGame,
}) {
  // Ordered bet steps
  const betSteps = [
    0.1, 0.2, 0.3, 0.4, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5,
    10, 15, 20, 30, 50, 100, 150, 200, 300, 400, 500,
  ];

  const clampIndex = (i) => Math.max(0, Math.min(betSteps.length - 1, i));

  // Find the nearest step index to a value (tolerant to float noise)
  const nearestStepIndex = (value) => {
    let bestI = 0;
    let bestDiff = Infinity;
    const v = Number(value);
    for (let i = 0; i < betSteps.length; i++) {
      const diff = Math.abs(betSteps[i] - v);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestI = i;
      }
    }
    return bestI;
  };

  // STEP BET using functional updater to avoid stale closures
  const stepBet = (direction) => {
    setBet((prev) => {
      const i = nearestStepIndex(prev);
      const nextI = clampIndex(i + direction);
      return betSteps[nextI];
    });
  };

  // Hold logic (fast)
  const intervalRef = useRef(null);
  const handleHold = (action) => {
    // clear old just in case
    if (intervalRef.current) clearInterval(intervalRef.current);
    action(); // immediate tick
    intervalRef.current = setInterval(action, 200); // fast repeat
  };
  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Manual / Auto toggle (UI only for now)
  const [mode, setMode] = useState("manual"); // "manual" | "auto"

  return (
    <div
      className="p-4 border rounded-lg bg-white shadow-sm space-y-4 select-none"
      onContextMenu={(e) => e.preventDefault()} // prevent long-press menu on mobile
    >
      <h3 className="font-semibold">💰 Balance: {balance}</h3>

      {/* Bet Controls */}
      <div>
        <h3 className="font-semibold">Bet Amount</h3>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => handleHold(() => stepBet(-1))}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>

          <span className="font-bold min-w-[80px] text-center">
            {Number(bet).toFixed(bet < 1 ? 1 : 2).replace(/(\.0+|0+)$/, "")}
          </span>

          <button
            onPointerDown={() => handleHold(() => stepBet(1))}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Worm Controls */}
      <div>
        <h3 className="font-semibold">Worms</h3>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() =>
              handleHold(() =>
                setWorms((prev) => Math.max(minWorms, prev - 1))
              )
            }
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="font-bold">{worms}</span>
          <button
            onPointerDown={() =>
              handleHold(() =>
                setWorms((prev) => Math.min(maxWorms, prev + 1))
              )
            }
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Allowed: {minWorms} - {maxWorms}
        </p>
      </div>

      {/* Grid Size */}
      <div>
        <h3 className="font-semibold">Grid Size</h3>
        <div className="flex gap-2">
          {[3, 4, 5].map((size) => (
            <button
              key={size}
              onClick={() => setGridSizeClamped(size)}
              className={`px-3 py-1 rounded border ${
                gridSize === size
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

      {/* Manual / Auto Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-2 rounded ${
            mode === "manual"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode("auto")}
          className={`flex-1 py-2 rounded ${
            mode === "auto"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Auto
        </button>
      </div>

      {/* Start Game */}
      <button
        onClick={startGame}
        className="w-full py-2 mt-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Bank It
      </button>
    </div>
  );
}
