"use client";
import { useRef, useState, useEffect } from "react";
import IncDecButton from "./ui/IncDecButton";
import { nearestStepIndex } from "../utils/nearestStepIndex";

const MODE_SOUND = "/sounds/modes.mp3";
const BET_SOUND = "/sounds/bets.mp3";

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

  const modeAudioRef = useRef(null);
  const betAudioRef = useRef(null);

  const playSound = (ref) => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  };

  const stepBet = (dir) =>
    setBet((prev) => {
      const idx = nearestStepIndex(betSteps, prev) + dir;
      return betSteps[Math.max(0, Math.min(betSteps.length - 1, idx))];
    });

  const stepRounds = (dir) =>
    setRounds((prev) => {
      const idx = nearestStepIndex(roundSteps, prev) + dir;
      return roundSteps[Math.max(0, Math.min(roundSteps.length - 1, idx))];
    });

  const formatMoney = (v) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(v || 0));

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

  // Reusable “control row” shell
  const Row = ({ children }) => (
    <div className="flex items-center w-full h-12 sm:h-10 bg-black/90 rounded-xl overflow-hidden">
      {children}
    </div>
  );

  const LabelBlock = ({ label, children }) => (
    <div className="flex-1 text-white text-center rounded-lg">
      <p className="mt-2 text-[10px] sm:text-xs leading-none">{label}</p>
      <div className="mb-1 text-base sm:text-lg font-bold">{children}</div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 bg-[url('/stats.png')] bg-cover bg-center rounded-2xl shadow-md w-full min-w-0">
      {/* 2-column on md+, single column on small screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
          {/* Bet */}
          <Row>
            <IncDecButton
              onPointerDown={() => {
                startHold(() => stepBet(-1));
                playSound(betAudioRef);
              }}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              disabled={disabled}
            >
              −
            </IncDecButton>
            <LabelBlock label="Bet Amount">€{formatMoney(bet)}</LabelBlock>
            <IncDecButton
              onPointerDown={() => {
                startHold(() => stepBet(1));
                playSound(betAudioRef);
              }}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              disabled={disabled}
            >
              +
            </IncDecButton>
          </Row>

          {/* Worms */}
          <Row>
            <IncDecButton
              onPointerDown={() => {
                startHold(() =>
                  setWorms((prev) => Math.max(minWorms, prev - 1))
                );
                playSound(betAudioRef);
              }}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              disabled={disabled}
            >
              −
            </IncDecButton>
            <LabelBlock label="Worms">{worms}</LabelBlock>
            <IncDecButton
              onPointerDown={() => {
                startHold(() =>
                  setWorms((prev) => Math.min(maxWorms, prev + 1))
                );
                playSound(betAudioRef);
              }}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              disabled={disabled}
            >
              +
            </IncDecButton>
          </Row>

          {/* Balance / Max Win */}
          <div className="space-y-1">
            <Row>
              <LabelBlock label="Balance">€{balance.toFixed(2)}</LabelBlock>
            </Row>
            <div className="text-xs text-white/90 text-center">
              Max Win: €{maxWin.toFixed(2)}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
          {/* Bank It (manual) / Rounds (auto) */}
          {mode === "manual" ? (
            <Row>
              <IncDecButton
                disabled={!canDecrement || openedApples === 0}
                onClick={() => {
                  selectBank(bankIndex - 1);
                  playSound(betAudioRef);
                }}
              >
                −
              </IncDecButton>
              <LabelBlock label="Bank it">
                {availableBankOptions.length > 0
                  ? availableBankOptions[bankIndex]
                  : "0.00"}
              </LabelBlock>
              <IncDecButton
                disabled={!canIncrement || openedApples === 0}
                onClick={() => {
                  selectBank(bankIndex + 1);
                  playSound(betAudioRef);
                }}
              >
                +
              </IncDecButton>
            </Row>
          ) : (
            <Row>
              <IncDecButton
                onClick={() => {
                  stepRounds(-1);
                  playSound(betAudioRef);
                }}
                disabled={disabled}
              >
                −
              </IncDecButton>
              <LabelBlock label="Rounds">{rounds}</LabelBlock>
              <IncDecButton
                onClick={() => {
                  stepRounds(1);
                  playSound(betAudioRef);
                }}
                disabled={disabled}
              >
                +
              </IncDecButton>
            </Row>
          )}

          {/* Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode("manual");
                playSound(modeAudioRef);
              }}
              disabled={disabled}
              className="flex-1 relative group h-12 sm:h-10 rounded-lg font-bold text-white"
            >
              <div
                className={`absolute inset-0 rounded-lg bg-center bg-cover ${
                  mode === "manual"
                    ? "bg-[url('/mode.png')]"
                    : "bg-[url('/button_nonactive.png')] group-hover:bg-[url('/mode.png')]"
                }`}
              />
              <span className="relative z-10">Manual</span>
            </button>
            <button
              onClick={() => {
                setMode("auto");
                playSound(modeAudioRef);
              }}
              disabled={disabled}
              className="flex-1 relative group h-12 sm:h-10 rounded-lg font-bold text-white"
            >
              <div
                className={`absolute inset-0 rounded-lg bg-center bg-cover ${
                  mode === "auto"
                    ? "bg-[url('/mode.png')]"
                    : "bg-[url('/button_nonactive.png')] group-hover:bg-[url('/mode.png')]"
                }`}
              />
              <span className="relative z-10">Auto</span>
            </button>
          </div>

          {/* Grid Size */}
          <div className="flex gap-2">
            {[3, 4, 5].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setGridSizeClamped(size);
                  playSound(modeAudioRef);
                }}
                disabled={disabled}
                className={`flex-1 py-2 h-12 sm:h-10 text-base sm:text-lg text-white font-semibold rounded-lg bg-no-repeat bg-center bg-contain
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

      <audio ref={modeAudioRef} src={MODE_SOUND} preload="auto" />
      <audio ref={betAudioRef} src={BET_SOUND} preload="auto" />
    </div>
  );
}
