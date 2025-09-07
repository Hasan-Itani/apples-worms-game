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
  const [bankItUsedSteps, setBankItUsedSteps] = useState([]); // Track which steps used bank it

  const [cumulativeBankValues, setCumulativeBankValues] = useState(() =>
    Array(apples).fill(0)
  );

  // Calculate available bank options
  const availableBankOptions = useMemo(() => {
    if (openedApples === 0 || mode === "auto") {
      return [];
    }

    // Check if current step already used bank it
    const currentStepUsedBankIt = bankItUsedSteps.includes(openedApples - 1);
    if (currentStepUsedBankIt) {
      return [];
    }

    const currentJackpot = effectiveJackpots[openedApples - 1] || 0;
    const options = [];

    // First value is 1/4 of the bet
    let currentValue = bet * 0.25;

    // Generate options while they're less than current jackpot
    while (currentValue < currentJackpot && options.length < 10) {
      // limit to prevent infinite options
      options.push(+currentValue.toFixed(2));
      currentValue = currentValue * 2; // Double for next option
    }

    return options;
  }, [bet, openedApples, effectiveJackpots, bankItUsedSteps, mode]);

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
    setBankItUsedSteps([]); // Reset bank it usage for all steps
  };

  useEffect(() => {
    resetGame();
  }, [gridSize, worms]);

  // Bank It function with penalty
  const bankIt = (amount) => {
    if (openedApples === 0 || mode === "auto") {
      return false;
    }

    const currentStepIndex = openedApples - 1;

    // Check if current step already used bank it
    if (bankItUsedSteps.includes(currentStepIndex)) {
      return false;
    }

    const currentJackpot = effectiveJackpots[currentStepIndex] || 0;

    if (amount >= currentJackpot || amount <= 0) {
      return false; // Can't bank more than current jackpot
    }

    // Bank it penalty (13% penalty on remaining values)
    const penaltyRate = 0.13;

    // Update bank values - add the banked amount to current step
    setBankValues((prev) => {
      const newBankValues = [...prev];
      newBankValues[currentStepIndex] = amount;
      return newBankValues;
    });

    // Update effective jackpots - subtract banked amount from ALL remaining jackpot values + apply penalty
    setEffectiveJackpots((prev) => {
      const newEffective = [...prev];

      // For each remaining jackpot value (current and future)
      for (let i = currentStepIndex; i < newEffective.length; i++) {
        if (i === currentStepIndex) {
          // Current step: subtract the full banked amount
          newEffective[i] = Math.max(0, newEffective[i] - amount);
        } else {
          // Future steps: subtract banked amount + apply penalty
          const afterSubtraction = Math.max(0, newEffective[i] - amount);
          newEffective[i] = Math.max(
            0,
            +(afterSubtraction * (1 - penaltyRate)).toFixed(2)
          );
        }
      }

      return newEffective;
    });

    // Update cumulative bank values
    setCumulativeBankValues((prev) => {
      const newCumulative = [...prev];
      const previousTotal =
        currentStepIndex > 0 ? prev[currentStepIndex - 1] : 0;
      newCumulative[currentStepIndex] = +(previousTotal + amount).toFixed(2);

      // Update all future cumulative values
      for (let i = currentStepIndex + 1; i < newCumulative.length; i++) {
        newCumulative[i] = newCumulative[currentStepIndex];
      }

      return newCumulative;
    });

    // Mark this step as having used bank it
    setBankItUsedSteps((prev) => [...prev, currentStepIndex]);

    return true;
  };

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
    bankIt, // Now functional with penalty
    availableBankOptions, // Now provides the calculated options
    bankItUsedSteps, // Track which steps used bank it
  };
}
