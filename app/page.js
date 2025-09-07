"use client";
import { useEffect, useRef, useState } from "react";
import { useGameLogic } from "./hooks/useGameLogic";
import GameStats from "./components/GameStats";
import AutoGameStats from "./components/AutoGameStats";
import BetControls from "./components/BetControls";
import Boxes from "./components/Boxes";
import Image from "next/image";

export default function HomePage() {
  const game = useGameLogic();
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  // Start audio after first click anywhere
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current && !audioStarted) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch((err) => {
          console.log("Play blocked:", err);
        });
        setAudioStarted(true);
      }
    };

    window.addEventListener("click", handleUserInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleUserInteraction);
    };
  }, [audioStarted]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div className="min-h-screen bg-[url(/landscape_background.jpg)] bg-no-repeat bg-cover bg-center">
      {/* Audio */}
      <audio ref={audioRef} src="/ambient.mp3" loop hidden />

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded hover:bg-opacity-70 z-50"
      >
        {muted ? "Unmute" : "Mute"}
      </button>
      {/* mobile: flex-col, desktop: grid-cols-2 */}
      <div className="flex flex-col md:grid md:grid-cols-2 w-full h-full gap-6 p-4">
        {/* RIGHT PANEL (Boxes) */}
        <div className="flex flex-col justify-center items-center order-1 md:order-2 w-full">
          <Boxes
            grid={game.grid}
            handleClick={game.handleClick}
            openBoxAuto={game.openBoxAuto} // new
            gridSize={game.gridSize}
            worms={game.worms}
            bet={game.bet}
            manualRunning={game.manualRunning}
            stopManualGame={game.stopManualGame}
            openedApples={game.openedApples}
            jackpotValues={game.jackpotValues}
            effectiveJackpots={game.effectiveJackpots}
            bankValues={game.bankValues}
            gameOver={game.gameOver}
            finalValue={game.finalValue}
            onPopupClose={game.clearGameOver}
            mode={game.mode}
            selectedBoxes={game.selectedBoxes}
            setSelectedBoxes={game.setSelectedBoxes}
            gameActive={game.gameActive}
          />

          {/* Mobile Start Game button */}
          {game.mode === "manual" && !game.manualRunning && (
            <button
              onClick={game.startGame}
              className="md:hidden w-full max-w-xs mt-4 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-lg font-bold"
            >
              Start Game
            </button>
          )}
        </div>

        {/* LEFT PANEL (Stats/Controls) */}
        <div className="text-center text-black flex flex-col items-center order-2 md:order-1">
          <Image
            src={"/logo.png"}
            alt="Logo"
            width={400}
            height={180}
            className="mx-auto mt-6 mb-4 w-[70%] max-w-[400px] h-auto"
          />

          <div className="w-full max-w-md mx-auto p-4 space-y-6 ">
            {/* Manual stats */}
            {game.mode === "manual" && (
              <GameStats
                applesRemaining={
                  game.totalBoxes - game.worms - game.openedApples
                }
                chanceOfApple={
                  game.openedApples < game.totalBoxes
                    ? Math.round(
                        ((game.totalBoxes - game.worms - game.openedApples) /
                          (game.totalBoxes - game.openedApples)) *
                          100
                      )
                    : 0
                }
                chanceOfWorm={
                  game.openedApples < game.totalBoxes
                    ? 100 -
                      Math.round(
                        ((game.totalBoxes - game.worms - game.openedApples) /
                          (game.totalBoxes - game.openedApples)) *
                          100
                      )
                    : 0
                }
                openedTiles={game.openedApples}
                totalBoxes={game.totalBoxes}
              />
            )}

            {/* Auto stats */}
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

            {/* Manual controls */}
            {game.mode === "manual" && (
              <div className="w-full">
                {!game.manualRunning ? (
                  <button
                    onClick={game.startGame}
                    className="hidden md:block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Start Game
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={game.collectApples}
                      disabled={game.openedApples === 0}
                      className={`flex-1 py-2 rounded text-white ${
                        game.openedApples === 0
                          ? "bg-yellow-300 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      Collect: {game.collectAmount.toFixed(2)}
                    </button>

                    <button
                      onClick={() => game.bankIt(game.bankValue)}
                      disabled={game.openedApples === 0}
                      className={`flex-1 py-2 rounded text-white ${
                        game.openedApples === 0
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      Bank It
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Auto controls */}
            {game.mode === "auto" && !game.gameActive && (
              <button
                onClick={game.startAutoPlay}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={
                  game.balance < game.bet || game.selectedBoxes.length === 0
                }
              >
                Start Auto Play ({game.rounds} rounds)
                {game.selectedBoxes.length === 0 && (
                  <div className="text-xs mt-1">Select boxes first!</div>
                )}
              </button>
            )}
            {game.mode === "auto" && game.gameActive && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={game.stopAutoPlay}
                  className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Stop Auto (Round {game.currentRound}/{game.rounds})
                </button>
                {game.roundInProgress && (
                  <div className="text-center text-sm text-gray-600">
                    Opening box{" "}
                    {Math.min(
                      game.currentBoxIndex + 1,
                      game.selectedBoxes.length
                    )}{" "}
                    of {game.selectedBoxes.length}...
                  </div>
                )}
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
              disabled={game.manualRunning || (game.mode === "auto" && game.gameActive)}
              currentJackpot={game.currentJackpot}
              openedApples={game.openedApples}
              bankValue={game.bankValue}
              setBankValue={game.setBankValue}
              cumulativeBankValues={game.cumulativeBankValues}
              availableBankOptions={game.availableBankOptions}
              collectAmount={game.collectAmount}
              maxWin={game.maxWin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
