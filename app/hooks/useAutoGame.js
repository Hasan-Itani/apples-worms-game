"use client";
import { useCallback, useState } from "react";

/**
 * Auto‑play engine for Apples & Worms.
 *
 * Responsibilities
 * - Orchestrates multi‑round auto play.
 * - Deducts bet at the start of each round.
 * - Applies bet adjustment strategy after win/loss.
 * - Exposes a stepper observed by the boxes engine (index + round flags).
 *
 * API
 * - startAutoPlay(rounds)
 * - stopAutoPlay()
 * - nextRound(limitFromCaller?)
 * - handleGameResult(didWin[, payout])  // optional 2nd arg kept for compatibility
 */
export function useAutoGame(balance, bet, setBet, setBalance) {
  /**
   * Tunables (could be moved to utils/constants.js)
   */
  const MAX_BET = 500;
  const MAX_PCT = 100; // clamp % between 0-100

  // Engine state
  const [gameActive, setGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(10);

  // Strategy (% increases)
  const [afterWin, _setAfterWin] = useState(25); // %
  const [afterLoss, _setAfterLoss] = useState(50); // %
  const [stopOnWin, setStopOnWin] = useState(false);
  const [stopOnLoss, setStopOnLoss] = useState(false);

  // Stepper observed by useBoxesGame
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);

  // UI
  const [originalBet, setOriginalBet] = useState(bet);

  /* =========================
   * Helpers (DRY & safety)
   * ========================= */
  const clampPct = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(MAX_PCT, Math.round(n)));
  };

  const clampBet = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(MAX_BET, n);
  };

  const applyPctIncrease = (value, pct) => {
    const base = Number(value) || 0;
    const inc = clampPct(pct) / 100;
    if (inc <= 0) return Math.min(MAX_BET, base);
    const next = +(base * (1 + inc)).toFixed(2);
    return Math.min(MAX_BET, next);
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

  /* =========================
   * Controls
   * ========================= */
  const stopAutoPlay = useCallback(() => {
    setGameActive(false);
    setRoundInProgress(false);
    setCurrentRound(0);
    setCurrentBoxIndex(0);
  }, []);

  /** Arm a round: deduct bet and start stepping */
  const armRound = useCallback(
    (roundNumber) => {
      const currentBet = clampBet(bet);
      if (Number(bet) > MAX_BET) setBet(MAX_BET); // normalize UI if needed

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

      setOriginalBet(clampBet(bet));
      setMaxRounds(r);
      setGameActive(true);
      armRound(1);
    },
    [armRound, bet, setBet]
  );

  /**
   * Called by useGameLogic/useBoxesGame when a round completes.
   * didWin: boolean (true if payout > 0)
   * payout (optional): number, ignored here but accepted for compatibility
   */
  const handleGameResult = useCallback(
    (didWin /*, payout */) => {
      setRoundInProgress(false);

      if (didWin) {
        if (stopOnWin) {
          setGameActive(false);
          return;
        }
        setBet((prev) => applyPctIncrease(prev, afterWin));
      } else {
        if (stopOnLoss) {
          setGameActive(false);
          return;
        }
        setBet((prev) => applyPctIncrease(prev, afterLoss));
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

  /* =========================
   * Exposed API
   * ========================= */
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

    // stepper observed by boxes engine
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
