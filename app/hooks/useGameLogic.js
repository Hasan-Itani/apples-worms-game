
"use client";
import { useBalance } from "./useBalance";
import { useGrid } from "./useGrid";
import { useManualGame } from "./useManualGame";
import { useAutoGame } from "./useAutoGame";
import { useState } from "react";

export function useGameLogic() {
  // --- Core hooks ---
  const balanceHook = useBalance();
  const gridHook = useGrid();
  const manualHook = useManualGame(
    balanceHook.balance,
    balanceHook.setBalance,
    balanceHook.bet
  );
  const autoHook = useAutoGame(balanceHook.balance, balanceHook.bet);

  const [mode, setMode] = useState("manual");
  const [rounds, setRounds] = useState(10);
  const roundSteps = [5, 10, 15, 20, 30, 40, 50, 100];
 
  return {
    // --- Core ---
    ...balanceHook,
    ...gridHook,

    // --- Mode ---
    mode,
    setMode,
    rounds,
    setRounds,
    roundSteps,

    // --- Manual ---
    ...manualHook,

    // --- Auto ---
    ...autoHook,
  };
}
