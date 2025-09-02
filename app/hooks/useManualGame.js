"use client";
import { useState } from "react";

export function useManualGame(balance, setBalance, bet) {
  const [manualRunning, setManualRunning] = useState(false);

  const startGame = () => {
    if (balance < bet) return;
    setBalance((b) => b - bet);
    setManualRunning(true);
  };

  const stopManualGame = () => {
    setManualRunning(false);
  };

  return { manualRunning, startGame, stopManualGame };
}