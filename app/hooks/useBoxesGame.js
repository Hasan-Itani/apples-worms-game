"use client";
import { useState, useEffect, useMemo } from "react";
import { computeBaseJackpotValues } from "../utils/jackpots";
import { BANK_PENALTY_RATE } from "../utils/constants";

export function useBoxesGame(
  gridSize = 4,
  worms = 2,
  manualRunning = false,
  stopManualGame = () => {},
  bet = 1,
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
  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);

  // ---- base jackpot values
  const jackpotValues = useMemo(() => {
    return computeBaseJackpotValues(bet, worms, gridSize).values;
  }, [bet, worms, gridSize]);

  const [effectiveJackpots, setEffectiveJackpots] = useState([]);
  const [bankValues, setBankValues] = useState(() => Array(apples).fill(0));
  const [grid, setGrid] = useState(Array(totalBoxes).fill("❓"));
  const [bombs, setBombs] = useState([]);
  const [openedApples, setOpenedApples] = useState(0);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [bankItUsedSteps, setBankItUsedSteps] = useState([]);

  const [cumulativeBankValues, setCumulativeBankValues] = useState(() =>
    Array(apples).fill(0)
  );

  const generateBombs = (count) => {
    const positions = new Set();
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * totalBoxes));
    }
    return Array.from(positions);
  };

  const revealAllBoxes = (newGrid, bombsSet) => {
    for (let i = 0; i < totalBoxes; i++) {
      if (newGrid[i] !== "❓") continue;
      newGrid[i] = bombsSet.includes(i) ? "💣" : "🍎";
    }
    setGrid([...newGrid]);
  };

  const resetGame = () => {
    setGrid(Array(totalBoxes).fill("❓"));
    setBombs(generateBombs(worms));
    setOpenedApples(0);
    setFirstClickDone(false);
    setBankValues(Array(apples).fill(0));
    setEffectiveJackpots([...jackpotValues]);
    setCumulativeBankValues(Array(apples).fill(0));
    setIsRevealing(false);
    setBankItUsedSteps([]);
  };

  useEffect(() => {
    resetGame();
  }, [gridSize, worms]); // eslint-disable-line react-hooks/exhaustive-deps

  // ====== Bank It (manual only) ======
  const availableBankOptions = useMemo(() => {
    if (openedApples === 0 || mode === "auto") return [];

    const step = openedApples - 1;
    if (bankItUsedSteps.includes(step)) return [];

    const currentJackpot = Number(effectiveJackpots[step]) || 0;
    if (currentJackpot <= 0) return [];

    // Start at 1/4 of bet, then keep doubling (…/2, 1×, 2×, 4×, …)
    let start = +(Number(bet) / 4).toFixed(2);
    if (!Number.isFinite(start) || start <= 0) return [];

    const out = [];
    const seen = new Set();
    let v = start;

    // generate until v >= currentJackpot
    // safety cap to avoid any odd infinite loops
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
    const banked = bankValues.reduce((a, b) => a + (Number(b) || 0), 0);
    const remainingMax =
      effectiveJackpots.length > 0
        ? Math.max(0, ...effectiveJackpots.map((v) => Number(v) || 0))
        : 0;
    return +(banked + remainingMax).toFixed(2);
  }, [bankValues, effectiveJackpots]);

  const bankIt = (amount) => {
    if (openedApples === 0 || mode === "auto") return false;

    const currentStepIndex = openedApples - 1;
    if (bankItUsedSteps.includes(currentStepIndex)) return false;

    const currentJackpot = effectiveJackpots[currentStepIndex] || 0;
    if (amount >= currentJackpot || amount <= 0) return false;

    const penaltyRate = BANK_PENALTY_RATE;

    setBankValues((prev) => {
      const newBankValues = [...prev];
      newBankValues[currentStepIndex] = amount;
      return newBankValues;
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
      for (let i = currentStepIndex + 1; i < out.length; i++) {
        out[i] = out[currentStepIndex];
      }
      return out;
    });

    setBankItUsedSteps((prev) => [...prev, currentStepIndex]);
    return true;
  };

  // Manual collect
  const collectApples = () => {
    if (!firstClickDone || isRevealing) return;
    const banked = bankValues.reduce((a, b) => a + (Number(b) || 0), 0);
    const current =
      openedApples > 0 ? effectiveJackpots[openedApples - 1] || 0 : 0;
    const total = +(banked + current).toFixed(2);
    setCollectedAmount(total);

    const newGrid = [...grid];
    revealAllBoxes(newGrid, bombs);
    setIsRevealing(true);

    setTimeout(() => {
      stopManualGame();
      resetGame();
      setFirstClickDone(false);
    }, 1000);

    return total;
  };

  // Auto compute collect value
  const collectAmount = () => {
    const banked = bankValues.reduce((a, b) => a + (Number(b) || 0), 0);
    const current =
      openedApples > 0 ? effectiveJackpots[openedApples - 1] || 0 : 0;
    return +(banked + current).toFixed(2);
  };

  // ====== AUTO: stepping, end-of-sequence, and round advance ======
  useEffect(() => {
    if (!autoGameActive || mode !== "auto") return;
    if (!roundInProgress) return;

    // End-of-sequence (all chosen boxes opened) or all apples opened
    if (currentBoxIndex >= selectedBoxes.length || openedApples >= apples) {
      const payout = collectAmount();
      onLoss(payout); // report result (win if >0)
      setRoundInProgress(false);
      setTimeout(() => {
        resetGame(); // prepare clean grid/bombs
        nextRound(maxRounds); // arm next round
      }, 800);
      return;
    }

    const timer = setTimeout(() => {
      const boxIndex = selectedBoxes[currentBoxIndex];

      if (grid[boxIndex] === "❓") {
        const newGrid = [...grid];

        if (bombs.includes(boxIndex)) {
          // Hit bomb -> finish round (keep banked)
          newGrid[boxIndex] = "💣";
          setGrid(newGrid);
          const banked = bankValues.reduce((a, b) => a + (Number(b) || 0), 0);
          onLoss(banked);
          setRoundInProgress(false);
          setTimeout(() => {
            resetGame();
            nextRound(maxRounds);
          }, 800);
        } else {
          // Apple -> continue
          newGrid[boxIndex] = "🍎";
          setGrid(newGrid);
          setOpenedApples((prev) => prev + 1);
          setCurrentBoxIndex((prev) => prev + 1);
        }
      } else {
        // Already revealed (shouldn't happen in auto), just step forward
        setCurrentBoxIndex((prev) => prev + 1);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    autoGameActive,
    mode,
    roundInProgress,
    currentBoxIndex,
    selectedBoxes,
    grid,
    bombs,
    bankValues,
    onLoss,
    nextRound,
    maxRounds,
    setCurrentBoxIndex,
    openedApples,
    apples,
    setRoundInProgress,
  ]);

  // Manual click
  const onBoxClick = (index) => {
    if (mode !== "manual") return;
    if (isRevealing) return;
    if (grid[index] !== "❓") return;

    if (!firstClickDone) setFirstClickDone(true);

    const newGrid = [...grid];
    if (bombs.includes(index)) {
      newGrid[index] = "💣";
      setGrid(newGrid);
      setIsRevealing(true);
      revealAllBoxes(newGrid, bombs);

      setTimeout(() => {
        const banked = bankValues.reduce((a, b) => a + (Number(b) || 0), 0);
        onLoss(banked);
        stopManualGame();
        resetGame();
        setFirstClickDone(false);
      }, 1000);
    } else {
      newGrid[index] = "🍎";
      setGrid(newGrid);
      setOpenedApples((prev) => {
        const newOpened = prev + 1;
        if (newOpened >= apples) {
          setIsRevealing(true);
          revealAllBoxes(newGrid, bombs);
          setTimeout(() => {
            const payout =
              bankValues.reduce((a, b) => a + (b || 0), 0) +
              (effectiveJackpots[newOpened - 1] || 0);
            onLoss(payout);
            stopManualGame();
            resetGame();
            setFirstClickDone(false);
          }, 1000);
        }
        return newOpened;
      });
    }
  };

  // Update jackpots when base changes
  useEffect(() => {
    setEffectiveJackpots([...jackpotValues]);
  }, [jackpotValues]);

  const currentJackpot =
    openedApples > 0
      ? Math.max(0, +effectiveJackpots[openedApples - 1].toFixed(2))
      : "0.00";

  return {
    grid,
    bombs,
    apples,
    totalBoxes,
    onBoxClick,
    resetGame,
    openedApples,
    isRevealing,
    firstClickDone,
    jackpotValues,
    effectiveJackpots,
    bankValues,
    setBankValues,
    currentJackpot,
    collectApples,
    collectedAmount,
    collectAmount,
    maxWin,
    cumulativeBankValues,
    bankIt,
    availableBankOptions,
    bankItUsedSteps,
  };
}
