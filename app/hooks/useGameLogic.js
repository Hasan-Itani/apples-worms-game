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
  const boxesHook = useBoxesGame();
  const autoHook = useAutoGame(balanceHook.balance, balanceHook.bet);

  const [mode, setMode] = useState("manual");
  const [rounds, setRounds] = useState(10);
  const roundSteps = [5, 10, 15, 20, 30, 40, 50, 100];
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
  };
}
