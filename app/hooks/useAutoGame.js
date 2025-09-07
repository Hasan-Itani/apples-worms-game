"use client";
import { useState } from "react";

export function useAutoGame(balance, bet, setBalance) {
  const [gameActive, setGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(10);

  const [afterWin, setAfterWin] = useState(5);
  const [afterLoss, setAfterLoss] = useState(5);
  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);

  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);

  const clampValue = (val, min = 0, max = 100) =>
    Math.min(Math.max(val, min), max);

  const setAfterWinClamped = (valOrFn) => {
    setAfterWin((prev) =>
      clampValue(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)
    );
  };

  const setAfterLossClamped = (valOrFn) => {
    setAfterLoss((prev) =>
      clampValue(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)
    );
  };

  const startAutoPlay = (rounds) => {
    setMaxRounds(rounds);
    setGameActive(true);
    setCurrentRound(1);
    setCurrentBoxIndex(0);
    setRoundInProgress(false);

    // subtract bet for first round
    setBalance((b) => b - bet);
  };

  const stopAutoPlay = () => {
    setGameActive(false);
    setRoundInProgress(false);
    setCurrentRound(0);
    setCurrentBoxIndex(0);
  };

  const nextRound = () => {
    setRoundInProgress(false);
    setCurrentBoxIndex(0);

    if (currentRound >= maxRounds) {
      stopAutoPlay();
      return;
    }

    // subtract bet for next round
    setBalance((b) => b - bet);

    setTimeout(() => {
      setCurrentRound((prev) => prev + 1);
    }, 1000);
  };

  const handleGameResult = (isWin, amount) => {
    if (isWin && stopOnWin) stopAutoPlay();
    if (!isWin && stopOnLoss) stopAutoPlay();
  };

  return {
    gameActive,
    currentRound,
    maxRounds,
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
    currentBoxIndex,
    setCurrentBoxIndex,
    roundInProgress,
    setRoundInProgress,
    nextRound,
    handleGameResult,
  };
}
