// hooks/useGameLogic.js
"use client";

import { useState } from "react";
import { useBalance } from "./useBalance";
import { useGrid } from "./useGrid";
import { useManualGame } from "./useManualGame";
import { useAutoGame } from "./useAutoGame";
import { useBoxesGame } from "./useBoxesGame";

export function useGameLogic() {
  const balanceHook = useBalance();
  const gridHook = useGrid();
  const manualHook = useManualGame(
    balanceHook.balance,
    balanceHook.setBalance,
    balanceHook.bet
  );

  // popup state
  const [gameOver, setGameOver] = useState(false);
  const [finalValue, setFinalValue] = useState(0);

  const onBoxesFinished = (amount) => {
    // always show popup, even if amount is 0
    setFinalValue(amount);
    setGameOver(true);

    // credit the balance only if amount > 0
    if (amount > 0) {
      balanceHook.setBalance((b) => b + amount);
    }
  };

  const boxesHook = useBoxesGame(
    gridHook.gridSize,
    gridHook.worms,
    manualHook.manualRunning,
    manualHook.stopManualGame,
    balanceHook.bet,
    onBoxesFinished
  );

  const autoHook = useAutoGame(balanceHook.balance, balanceHook.bet);

  const [mode, setMode] = useState("manual");
  const [rounds, setRounds] = useState(10);
  const roundSteps = [5, 10, 15, 20, 30, 40, 50, 100];

  const [bankValue, setBankValue] = useState(0);

  const startGame = (...args) => {
    setGameOver(false);
    setFinalValue(0);
    if (typeof manualHook.startGame === "function")
      manualHook.startGame(...args);
  };

  const collectApples = () => {
    const winnings = boxesHook.collectApples();
    if (winnings > 0) {
      balanceHook.setBalance((b) => b + winnings);
      // also show a popup for manual collect
      setFinalValue(winnings);
      setGameOver(true);
    }
    manualHook.stopManualGame();
  };

  const clearGameOver = () => {
    setGameOver(false);
    setFinalValue(0);
  };

  return {
    ...balanceHook,
    ...gridHook,
    mode,
    setMode,
    rounds,
    setRounds,
    roundSteps,
    ...manualHook,
    ...autoHook,
    ...boxesHook,
    collectApples,
    bankValue,
    setBankValue,
    gameOver,
    finalValue,
    clearGameOver,
    startGame,
  };
}
