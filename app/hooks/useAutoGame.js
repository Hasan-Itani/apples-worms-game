"use client";
import { useState, useRef } from "react";

export function useAutoGame(balance, bet, rounds = 10) {
  const [gameActive, setGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const autoIntervalRef = useRef(null);

  const [afterWin, setAfterWin] = useState(5);
  const [afterLoss, setAfterLoss] = useState(5);
  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);

  const clampValue = (val, min = 0, max = 100) => Math.min(Math.max(val, min), max);

  const setAfterWinClamped = (valOrFn) => {
    setAfterWin((prev) => clampValue(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn));
  };

  const setAfterLossClamped = (valOrFn) => {
    setAfterLoss((prev) => clampValue(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn));
  };

  const startAutoPlay = () => {
    if (gameActive) return;
    setCurrentRound(0);
    setGameActive(true);

    autoIntervalRef.current = setInterval(() => {
      setCurrentRound((r) => {
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
    gameActive,
    autoIntervalRef,
    currentRound,
    startAutoPlay,
    stopAutoPlay,
    afterWin,
    setAfterWin: setAfterWinClamped,
    afterLoss,
    setAfterLoss: setAfterLossClamped,
    stopOnWin,
    setStopOnWin,
    stopOnLoss,
    setStopOnLoss,
  };
}
