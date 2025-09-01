"use client";
import { useState, useMemo, useRef } from "react";

export function useGameLogic() {
  // --- Basic States ---
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(5);
  const [worms, setWorms] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [openedTiles, setOpenedTiles] = useState(0);

  const [mode, setMode] = useState("manual"); // manual | auto
  const [rounds, setRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);

  // --- Manual Control ---
  const [manualRunning, setManualRunning] = useState(false);

  // --- Auto Control ---
  const [gameActive, setGameActive] = useState(false);
  const autoIntervalRef = useRef(null);

  // --- Auto Settings ---
  const clampValue = (val, min = 0, max = 100) => Math.min(Math.max(val, min), max);
  const [afterWinRaw, setAfterWinRaw] = useState(5);
  const [afterLossRaw, setAfterLossRaw] = useState(5);
  const setAfterWin = (valOrFn) => {
    setAfterWinRaw(prev => clampValue(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn));
  };
  const setAfterLoss = (valOrFn) => {
    setAfterLossRaw(prev => clampValue(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn));
  };

  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);

  // --- Grid & Worms ---
  const totalBoxes = gridSize * gridSize;
  const minWorms = gridSize === 3 ? 1 : 2;
  const maxWorms = totalBoxes - 1;
  const clampWorms = (val) => Math.min(Math.max(val, minWorms), maxWorms);
  const setGridSizeClamped = (size) => {
    setGridSize(size);
    setWorms(prev => {
      const tb = size * size;
      const min = size === 3 ? 1 : 2;
      const max = tb - 1;
      return Math.min(Math.max(prev, min), max);
    });
  };

  const applesRemaining = useMemo(() => totalBoxes - worms, [totalBoxes, worms]);
  const chanceOfApple = useMemo(() => {
    const remaining = applesRemaining + worms;
    return remaining > 0 ? Math.round((applesRemaining / remaining) * 100) : 0;
  }, [applesRemaining, worms]);
  const chanceOfWorm = useMemo(() => 100 - chanceOfApple, [chanceOfApple]);

  // --- Manual Game ---
  const startGame = () => {
    if (balance < bet) return;
    setBalance(b => b - bet);
    setManualRunning(true);
    setGameActive(true);
  };

  const stopManualGame = () => {
    setManualRunning(false);
    setGameActive(false);
  };

  // --- Auto Game ---
  const startAutoPlay = () => {
    if (gameActive) return;
    setCurrentRound(0);
    setGameActive(true);

    autoIntervalRef.current = setInterval(() => {
      setCurrentRound(r => {
        const nextRound = r + 1;
        if (nextRound > rounds || balance < bet) stopAutoPlay();
        return nextRound;
      });
    }, 600);
  };

  const stopAutoPlay = () => {
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    autoIntervalRef.current = null;
    setGameActive(false);
  };

  return {
    // --- Basic ---
    bet,
    setBet,
    balance,
    worms,
    setWorms: valOrFn => setWorms(prev => clampWorms(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)),
    gridSize,
    setGridSizeClamped,
    totalBoxes,
    minWorms,
    maxWorms,
    applesRemaining,
    openedTiles,
    chanceOfApple,
    chanceOfWorm,
    mode,
    setMode,
    rounds,
    setRounds,
    currentRound,
    roundSteps: [5, 10, 15, 20, 30, 40, 50, 100],

    // --- Manual ---
    startGame,
    stopManualGame,
    manualRunning,

    // --- Auto ---
    startAutoPlay,
    stopAutoPlay,
    gameActive,
    autoIntervalRef,
    afterWin: afterWinRaw,
    setAfterWin,
    afterLoss: afterLossRaw,
    setAfterLoss,
    stopOnWin,
    setStopOnWin,
    stopOnLoss,
    setStopOnLoss,
  };
}
