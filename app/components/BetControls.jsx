"use client";
import { useRef } from "react";

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
  mode,
  setMode,
  rounds,
  setRounds,
  roundSteps,
}) {
  const betSteps = [
    0.1, 0.2, 0.3, 0.4, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10, 15, 20, 30, 50, 100,
    150, 200, 300, 400, 500,
  ];
  const intervalRef = useRef(null);
  const startHold = (action) => {
    action();
    intervalRef.current = setInterval(action, 120);
  };
  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const nearestStepIndex = (arr, value) => {
    let bestI = 0,
      bestDiff = Infinity;
    arr.forEach((v, i) => {
      const diff = Math.abs(v - value);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestI = i;
      }
    });
    return bestI;
  };
  const stepBet = (dir) =>
    setBet(
      (prev) =>
        betSteps[
          Math.max(
            0,
            Math.min(
              betSteps.length - 1,
              nearestStepIndex(betSteps, prev) + dir
            )
          )
        ]
    );
  const stepRounds = (dir) =>
    setRounds(
      (prev) =>
        roundSteps[
          Math.max(
            0,
            Math.min(
              roundSteps.length - 1,
              nearestStepIndex(roundSteps, prev) + dir
            )
          )
        ]
    );

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4 select-none">
      <h3 className="font-semibold">💰 Balance: {balance}</h3>

      {/* Bet */}
      <div>
        <h3 className="font-semibold">Bet Amount</h3>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => startHold(() => stepBet(-1))}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="font-bold min-w-[60px] text-center">{bet}</span>
          <button
            onPointerDown={() => startHold(() => stepBet(1))}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Worms */}
      <div>
        <h3 className="font-semibold">Worms</h3>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() =>
              startHold(() => setWorms((prev) => Math.max(minWorms, prev - 1)))
            }
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="font-bold">{worms}</span>
          <button
            onPointerDown={() =>
              startHold(() => setWorms((prev) => Math.min(maxWorms, prev + 1)))
            }
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
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

      {/* Mode */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 px-3 py-1 rounded ${
            mode === "manual"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode("auto")}
          className={`flex-1 px-3 py-1 rounded ${
            mode === "auto"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Auto
        </button>
      </div>

      {/* Actions */}
      {mode === "manual" ? (
        <button
          onClick={startGame}
          className="w-full py-2 mt-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Bank It
        </button>
      ) : (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => stepRounds(-1)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span className="font-bold">{rounds} Rounds</span>
            <button
              onClick={() => stepRounds(1)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>
          <button
            onClick={() => setRounds(10)}
            className="w-full px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}