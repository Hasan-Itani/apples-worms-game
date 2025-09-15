"use client";
import { useRef, useState, useEffect } from "react";
import IncDecButton from "./ui/IncDecButton";
import { nearestStepIndex } from "../utils/nearestStepIndex";

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
  mode,
  setMode,
  rounds,
  setRounds,
  roundSteps,
  openedApples,
  disabled = false,
  bankValue,
  setBankValue,
  availableBankOptions = [],
  maxWin,
}) {
  const betSteps = [
    0.1, 0.2, 0.3, 0.4, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10, 15, 20, 30, 50, 100,
    150, 200, 300, 400, 500,
  ];

  const intervalRef = useRef(null);
  const startHold = (action) => {
    if (disabled) return;
    action();
    intervalRef.current = setInterval(action, 120);
  };
  const stopHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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

  const [bankIndex, setBankIndex] = useState(0);

  useEffect(() => {
    if (openedApples === 0) {
      if (bankIndex !== 0) setBankIndex(0);
      if (bankValue !== 0) setBankValue(0);
      return;
    }
    if (availableBankOptions.length === 0) {
      if (bankValue !== 0) setBankValue(0);
      return;
    }
    const clamped = Math.min(bankIndex, availableBankOptions.length - 1);
    if (clamped !== bankIndex) setBankIndex(clamped);
    const nextVal = availableBankOptions[clamped];
    if (bankValue !== nextVal) setBankValue(nextVal);
  }, [openedApples, availableBankOptions, bankIndex, bankValue, setBankValue]);

  const selectBank = (i) => {
    const clamped = Math.max(0, Math.min(i, availableBankOptions.length - 1));
    setBankIndex(clamped);
    setBankValue(availableBankOptions[clamped] || 0);
  };

  const canIncrement = bankIndex < Math.max(0, availableBankOptions.length - 1);
  const canDecrement = bankIndex > 0;

  return (
    <div className="p-2 border rounded-lg bg-gradient-to-b from-blue-400 to-blue-200 shadow-md flex flex-col justify-between">
      <div className="flex gap-8">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Bet */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">
              Bet Amount
            </h3>
            <div className="flex items-center gap-3">
              <IncDecButton
                onPointerDown={() => startHold(() => stepBet(-1))}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                disabled={disabled}
              >
                −
              </IncDecButton>
              <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                {bet}
              </div>
              <IncDecButton
                onPointerDown={() => startHold(() => stepBet(1))}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                disabled={disabled}
              >
                +
              </IncDecButton>
            </div>
          </div>

          {/* Worms */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Worms</h3>
            <div className="flex items-center gap-3">
              <IncDecButton
                onPointerDown={() =>
                  startHold(() =>
                    setWorms((prev) => Math.max(minWorms, prev - 1))
                  )
                }
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                disabled={disabled}
              >
                −
              </IncDecButton>
              <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                {worms}
              </div>
              <IncDecButton
                onPointerDown={() =>
                  startHold(() =>
                    setWorms((prev) => Math.min(maxWorms, prev + 1))
                  )
                }
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                disabled={disabled}
              >
                +
              </IncDecButton>
            </div>
          </div>

          {/* Balance */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Balance</h3>
            <div className="text-xl font-bold text-slate-800">
              {balance.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Max Win: €{maxWin.toFixed(2)}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Bank It / Auto Rounds */}
          {mode === "manual" ? (
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">
                Bank It
              </h3>
              <div className="flex items-center gap-3">
                <IncDecButton
                  disabled={!canDecrement || openedApples === 0}
                  onClick={() => selectBank(bankIndex - 1)}
                >
                  −
                </IncDecButton>
                <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                  {availableBankOptions.length > 0
                    ? availableBankOptions[bankIndex]
                    : "0.00"}
                </div>
                <IncDecButton
                  disabled={!canIncrement || openedApples === 0}
                  onClick={() => selectBank(bankIndex + 1)}
                >
                  +
                </IncDecButton>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">
                Auto Rounds
              </h3>
              <div className="flex items-center gap-3">
                <IncDecButton
                  onClick={() => stepRounds(-1)}
                  disabled={disabled}
                >
                  −
                </IncDecButton>
                <div className="flex-1 text-center text-lg font-bold bg-white rounded-lg py-2 shadow-inner">
                  {rounds}
                </div>
                <IncDecButton onClick={() => stepRounds(1)} disabled={disabled}>
                  +
                </IncDecButton>
              </div>
            </div>
          )}

          {/* Mode */}
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("manual")}
                disabled={disabled}
                className={`flex-1 py-2 rounded-lg font-medium border-3 transition ${
                  mode === "manual"
                    ? "bg-blue-500 text-white border-black shadow"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setMode("auto")}
                disabled={disabled}
                className={`flex-1 py-2 rounded-lg font-medium border-3 transition ${
                  mode === "auto"
                    ? "bg-blue-500 text-white border-black shadow"
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
                  disabled={disabled}
                  className={`flex-1 py-1 rounded-lg font-medium border-3 transition ${
                    gridSize === size
                      ? "bg-blue-500 text-white border-black shadow"
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
