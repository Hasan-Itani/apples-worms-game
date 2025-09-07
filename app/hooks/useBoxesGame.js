"use client";
import { useState, useEffect, useMemo, useRef } from "react";

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
    const rarityFactor = 1 + (worms / totalBoxes) * 4;
    const minGrowth = 1.02;
    const maxGrowth = 1.5;
    return Array.from({ length: apples }, (_, i) => {
      const denom = Math.max(apples - 1, 1);
      const progress = i / denom;
      const dynamicGrowth =
        minGrowth + (maxGrowth - minGrowth) * (progress * progress);
      const value = bet * rarityFactor * Math.pow(dynamicGrowth, i);
      return +value.toFixed(2);
    });
  }, [bet, worms, totalBoxes, apples]);

  const [effectiveJackpots, setEffectiveJackpots] = useState([]);
  const [bankValues, setBankValues] = useState(() => Array(apples).fill(0));
  const [grid, setGrid] = useState(Array(totalBoxes).fill("❓"));
  const [bombs, setBombs] = useState([]);
  const [openedApples, setOpenedApples] = useState(0);
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);

  const [cumulativeBankValues, setCumulativeBankValues] = useState(() =>
    Array(apples).fill(0)
  );

  const collectAmount = useMemo(() => {
    const banked = bankValues.reduce((a, b) => a + (b || 0), 0);
    const lastJackpot =
      openedApples > 0 ? effectiveJackpots[openedApples - 1] || 0 : 0;
    return +(banked + lastJackpot).toFixed(2);
  }, [bankValues, effectiveJackpots, openedApples]);

  const generateBombs = (count) => {
    const positions = new Set();
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * totalBoxes));
    }
    return [...positions];
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
  };

  useEffect(() => {
    resetGame();
  }, [gridSize, worms]);

  // ----- Prevent duplicate auto-run in Strict Mode
  const didRunRef = useRef(false);

  // Auto start new round
  useEffect(() => {
    if (
      mode === "auto" &&
      autoGameActive &&
      !roundInProgress &&
      selectedBoxes.length > 0
    ) {
      if (didRunRef.current) return;
      didRunRef.current = true;

      console.log("Starting new auto round...");
      setRoundInProgress(true);
      setCurrentBoxIndex(0);
      resetGame();
      setFirstClickDone(true);

      setTimeout(() => {
        didRunRef.current = false;
      }, 0);
    }
  }, [mode, autoGameActive, roundInProgress, selectedBoxes.length]);

  // Auto-play sequential box opening
  useEffect(() => {
    if (
      mode === "auto" &&
      roundInProgress &&
      autoGameActive &&
      selectedBoxes.length > 0
    ) {
      const timer = setTimeout(() => {
        if (currentBoxIndex >= selectedBoxes.length) {
          onLoss(collectAmount);
          setTimeout(() => nextRound(maxRounds), 1000);
          return;
        }

        const boxIndex = selectedBoxes[currentBoxIndex];
        console.log(
          `Opening box ${currentBoxIndex + 1}/${
            selectedBoxes.length
          } at index ${boxIndex}`
        );

        if (grid[boxIndex] === "❓") {
          const newGrid = [...grid];

          if (bombs.includes(boxIndex)) {
            newGrid[boxIndex] = "💣";
            setGrid(newGrid);
            const banked = bankValues.reduce((a, b) => a + (Number(b) || 0), 0);
            onLoss(banked);
            setTimeout(() => nextRound(maxRounds), 800);
          } else {
            newGrid[boxIndex] = "🍎";
            setGrid(newGrid);
            setOpenedApples((prev) => prev + 1);
            setCurrentBoxIndex((prev) => prev + 1);
          }
        } else {
          setCurrentBoxIndex((prev) => prev + 1);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [
    mode,
    roundInProgress,
    autoGameActive,
    currentBoxIndex,
    selectedBoxes,
    grid,
    bombs,
    bankValues,
    onLoss,
    nextRound,
    maxRounds,
    collectAmount,
  ]);

  const revealAllBoxes = (newGrid, bombsList) => {
    const finalGrid = newGrid.map((cell, i) => {
      if (cell !== "❓") return cell;
      return bombsList.includes(i) ? "💣" : "🍎";
    });
    setGrid(finalGrid);
  };

  const collectApples = () => {
    const payout =
      (bankValues.reduce((a, b) => a + (b || 0), 0) || 0) +
      (openedApples > 0 ? effectiveJackpots[openedApples - 1] || 0 : 0);

    setCollectedAmount(payout);

    if (mode === "manual") {
      setIsRevealing(true);
      revealAllBoxes([...grid], bombs);
      setTimeout(() => {
        resetGame();
      }, 3000);
    }

    return payout;
  };

  const maxWin = useMemo(() => {
    if (!effectiveJackpots?.length) return 0;
    return Math.max(...effectiveJackpots);
  }, [effectiveJackpots]);

  return {
    grid,
    handleClick: (index) => {
      if (mode === "auto") return;

      if (!manualRunning || isRevealing) return;
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
    },
    resetGame,
    openedApples,
    jackpotValues,
    effectiveJackpots,
    bankValues,
    currentJackpot:
      openedApples > 0
        ? Math.max(0, +effectiveJackpots[openedApples - 1].toFixed(2))
        : "0.00",
    collectApples,
    collectedAmount,
    collectAmount,
    maxWin,
    cumulativeBankValues,
    bankIt: () => {},
    availableBankOptions: [],
  };
}
