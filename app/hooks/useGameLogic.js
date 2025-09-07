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

const autoHook = useAutoGame(balanceHook.balance, balanceHook.bet, balanceHook.setBalance);

  const [mode, _setMode] = useState("manual");
  const setMode = (newMode) => {
  _setMode(newMode);
  boxesHook.resetGame();
  setSelectedBoxes([]);
  setGameOver(false);
  setFinalValue(0);
};
  const [rounds, setRounds] = useState(10);
  const roundSteps = [5, 10, 15, 20, 30, 40, 50, 100];

  // Box selection for auto mode
  const [selectedBoxes, setSelectedBoxes] = useState([]);

  const onBoxesFinished = (amount) => {
    // always show popup for manual games, not for auto games
    if (mode === "manual") {
      setFinalValue(amount);
      setGameOver(true);
    }

    // credit the balance only if amount > 0
    if (amount > 0) {
      balanceHook.setBalance((b) => b + amount);
      if (mode === "auto") {
        autoHook.handleGameResult(true, amount);
      }
    } else {
      if (mode === "auto") {
        autoHook.handleGameResult(false, amount);
      }
    }
  };

  const boxesHook = useBoxesGame(
    gridHook.gridSize,
    gridHook.worms,
    manualHook.manualRunning,
    manualHook.stopManualGame,
    balanceHook.bet,
    onBoxesFinished,
    mode,
    autoHook.gameActive,
    selectedBoxes,
    autoHook.currentBoxIndex,
    autoHook.setCurrentBoxIndex,
    autoHook.roundInProgress,
    autoHook.setRoundInProgress,
    (maxRounds) => autoHook.nextRound(maxRounds),
    rounds
  );

  const [bankValue, setBankValue] = useState(0);

  const startGame = (...args) => {
    setGameOver(false);
    setFinalValue(0);
    if (typeof manualHook.startGame === "function")
      manualHook.startGame(...args);
  };

  const startAutoPlay = () => {
    if (selectedBoxes.length === 0) {
      alert("Please select boxes first!");
      return;
    }
    console.log("Starting auto play with selected boxes:", selectedBoxes);
    autoHook.startAutoPlay(rounds);
  };

  const stopAutoPlay = () => {
    autoHook.stopAutoPlay();
    boxesHook.resetGame();
    setSelectedBoxes([]);
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
    startAutoPlay,
    stopAutoPlay,
    selectedBoxes,
    setSelectedBoxes,
  };
}
