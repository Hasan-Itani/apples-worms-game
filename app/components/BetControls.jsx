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
    <div className="p-5 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl shadow-xl border border-slate-300 w-full max-w-3xl">
      <div className="flex gap-8">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Bet */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">
              Bet Amount
            </h3>
            <div className="flex items-center gap-3">
              <button
                onPointerDown={() => startHold(() => stepBet(-1))}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
              >
                −
              </button>
              <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                {bet}
              </div>
              <button
                onPointerDown={() => startHold(() => stepBet(1))}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Worms */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Worms</h3>
            <div className="flex items-center gap-3">
              <button
                onPointerDown={() =>
                  startHold(() =>
                    setWorms((prev) => Math.max(minWorms, prev - 1))
                  )
                }
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
              >
                −
              </button>
              <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                {worms}
              </div>
              <button
                onPointerDown={() =>
                  startHold(() =>
                    setWorms((prev) => Math.min(maxWorms, prev + 1))
                  )
                }
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Balance + Max Win */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Balance</h3>
            <div className="text-xl font-bold text-slate-800">{balance}</div>
            <div className="text-xs text-gray-500 mt-1">Max Win: €1,440.00</div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Actions - manual vs auto */}
          {mode === "manual" ? (
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">
                Bank It
              </h3>
              <div className="flex items-center gap-3 ">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition">
                  −
                </button>
                <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                  2.34$
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition">
                  +
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">
                Auto Rounds
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => stepRounds(-1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
                >
                  −
                </button>
                <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                  {rounds} 
                </div>
                <button
                  onClick={() => stepRounds(1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-300 hover:bg-slate-400 active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Mode toggle */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("manual")}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  mode === "manual"
                    ? "bg-blue-500 text-white shadow"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setMode("auto")}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  mode === "auto"
                    ? "bg-blue-500 text-white shadow"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Grid Size */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">
              Grid Size
            </h3>
            <div className="flex gap-2">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => setGridSizeClamped(size)}
                  className={`flex-1 py-2 rounded-lg font-medium border transition ${
                    gridSize === size
                      ? "bg-green-500 text-white border-green-600 shadow"
                      : "bg-slate-300 hover:bg-slate-400 border-slate-400"
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
