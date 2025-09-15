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
    <div className="p-2  bg-[url('/stats.png')] bg-cover bg-center rounded-2xl shadow-md flex flex-col justify-between">
      <div className="flex gap-8">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Bet */}
          <div>
            <div className="flex w-[160px] h-[40px] mt-3 items-center bg-black rounded-xl">
              <IncDecButton
                onPointerDown={() => startHold(() => stepBet(-1))}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                disabled={disabled}
              >
                −
              </IncDecButton>
              <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                <p className="text-[11px] mt-3">Bet Amount</p>
                <p className="mb-2">€{bet}.00</p>
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
            <div className="flex w-[160px] h-[40px] mt-3 items-center bg-black rounded-xl">
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
              <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                <p className="text-[11px] mt-3">Worms</p>
                <p className="mb-2">{worms}</p>
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
            <div className="flex w-[160px] h-[40px] mt-3 items-center bg-black rounded-xl">
            <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
              <p className="text-[11px] text-white mt-3">Balance</p>
              <p className="mb-2 text-white">€{balance.toFixed(2)}</p>
            </div>
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
              <div className="flex w-[190px] h-[40px] mt-3 items-center bg-black rounded-xl">
                <IncDecButton
                  disabled={!canDecrement || openedApples === 0}
                  onClick={() => selectBank(bankIndex - 1)}
                >
                  −
                </IncDecButton>
                <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                <p className="text-[11px] mt-3">Bank it</p>
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
              <div className="flex w-[160px] h-[40px] mt-3 items-center bg-black rounded-xl">
                <IncDecButton
                  onClick={() => stepRounds(-1)}
                  disabled={disabled}
                >
                  −
                </IncDecButton>
                <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                  <p className="text-[11px] mt-3">Rounds</p>
                  <p className="mb-2">{rounds}</p>
                </div>
                <IncDecButton onClick={() => stepRounds(1)} disabled={disabled}>
                  +
                </IncDecButton>
              </div>
            </div>
          )}

          {/* Mode */}
          <div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("manual")}
                disabled={disabled}
                className={`flex-1 w-[160px] py-2 rounded-lg font-medium transition relative group`}
              >
                <div
                  className={`absolute inset-0 rounded-lg bg-center bg-cover ${
                    mode === "manual"
                      ? "bg-[url('/mode.png')]"
                      : "bg-[url('/button_nonactive.png')] group-hover:bg-[url('/mode.png')]"
                  }`}
                />
                <span className="relative z-10 text-white font-bold">Manual</span>
              </button>
              <button
                onClick={() => setMode("auto")}
                disabled={disabled}
                className={`flex-1 py-2 rounded-lg w-[20px] font-medium transition relative group`}
              >
                <div
                  className={`absolute inset-0 rounded-lg bg-center bg-cover ${
                    mode === "auto"
                      ? "bg-[url('/mode.png')]"
                      : "bg-[url('/button_nonactive.png')] group-hover:bg-[url('/mode.png')]"
                  }`}
                />
                <span className="relative z-10 text-white font-bold">Auto</span>
              </button>
            </div>
          </div>

          {/* Grid Size */}
          <div>
            <div className="flex gap-2">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => setGridSizeClamped(size)}
                  disabled={disabled}
                  className={`flex-1 text-white text-bold-2xl py-2 rounded-lg font-medium border-0 transition bg-no-repeat bg-center bg-contain
                    ${
                      gridSize === size
                        ? "bg-[url('/button_hovered.png')]"
                        : "bg-[url('/button_unhovered.png')] hover:bg-[url('/button_hovered.png')]"
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
