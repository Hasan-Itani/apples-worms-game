"use client";
import { useState } from "react";

export function useAutoGame(balance, bet, setBet, setBalance) {
  const [gameActive, setGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(10);

  const [afterWin, setAfterWin] = useState(25); // Percentage increase after win
  const [afterLoss, setAfterLoss] = useState(50); // Percentage increase after loss
  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);

  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);

  // Store original bet for reset functionality
  const [originalBet, setOriginalBet] = useState(bet);

  const clampValue = (val, min = 0, max = 200) =>
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
    setOriginalBet(bet); // Store the starting bet
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
    // Reset bet to original value when stopping
    setBet(originalBet);
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
    // Adjust bet based on win/loss and percentage settings
    if (isWin && afterWin > 0) {
      setBet((prevBet) => {
        const increase = prevBet * (afterWin / 100);
        return +(prevBet + increase).toFixed(2);
      });
    } else if (!isWin && afterLoss > 0) {
      setBet((prevBet) => {
        const increase = prevBet * (afterLoss / 100);
        return +(prevBet + increase).toFixed(2);
      });
    }

    // Stop conditions
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
    originalBet, // Expose for UI display
  };
}
