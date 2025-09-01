"use client";
import { useGameLogic } from "./hooks/useGameLogic";
import GameStats from "./components/GameStats";
import AutoGameStats from "./components/AutoGameStats";
import BetControls from "./components/BetControls";
import Boxes from "./components/Boxes";

export default function HomePage() {
  const game = useGameLogic();

  return (
    <div className="w-screen h-screen">
      <div className="grid grid-cols-2 w-screen h-screen">
        <div className="bg-green-400 text-center text-black">
          <div className="max-w-md mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center">
              🍏 Apples & Worms 🪱
            </h1>

            {/* Stats */}
            {game.mode === "manual" && (
              <GameStats
                applesRemaining={game.applesRemaining}
                chanceOfWorm={game.chanceOfWorm}
                chanceOfApple={game.chanceOfApple}
                openedTiles={game.openedTiles}
                totalBoxes={game.totalBoxes}
              />
            )}
            {game.mode === "auto" && (
              <AutoGameStats
                afterWin={game.afterWin}
                setAfterWin={game.setAfterWin}
                afterLoss={game.afterLoss}
                setAfterLoss={game.setAfterLoss}
                stopOnWin={game.stopOnWin}
                setStopOnWin={game.setStopOnWin}
                stopOnLoss={game.stopOnLoss}
                setStopOnLoss={game.setStopOnLoss}
              />
            )}

            {/* Start / Stop Buttons */}
            {!game.gameActive && (
              <button
                onClick={
                  game.mode === "manual" ? game.startGame : game.startAutoPlay
                }
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {game.mode === "manual" ? "Start Game" : "Start Auto Play"}
              </button>
            )}
            {game.mode === "auto" && game.gameActive && (
              <button
                onClick={game.stopAutoPlay}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Stop Auto
              </button>
            )}

            {/* Manual Running Panel */}
            {game.mode === "manual" && game.manualRunning && (
              <div className="p-2 bg-gray-100 rounded space-y-2">
                <button
                  onClick={game.stopManualGame}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Stop Game
                </button>
              </div>
            )}

            {/* Bet & Controls */}
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
              startGame={game.startGame}
              mode={game.mode}
              setMode={game.setMode}
              rounds={game.rounds}
              setRounds={game.setRounds}
              roundSteps={game.roundSteps}
              currentRound={game.currentRound}
              afterWin={game.afterWin}
              setAfterWin={game.setAfterWin}
              afterLoss={game.afterLoss}
              setAfterLoss={game.setAfterLoss}
              stopOnWin={game.stopOnWin}
              setStopOnWin={game.setStopOnWin}
              stopOnLoss={game.stopOnLoss}
              setStopOnLoss={game.setStopOnLoss}
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
