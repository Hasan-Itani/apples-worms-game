// hooks/useStats.js
import { useMemo, useState } from "react";

export function useStats(totalBoxes, worms) {
  const [openedTiles, setOpenedTiles] = useState(0);

  const applesRemaining = useMemo(
    () => totalBoxes - worms,
    [totalBoxes, worms]
  );
  const chanceOfApple = useMemo(() => {
    const remaining = applesRemaining + worms;
    return remaining > 0 ? Math.round((applesRemaining / remaining) * 100) : 0;
  }, [applesRemaining, worms]);
  const chanceOfWorm = 100 - chanceOfApple;

  return {
    openedTiles,
    setOpenedTiles,
    applesRemaining,
    chanceOfApple,
    chanceOfWorm,
  };
}
