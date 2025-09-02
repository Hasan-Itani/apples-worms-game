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

            {/* Manual Mode Start/Stop */}
            {game.mode === "manual" && (
              <button
                onClick={
                  game.manualRunning ? game.stopManualGame : game.startGame
                }
                className={`w-full py-2 ${
                  game.manualRunning
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded`}
              >
                {game.manualRunning ? "Stop Game" : "Start Game"}
              </button>
            )}

            {/* Auto Mode Start/Stop */}
            {game.mode === "auto" && !game.gameActive && (
              <button
                onClick={game.startAutoPlay}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Start Auto Play
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
          <Boxes gridSize={game.gridSize} worms={game.worms} />
        </div>
      </div>
    </div>
  );
}
