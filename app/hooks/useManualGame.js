"use client";
import { useState } from "react";

/**
 * Hook to manage the lifecycle of a manual game round.
 *
 * Responsibilities:
 * - Track whether a manual game is running.
 * - Deduct the bet from the balance when starting (only if balance ≥ bet).
 * - Provide start/stop handlers for game components.
 *
 * @param {number} balance - Current player balance.
 * @param {Function} setBalance - Setter function to update balance state.
 * @param {number} bet - Current bet amount.
 *
 * @returns {{
 *   manualRunning: boolean,
 *   startGame: Function,
 *   stopManualGame: Function
 * }}
 *
 * Example:
 * const { manualRunning, startGame, stopManualGame } = useManualGame(balance, setBalance, bet);
 */
export function useManualGame(balance, setBalance, bet) {
  const [manualRunning, setManualRunning] = useState(false);

  /**
   * Start a manual game round.
   * - Deducts the bet from balance.
   * - Activates manualRunning flag.
   */
  const startGame = () => {
    if (balance < bet) return; // insufficient balance, ignore
    setBalance((b) => b - bet);
    setManualRunning(true);
  };

  /**
   * Stop the current manual game round.
   */
  const stopManualGame = () => {
    setManualRunning(false);
  };

  return { manualRunning, startGame, stopManualGame };
}
