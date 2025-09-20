// hooks/useGameLogic.js
"use client";

import { useCallback, useMemo, useState } from "react";
import { useBalance } from "./useBalance";
import { useGrid } from "./useGrid";
import { useManualGame } from "./useManualGame";
import { useAutoGame } from "./useAutoGame";
import { useBoxesGame } from "./useBoxesGame";
// Optional: centralize UI constants
// import { ROUND_STEPS } from "../utils/constants";

/**
 * Orchestrates all game hooks and exposes a unified API to the UI.
 *
 * Goals of this refactor:
 * - Remove duplicate reset logic via small helpers
 * - Stabilize callback identities with useCallback (reduces child re-renders)
 * - Add clear docs for responsibilities & cross-hook data flow
 * - Keep behavior identical to the original unless noted
 */
export function useGameLogic() {
  /* =========================
   * 1) Sub-hooks (state domains)
   * ========================= */
  const balanceHook = useBalance();
  const gridHook = useGrid();

  const manualHook = useManualGame(
    balanceHook.balance,
    balanceHook.setBalance,
    balanceHook.bet
  );

  // Popup state
  const [gameOver, setGameOver] = useState(false);
  const [finalValue, setFinalValue] = useState(0);

  // Auto mode engine
  const autoHook = useAutoGame(
    balanceHook.balance,
    balanceHook.bet,
    balanceHook.setBet,
    balanceHook.setBalance
  );

  // Mode switching
  const [mode, _setMode] = useState("manual");

  // Rounds & presets (kept local; could be hoisted to constants.js if reused)
  const [rounds, setRounds] = useState(10);
  const roundSteps = useMemo(() => [5, 10, 15, 20, 30, 40, 50, 100], []);

  // Box selection for auto mode
  const [selectedBoxes, setSelectedBoxes] = useState([]);

  // Bank value for UI (actual apply may happen elsewhere)
  const [bankValue, setBankValue] = useState(0);

  /* =========================
   * 2) Small helpers to avoid duplication
   * ========================= */
  const clearGameOver = useCallback(() => {
    setGameOver(false);
    setFinalValue(0);
  }, []);

  const hardResetRunState = useCallback(() => {
    // Reset boxes engine + UI overlays
    boxesHook.resetGame();
    clearGameOver();
    setSelectedBoxes([]);
    // Also reset auto progress counters
    autoHook.setCurrentBoxIndex(0);
    autoHook.setRoundInProgress(false);
  }, [autoHook, clearGameOver]);

  const setMode = useCallback(
    (newMode) => {
      _setMode(newMode);
      hardResetRunState();
      // Stop any running engines
      manualHook.stopManualGame?.();
      autoHook.stopAutoPlay?.();
    },
    [autoHook, hardResetRunState, manualHook]
  );

  /* =========================
   * 3) Boxes engine & cross-domain handlers
   * ========================= */
  const onBoxesFinished = useCallback(
    (amount) => {
      // Always credit positive winnings
      if (amount > 0) {
        balanceHook.setBalance((b) => b + amount);
      }

      // Auto vs Manual side-effects
      if (mode === "auto") {
        autoHook.handleGameResult(amount > 0, amount);
        // Do not show popup in auto mode (as per original)
      } else {
        // Manual: show popup regardless; amount may be 0
        setFinalValue(amount);
        setGameOver(true);
      }
    },
    [autoHook, balanceHook, mode]
  );

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

  /* =========================
   * 4) Public actions (stabilized via useCallback)
   * ========================= */
  const startGame = useCallback(
    (...args) => {
      clearGameOver();
      manualHook.startGame?.(...args);
    },
    [clearGameOver, manualHook]
  );

  const startAutoPlay = useCallback(() => {
    if (selectedBoxes.length === 0) {
      // Preserve original UX
      alert("Please select boxes first!");
      return;
    }
    autoHook.startAutoPlay(rounds);
  }, [autoHook, rounds, selectedBoxes.length]);

  const stopAutoPlay = useCallback(() => {
    autoHook.stopAutoPlay();
    boxesHook.resetGame();
    setSelectedBoxes([]);
  }, [autoHook, boxesHook]);

  const collectApples = useCallback(() => {
    const winnings = boxesHook.collectApples();
    if (winnings > 0) {
      balanceHook.setBalance((b) => b + winnings);
      setFinalValue(winnings);
      setGameOver(true);
    }
    manualHook.stopManualGame();
  }, [balanceHook, boxesHook, manualHook]);

  /* =========================
   * 5) Exposed API
   * ========================= */
  return {
    // Balance / betting
    ...balanceHook,
    // Grid config & probabilities
    ...gridHook,

    // Mode
    mode,
    setMode,

    // Rounds & presets
    rounds,
    setRounds,
    roundSteps,

    // Engines
    ...manualHook,
    ...autoHook,
    ...boxesHook,

    // Actions
    startGame,
    startAutoPlay,
    stopAutoPlay,
    collectApples,

    // Popup & banking UI state
    bankValue,
    setBankValue,
    gameOver,
    finalValue,
    clearGameOver,

    // Auto-mode selection
    selectedBoxes,
    setSelectedBoxes,
  };
}
