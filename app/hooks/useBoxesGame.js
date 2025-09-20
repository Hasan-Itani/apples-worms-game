// hooks/useBoxesGame.js
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeBaseJackpotValues } from "../utils/jackpots";
import { BANK_PENALTY_RATE } from "../utils/constants";

/**
 * Manages the boxes game core state: grid, bombs, jackpots, banking, and round flow.
 *
 * Notes on this refactor:
 * - DRY: extracted small helpers (sumBank, revealAllBoxes, schedule) to reduce duplication
 * - Stability: wrapped public handlers in useCallback; centralizes timeouts with refs
 * - Naming: `onLoss` was used for both win/lose; kept for backward-compat but documented
 */
export function useBoxesGame(
  gridSize = 4,
  worms = 2,
  manualRunning = false,
  stopManualGame = () => {},
  bet = 1,
  /**
   * Callback invoked at the end of a round (manual or auto).
   * Receives the payout number (win if > 0, else 0 when bust/no apples).
   */
  onLoss = () => {},
  mode = "manual",
  autoGameActive = false,
  selectedBoxes = [],
  currentBoxIndex = 0,
  setCurrentBoxIndex = () => {},
  roundInProgress = false,
  setRoundInProgress = () => {},
  nextRound = () => {},
  maxRounds = 10
) {
  /* =========================
   * 1) Constants / derived
   * ========================= */
  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);

  // Tunables (could live in constants.js)
  const REVEAL_DELAY = 1000; // ms used on manual finish / bust
  const AUTO_TICK = 800; // ms delay between auto steps

  /* =========================
   * 2) Base jackpots & effective jackpots
   * ========================= */
  const jackpotValues = useMemo(
    () => computeBaseJackpotValues(bet, worms, gridSize).values,
    [bet, worms, gridSize]
  );

  const [effectiveJackpots, setEffectiveJackpots] = useState([]);
  const [bankValues, setBankValues] = useState(() => Array(apples).fill(0));
  const [cumulativeBankValues, setCumulativeBankValues] = useState(() =>
    Array(apples).fill(0)
  );

  /* =========================
   * 3) Grid state
   * ========================= */
  const [grid, setGrid] = useState(Array(totalBoxes).fill("❓"));
  const [bombs, setBombs] = useState([]);
  const [openedApples, setOpenedApples] = useState(0);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [bankItUsedSteps, setBankItUsedSteps] = useState([]);

  // Timeout ref to cancel when deps change/unmount
  const timerRef = useRef(null);
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /* =========================
   * 4) Helpers (DRY)
   * ========================= */
  const sumBank = useCallback(
    (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0),
    []
  );

  const generateBombs = useCallback(
    (count) => {
      const positions = new Set();
      while (positions.size < count) {
        positions.add(Math.floor(Math.random() * totalBoxes));
      }
      return Array.from(positions);
    },
    [totalBoxes]
  );

  const revealAllBoxes = useCallback(
    (gridLike, bombsList) => {
      const out = [...gridLike];
      for (let i = 0; i < totalBoxes; i++) {
        if (out[i] !== "❓") continue;
        out[i] = bombsList.includes(i) ? "💣" : "🍎";
      }
      return out;
    },
    [totalBoxes]
  );

  const schedule = useCallback((fn, ms) => {
    clearTimer();
    timerRef.current = setTimeout(fn, ms);
  }, []);

  const resetGame = useCallback(() => {
    setGrid(Array(totalBoxes).fill("❓"));
    setBombs(generateBombs(worms));
    setOpenedApples(0);
    setFirstClickDone(false);
    setBankValues(Array(apples).fill(0));
    setEffectiveJackpots([...jackpotValues]);
    setCumulativeBankValues(Array(apples).fill(0));
    setIsRevealing(false);
    setBankItUsedSteps([]);
    clearTimer();
  }, [apples, generateBombs, jackpotValues, totalBoxes, worms]);

  // Keep state in sync with grid config changes
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, worms]);

  // When base jackpots change, refresh effective jackpots
  useEffect(() => {
    setEffectiveJackpots([...jackpotValues]);
  }, [jackpotValues]);

  /* =========================
   * 5) Banking logic
   * ========================= */
  const availableBankOptions = useMemo(() => {
    if (openedApples === 0 || mode === "auto") return [];

    const step = openedApples - 1;
    if (bankItUsedSteps.includes(step)) return [];

    const currentJackpot = Number(effectiveJackpots[step]) || 0;
    if (currentJackpot <= 0) return [];

    // Start at 1/4 of bet, then double each option until reaching the jackpot
    let start = +(Number(bet) / 4).toFixed(2);
    if (!Number.isFinite(start) || start <= 0) return [];

    const out = [];
    const seen = new Set();
    let v = start;
    for (let i = 0; i < 32; i++) {
      if (v >= currentJackpot) break;
      const r = +v.toFixed(2);
      if (!seen.has(r)) {
        out.push(r);
        seen.add(r);
      }
      v *= 2;
    }
    return out;
  }, [openedApples, mode, effectiveJackpots, bet, bankItUsedSteps]);

  const maxWin = useMemo(() => {
    const banked = sumBank(bankValues);
    const remainingMax = effectiveJackpots.length
      ? Math.max(0, ...effectiveJackpots.map((v) => Number(v) || 0))
      : 0;
    return +(banked + remainingMax).toFixed(2);
  }, [bankValues, effectiveJackpots, sumBank]);

  const bankIt = useCallback(
    (amount) => {
      if (openedApples === 0 || mode === "auto") return false;

      const currentStepIndex = openedApples - 1;
      if (bankItUsedSteps.includes(currentStepIndex)) return false;

      const currentJackpot = effectiveJackpots[currentStepIndex] || 0;
      if (amount >= currentJackpot || amount <= 0) return false;

      const penaltyRate = BANK_PENALTY_RATE;

      setBankValues((prev) => {
        const next = [...prev];
        next[currentStepIndex] = amount;
        return next;
      });

      setEffectiveJackpots((prev) => {
        const next = [...prev];
        for (let i = currentStepIndex; i < next.length; i++) {
          if (i === currentStepIndex) {
            next[i] = Math.max(0, next[i] - amount);
          } else {
            const afterSub = Math.max(0, next[i] - amount);
            next[i] = Math.max(0, +(afterSub * (1 - penaltyRate)).toFixed(2));
          }
        }
        return next;
      });

      setCumulativeBankValues((prev) => {
        const out = [...prev];
        const prevTotal = currentStepIndex > 0 ? prev[currentStepIndex - 1] : 0;
        out[currentStepIndex] = +(prevTotal + amount).toFixed(2);
        for (let i = currentStepIndex + 1; i < out.length; i++)
          out[i] = out[currentStepIndex];
        return out;
      });

      setBankItUsedSteps((prev) => [...prev, currentStepIndex]);
      return true;
    },
    [openedApples, mode, bankItUsedSteps, effectiveJackpots]
  );

  /* =========================
   * 6) Collecting (manual) & computing collect value
   * ========================= */
  const collectAmount = useCallback(() => {
    const banked = sumBank(bankValues);
    const current =
      openedApples > 0 ? effectiveJackpots[openedApples - 1] || 0 : 0;
    return +(banked + current).toFixed(2);
  }, [bankValues, effectiveJackpots, openedApples, sumBank]);

  const collectApples = useCallback(() => {
    if (!firstClickDone || isRevealing) return;

    const total = collectAmount();
    setCollectedAmount(total);

    const revealed = revealAllBoxes(grid, bombs);
    setGrid(revealed);
    setIsRevealing(true);

    schedule(() => {
      stopManualGame();
      resetGame();
      setFirstClickDone(false);
    }, REVEAL_DELAY);

    return total;
  }, [
    REVEAL_DELAY,
    bombs,
    collectAmount,
    firstClickDone,
    grid,
    isRevealing,
    resetGame,
    revealAllBoxes,
    schedule,
    stopManualGame,
  ]);

  /* =========================
   * 7) Auto mode stepper
   * ========================= */
  useEffect(() => {
    if (!autoGameActive || mode !== "auto" || !roundInProgress) return;

    // End-of-sequence (all chosen boxes opened) or all apples opened
    if (currentBoxIndex >= selectedBoxes.length || openedApples >= apples) {
      const payout = collectAmount();
      onLoss(payout);
      setRoundInProgress(false);
      schedule(() => {
        resetGame();
        nextRound(maxRounds);
      }, AUTO_TICK);
      return;
    }

    // Step timer
    schedule(() => {
      const boxIndex = selectedBoxes[currentBoxIndex];

      if (grid[boxIndex] === "❓") {
        const nextGrid = [...grid];

        if (bombs.includes(boxIndex)) {
          // Hit bomb -> finish round (keep banked)
          nextGrid[boxIndex] = "💣";
          setGrid(nextGrid);
          const banked = sumBank(bankValues);
          onLoss(banked);
          setRoundInProgress(false);
          schedule(() => {
            resetGame();
            nextRound(maxRounds);
          }, AUTO_TICK);
        } else {
          // Apple -> continue
          nextGrid[boxIndex] = "🍎";
          setGrid(nextGrid);
          setOpenedApples((p) => p + 1);
          setCurrentBoxIndex((p) => p + 1);
        }
      } else {
        // Already revealed (shouldn't happen in auto), just step forward
        setCurrentBoxIndex((p) => p + 1);
      }
    }, AUTO_TICK);

    return clearTimer; // cleanup on deps change
  }, [
    AUTO_TICK,
    apples,
    autoGameActive,
    bankValues,
    bombs,
    collectAmount,
    currentBoxIndex,
    grid,
    maxRounds,
    mode,
    nextRound,
    onLoss,
    openedApples,
    roundInProgress,
    schedule,
    selectedBoxes,
    setCurrentBoxIndex,
    setRoundInProgress,
    sumBank,
  ]);

  /* =========================
   * 8) Manual click handler
   * ========================= */
  const onBoxClick = useCallback(
    (index) => {
      if (mode !== "manual" || isRevealing || grid[index] !== "❓") return;

      if (!firstClickDone) setFirstClickDone(true);

      const nextGrid = [...grid];

      if (bombs.includes(index)) {
        // Bust
        nextGrid[index] = "💣";
        setGrid(nextGrid);
        setIsRevealing(true);
        const revealed = revealAllBoxes(nextGrid, bombs);
        setGrid(revealed);

        schedule(() => {
          const banked = sumBank(bankValues);
          onLoss(banked);
          stopManualGame();
          resetGame();
          setFirstClickDone(false);
        }, REVEAL_DELAY);
      } else {
        // Apple
        nextGrid[index] = "🍎";
        setGrid(nextGrid);
        setOpenedApples((prev) => {
          const newOpened = prev + 1;
          if (newOpened >= apples) {
            setIsRevealing(true);
            const revealed = revealAllBoxes(nextGrid, bombs);
            setGrid(revealed);
            schedule(() => {
              const payout =
                sumBank(bankValues) + (effectiveJackpots[newOpened - 1] || 0);
              onLoss(+payout.toFixed(2));
              stopManualGame();
              resetGame();
              setFirstClickDone(false);
            }, REVEAL_DELAY);
          }
          return newOpened;
        });
      }
    },
    [
      REVEAL_DELAY,
      apples,
      bankValues,
      bombs,
      effectiveJackpots,
      firstClickDone,
      grid,
      isRevealing,
      mode,
      revealAllBoxes,
      resetGame,
      schedule,
      stopManualGame,
      sumBank,
      onLoss,
    ]
  );

  /* =========================
   * 9) Current jackpot helper
   * ========================= */
  const currentJackpot = useMemo(
    () =>
      openedApples > 0
        ? Math.max(0, +(+effectiveJackpots[openedApples - 1] || 0).toFixed(2))
        : "0.00",
    [effectiveJackpots, openedApples]
  );

  /* =========================
   * 10) Exposed API
   * ========================= */
  return {
    // grid state
    grid,
    bombs,
    apples,
    totalBoxes,
    openedApples,
    isRevealing,
    firstClickDone,

    // jackpots & banking
    jackpotValues,
    effectiveJackpots,
    bankValues,
    setBankValues,
    cumulativeBankValues,
    bankIt,
    availableBankOptions,
    bankItUsedSteps,
    maxWin,
    currentJackpot,

    // actions
    onBoxClick,
    collectApples,
    collectAmount,
    resetGame,

    // info
    collectedAmount,
  };
}
