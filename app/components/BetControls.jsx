"use client";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import IncDecButton from "./ui/IncDecButton";
import { nearestStepIndex } from "../utils/nearestStepIndex";

const MODE_SOUND = "/sounds/modes.mp3";
const BET_SOUND = "/sounds/bets.mp3";

/**
 * BetControls — left/right control panel for bet, worms, mode, rounds, and grid size.
 *
 * Refactor highlights:
 * - DRY: generic stepper helpers for stepping through arrays (bet & rounds).
 * - Bugfix: worms + button now clamps to maxWorms (previously used Math.max).
 * - Safer audio: centralized playSound; clears hold interval on unmount & pointercancel.
 * - Perf: memoized money formatter; handlers wrapped in useCallback.
 */
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
  /* =========================
   * Constants & steppers
   * ========================= */
  const betSteps = useMemo(
    () => [
      0.1, 0.2, 0.3, 0.4, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10, 15, 20, 30, 50, 100,
      150, 200, 300, 400, 500,
    ],
    []
  );

  const stepBySteps = useCallback((steps, current, dir) => {
    const idx = nearestStepIndex(steps, Number(current) || 0);
    const next = Math.max(0, Math.min(steps.length - 1, idx + dir));
    return steps[next];
  }, []);

  const stepBet = useCallback(
    (dir) => setBet((prev) => stepBySteps(betSteps, prev, dir)),
    [betSteps, setBet, stepBySteps]
  );
  const stepRounds = useCallback(
    (dir) => setRounds((prev) => stepBySteps(roundSteps, prev, dir)),
    [roundSteps, setRounds, stepBySteps]
  );

  /* =========================
   * Press-and-hold behaviour for +/- buttons
   * ========================= */
  const holdRef = useRef(null);
  const startHold = useCallback(
    (fn) => {
      if (disabled) return;
      fn();
      holdRef.current = setInterval(fn, 120);
    },
    [disabled]
  );
  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);
  useEffect(() => stopHold, [stopHold]); // cleanup on unmount

  /* =========================
   * Sounds (mode/bet click)
   * ========================= */
  const modeAudioRef = useRef(null);
  const betAudioRef = useRef(null);
  const playSound = useCallback((ref) => {
    const el = ref?.current;
    if (!el) return;
    try {
      el.currentTime = 0;
      el.play().catch(() => {});
    } catch {}
  }, []);

  /* =========================
   * Bank It options (manual mode)
   * ========================= */
  const [bankIndex, setBankIndex] = useState(0);

  useEffect(() => {
    // Reset when no apples opened
    if (openedApples === 0) {
      if (bankIndex !== 0) setBankIndex(0);
      if (bankValue !== 0) setBankValue(0);
      return;
    }
    // If no options, zero out
    if (availableBankOptions.length === 0) {
      if (bankValue !== 0) setBankValue(0);
      return;
    }
    const clamped = Math.min(bankIndex, availableBankOptions.length - 1);
    if (clamped !== bankIndex) setBankIndex(clamped);
    const nextVal = availableBankOptions[clamped];
    if (bankValue !== nextVal) setBankValue(nextVal);
  }, [openedApples, availableBankOptions, bankIndex, bankValue, setBankValue]);

  const selectBank = useCallback(
    (i) => {
      const clamped = Math.max(0, Math.min(i, availableBankOptions.length - 1));
      setBankIndex(clamped);
      setBankValue(availableBankOptions[clamped] || 0);
    },
    [availableBankOptions, setBankValue]
  );

  const canIncrement = bankIndex < Math.max(0, availableBankOptions.length - 1);
  const canDecrement = bankIndex > 0;

  /* =========================
   * Formatting
   * ========================= */
  const moneyFmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );
  const formatMoney = useCallback(
    (v) => moneyFmt.format(Number(v || 0)),
    [moneyFmt]
  );

  /* =========================
   * Render
   * ========================= */
  return (
    <div className="p-2 bg-[url('/stats.png')] bg-cover bg-center rounded-2xl shadow-md flex flex-col justify-between select-none">
      <div className="flex gap-8">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Bet */}
          <div>
            <div className="flex w-[160px] h-[40px] mt-3 items-center bg-black rounded-xl">
              <IncDecButton
                onPointerDown={() => {
                  startHold(() => stepBet(-1));
                  playSound(betAudioRef);
                }}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onPointerCancel={stopHold}
                disabled={disabled}
              >
                −
              </IncDecButton>
              <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                <p className="text-[11px] mt-3">Bet Amount</p>
                <p className="mb-2">€{formatMoney(bet)}</p>
              </div>
              <IncDecButton
                onPointerDown={() => {
                  startHold(() => stepBet(1));
                  playSound(betAudioRef);
                }}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onPointerCancel={stopHold}
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
                onPointerDown={() => {
                  startHold(() =>
                    setWorms((prev) =>
                      Math.max(minWorms, Math.min(maxWorms, prev - 1))
                    )
                  );
                  playSound(betAudioRef);
                }}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onPointerCancel={stopHold}
                disabled={disabled}
              >
                −
              </IncDecButton>
              <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                <p className="text-[11px] mt-3">Worms</p>
                <p className="mb-2">{worms}</p>
              </div>
              <IncDecButton
                onPointerDown={() => {
                  // BUGFIX: clamp to maxWorms on increment
                  startHold(() =>
                    setWorms((prev) =>
                      Math.max(minWorms, Math.min(maxWorms, prev + 1))
                    )
                  );
                  playSound(betAudioRef);
                }}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onPointerCancel={stopHold}
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
                <p className="mb-2 text-white">€{formatMoney(balance)}</p>
              </div>
            </div>
            <div className="text-xs text-white mt-1">
              Max Win: €{formatMoney(maxWin)}
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
                  onClick={() => {
                    selectBank(bankIndex - 1);
                    playSound(betAudioRef);
                  }}
                >
                  −
                </IncDecButton>
                <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                  <p className="text-[11px] mt-3">Bank it</p>
                  {availableBankOptions.length > 0 ? (
                    <span>€{formatMoney(availableBankOptions[bankIndex])}</span>
                  ) : (
                    <span>€0.00</span>
                  )}
                </div>
                <IncDecButton
                  disabled={!canIncrement || openedApples === 0}
                  onClick={() => {
                    selectBank(bankIndex + 1);
                    playSound(betAudioRef);
                  }}
                >
                  +
                </IncDecButton>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex w-[160px] h-[40px] mt-3 items-center bg-black rounded-xl">
                <IncDecButton
                  onClick={() => {
                    stepRounds(-1);
                    playSound(betAudioRef);
                  }}
                  disabled={disabled}
                >
                  −
                </IncDecButton>
                <div className="flex-1 text-white text-center text-lg font-bold rounded-lg shadow-inner">
                  <p className="text-[11px] mt-3">Rounds</p>
                  <p className="mb-2">{rounds}</p>
                </div>
                <IncDecButton
                  onClick={() => {
                    stepRounds(1);
                    playSound(betAudioRef);
                  }}
                  disabled={disabled}
                >
                  +
                </IncDecButton>
              </div>
            </div>
          )}

          {/* Mode */}
          <div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("manual");
                  playSound(modeAudioRef);
                }}
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
                <span className="relative z-10 text-white font-bold">
                  Manual
                </span>
              </button>
              <button
                onClick={() => {
                  setMode("auto");
                  playSound(modeAudioRef);
                }}
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
                  onClick={() => {
                    setGridSizeClamped(size);
                    playSound(modeAudioRef);
                  }}
                  disabled={disabled}
                  className={`flex-1 text-white text-bold-2xl py-2 rounded-lg font-medium border-0 transition bg-no-repeat bg-center bg-contain ${
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

      {/* Audio elements */}
      <audio ref={modeAudioRef} src={MODE_SOUND} preload="auto" />
      <audio ref={betAudioRef} src={BET_SOUND} preload="auto" />
    </div>
  );
}
