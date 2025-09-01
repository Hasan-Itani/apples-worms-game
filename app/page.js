"use client";
import { useGameLogic } from "./hooks/useGameLogic";
import GameStats from "./components/GameStats";
import BetControls from "./components/BetControls";
import Boxes from "./components/boxes";

export default function HomePage() {
  const game = useGameLogic();

  return (
    <div className="w-screen h-screen">
      <div className="grid grid-cols-2 w-screen h-screen">
                <div className="bg-green-400 text-center text-black">
                  <h1 className="text-center">Hassan's component</h1>
                  <div className="max-w-md mx-auto p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-center">🍏 Apples & Worms 🪱</h1>

                    <GameStats
                      applesRemaining={game.applesRemaining}
                      chanceOfWorm={game.chanceOfWorm}
                      openedTiles={game.openedTiles}
                      chanceOfApple={game.chanceOfApple}
                      totalBoxes={game.gridSize * game.gridSize} // ✅ add this
                    />

                    <button
                      onClick={game.startGame}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded"
                    >
                    🎮 Start Game
                    </button>

                    <BetControls
                      bet={game.bet}
                      setBet={game.setBet}
                      balance={game.balance}
                      worms={game.worms}
                      setWorms={game.setWorms}
                      gridSize={game.gridSize}
                      setGridSizeClamped={game.setGridSizeClamped}
                      minWorms={game.minWorms}
                      maxWorms={game.maxWorms}
                    />
                  </div>
                </div>
                <div className="bg-red-400">
                  <Boxes />
                </div>
      </div>
    </div>
  );
}
