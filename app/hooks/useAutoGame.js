"use client";
import { useCallback, useState } from "react";

/**
 * Auto-play engine for Apples & Worms
 */
export function useAutoGame(balance, bet, setBet, setBalance) {
  const MAX_BET = 500;
  const MAX_PCT = 100; // clamp % between 0–100

  const [gameActive, setGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(10);

  // Strategy
  const [afterWin, _setAfterWin] = useState(25); // %
  const [afterLoss, _setAfterLoss] = useState(50); // %
  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);

  // Stepper observed by useBoxesGame
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);

  // UI
  const [originalBet, setOriginalBet] = useState(bet);

  // clamp between 0 and 100 only
  const clampPct = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(MAX_PCT, Math.round(n)));
  };

  const setAfterWin = (valOrFn) => {
    _setAfterWin((prev) =>
      clampPct(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)
    );
  };
  const setAfterLoss = (valOrFn) => {
    _setAfterLoss((prev) =>
      clampPct(typeof valOrFn === "function" ? valOrFn(prev) : valOrFn)
    );
  };

  const stopAutoPlay = useCallback(() => {
    setGameActive(false);
    setRoundInProgress(false);
    setCurrentRound(0);
    setCurrentBoxIndex(0);
  }, []);

  // Arm a round: deduct bet and start stepping
  const armRound = useCallback(
    (roundNumber) => {
      const currentBetRaw = Number(bet);
      const currentBet =
        !Number.isFinite(currentBetRaw) || currentBetRaw <= 0
          ? 0
          : Math.min(MAX_BET, currentBetRaw);

      if (currentBetRaw > MAX_BET) setBet(MAX_BET);

      if (currentBet <= 0) {
        console.warn("[auto] invalid bet, stopping.");
        stopAutoPlay();
        return false;
      }
      if (balance < currentBet) {
        console.warn("[auto] insufficient balance, stopping.");
        stopAutoPlay();
        return false;
      }
      setBalance((b) => b - currentBet);
      setCurrentRound(roundNumber);
      setCurrentBoxIndex(0);
      setRoundInProgress(true);
      return true;
    },
    [balance, bet, setBalance, setBet, stopAutoPlay]
  );

  const startAutoPlay = useCallback(
    (rounds) => {
      const r = Math.max(1, Number(rounds) || 1);

      if (Number(bet) > MAX_BET) setBet(MAX_BET);

      setOriginalBet(Math.min(Number(bet) || 0, MAX_BET));
      setMaxRounds(r);
      setGameActive(true);
      armRound(1);
    },
    [armRound, bet, setBet]
  );

  // Called by useGameLogic when a round completes
  const handleGameResult = useCallback(
    (didWin) => {
      setRoundInProgress(false);

      if (didWin) {
        if (stopOnWin) {
          setGameActive(false);
          return;
        }
        const inc = (Number(afterWin) || 0) / 100;
        if (inc > 0) {
          setBet((prev) => {
            const base = Number(prev) || 0;
            if (base >= MAX_BET) return MAX_BET;
            const next = +(base * (1 + inc)).toFixed(2);
            return Math.min(MAX_BET, next);
          });
        }
      } else {
        if (stopOnLoss) {
          setGameActive(false);
          return;
        }
        const inc = (Number(afterLoss) || 0) / 100;
        if (inc > 0) {
          setBet((prev) => {
            const base = Number(prev) || 0;
            const next = +(base * (1 + inc)).toFixed(2);
            return Math.min(MAX_BET, next);
          });
        }
      }
    },
    [afterWin, afterLoss, setBet, stopOnWin, stopOnLoss]
  );

  const nextRound = useCallback(
    (limitFromCaller) => {
      const limit = Number.isFinite(limitFromCaller)
        ? Number(limitFromCaller)
        : maxRounds;
      if (!gameActive) return;

      const next = currentRound + 1;
      if (next > limit) {
        stopAutoPlay();
        return;
      }
      armRound(next);
    },
    [currentRound, gameActive, maxRounds, armRound, stopAutoPlay]
  );

  return {
    // flags
    gameActive,
    currentRound,
    maxRounds,
    setMaxRounds,

    // strategy
    afterWin,
    setAfterWin,
    afterLoss,
    setAfterLoss,
    stopOnWin,
    setStopOnWin,
    stopOnLoss,
    setStopOnLoss,

    // stepper
    currentBoxIndex,
    setCurrentBoxIndex,
    roundInProgress,
    setRoundInProgress,

    // controls
    startAutoPlay,
    stopAutoPlay,
    nextRound,

    // results
    handleGameResult,

    // UI
    originalBet,
  };
}
