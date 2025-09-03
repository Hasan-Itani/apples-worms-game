"use client";
import { useGameLogic } from "./hooks/useGameLogic";
import GameStats from "./components/GameStats";
import AutoGameStats from "./components/AutoGameStats";
import BetControls from "./components/BetControls";
import Boxes from "./components/Boxes";
import Image from "next/image";
export default function HomePage() {
  const game = useGameLogic();
  return (
    <div className="min-h-screen bg-[url(/landscape_background.jpg)] bg-no-repeat bg-cover bg-center">
      <div className="grid grid-cols-2 w-full h-full">
        <div className="text-center text-black">
          <Image
            src={"/logo.png"}
            alt="Logo"
            width={500}
            height={230}
            className="mx-auto mt-10"
          />
          <div className="max-w-md mx-auto p-6 space-y-6">
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
            {game.mode === "manual" && (
              <div className="w-full">
                
                {!game.manualRunning ? (
                  <button
                    onClick={game.startGame}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    
                    Start Game
                  </button>
                ) : (
                  <div className="flex justify-between gap-2">
                    
                    <button
                      onClick={() => {
                        game.collectApples();
                        // hide collected apples
                        game.stopManualGame();
                        // stop the current round
                      }}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 py-2 rounded text-white"
                    >
                      
                      Collect {game.score}$
                    </button>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded text-white">
                      
                      Bank It
                    </button>
                  </div>
                )}
              </div>
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
        <div className="">
          <Boxes
            gridSize={game.gridSize}
            worms={game.worms}
            bet={game.bet}
            manualRunning={game.manualRunning} // ✅ sent here
            stopManualGame={game.stopManualGame}
          />
        </div>
      </div>
    </div>
  );
}
