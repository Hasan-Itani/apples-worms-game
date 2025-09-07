"use client";
import { useState, useEffect, useMemo } from "react";

export function useBoxesGame(
  gridSize = 4,
  worms = 2,
  manualRunning = false,
  stopManualGame = () => {},
  bet = 1,
  onLoss = () => {}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, worms]);

  // ---- dynamic bank options
  const availableBankOptions = useMemo(() => {
    if (openedApples === 0) return [];
    const idx = openedApples - 1;
    const jackpot = effectiveJackpots[idx] || 0;

    let options = [];
    let value = bet / 4;
    while (value <= jackpot) {
      options.push(+value.toFixed(2));
      value *= 2;
    }
    return options;
  }, [openedApples, effectiveJackpots, bet]);

  // ---- cumulative bank values
  const [cumulativeBankValues, setCumulativeBankValues] = useState(() =>
    Array(apples).fill(0)
  );

  const bankIt = (amountSelected) => {
    if (openedApples === 0) return;
    const idx = openedApples - 1;

    if (bankValues[idx] > 0) return;

    const prevCum = cumulativeBankValues[idx - 1] || 0;
    const stepAmountRaw =
      amountSelected > prevCum ? amountSelected - prevCum : amountSelected;

    const stepAmount = +Math.max(0, stepAmountRaw).toFixed(2);
    if (stepAmount <= 0) return;

    const available = effectiveJackpots[idx] || 0;
    if (stepAmount > available) return;

    const penaltyRate = 0.1;
    const penalty = +(stepAmount * penaltyRate).toFixed(2);

    setBankValues((prev) => {
      const copy = [...prev];
      copy[idx] = stepAmount;
      return copy;
    });

    setEffectiveJackpots((prev) =>
      prev.map((val) => Math.max(0, +(val - stepAmount - penalty).toFixed(2)))
    );

    setCumulativeBankValues((prev) => {
      const copy = [...prev];
      const newTotal = +(prevCum + stepAmount).toFixed(2);
      for (let i = idx; i < copy.length; i++) {
        copy[i] = newTotal;
      }
      return copy;
    });
  };

  const currentJackpot =
    openedApples > 0
      ? Math.max(0, +effectiveJackpots[openedApples - 1].toFixed(2))
      : "0.00";

  const collectAmount = useMemo(() => {
    const banked = bankValues.reduce((a, b) => a + (b || 0), 0);
    const lastJackpot =
      openedApples > 0 ? effectiveJackpots[openedApples - 1] || 0 : 0;
    return +(banked + lastJackpot).toFixed(2);
  }, [bankValues, effectiveJackpots, openedApples]);

  const [collectedAmount, setCollectedAmount] = useState(0);

  // --- Reveal all boxes helper
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
    setIsRevealing(true);
    revealAllBoxes([...grid], bombs);

    setTimeout(() => {
      resetGame();
    }, 3000);

    return payout;
  };

  const maxWin = useMemo(() => {
    if (!effectiveJackpots?.length) return 0;
    return Math.max(...effectiveJackpots);
  }, [effectiveJackpots]);

  return {
    grid,
    handleClick: (index) => {
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
          try {
            onLoss(banked);
          } catch (err) {
            console.error("onLoss callback threw:", err);
          }
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

              try {
                onLoss(payout);
              } catch (err) {
                console.error("onWin callback threw:", err);
              }

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
    currentJackpot,
    collectApples,
    collectedAmount,
    collectAmount,
    bankIt,
    availableBankOptions,
    firstClickDone,
    cumulativeBankValues,
    maxWin,
  };
}
