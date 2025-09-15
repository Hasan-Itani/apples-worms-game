"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useGameLogic } from "./hooks/useGameLogic";
import GameStats from "./components/GameStats";
import AutoGameStats from "./components/AutoGameStats";
import BetControls from "./components/BetControls";
import Boxes from "./components/Boxes";

import useAudio from "./hooks/useAudio";
import SettingsHub from "./components/ui/SettingsHub";
import AudioMuteButton from "./components/ui/AudioMuteButton";
import SettingsLauncherButton from "./components/ui/SettingsLauncherButton";
import Loading from "./components/Loading";

export default function HomePage() {
  const game = useGameLogic();

  // sprite audio
  const audio = useAudio();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true); // новый state

  useEffect(() => {
    const unlockOnce = () => {
      if (!unlocked) {
        audio.unlock("basic_background");
        setUnlocked(true);
      }
    };
    window.addEventListener("pointerdown", unlockOnce, { once: true });
    return () => window.removeEventListener("pointerdown", unlockOnce);
  }, [audio, unlocked]);

    if (loading) {
    return <Loading onStart={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[url(/landscape_background.jpg)] bg-no-repeat bg-cover bg-center relative">
      {/* === Top-right floating controls bar (both 45x45) === */}
      <SettingsHub
        renderLauncher={({ open }) => (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <AudioMuteButton size={45} />
            <SettingsLauncherButton size={45} onClick={open} />
          </div>
        )}
      />

      {/* Layout */}
      <div className="flex flex-col md:grid md:grid-cols-2 w-full h-full gap-3 p-4">
        {/* RIGHT PANEL (Boxes + mobile controls) */}
        <div className="flex flex-col justify-center items-center order-1 md:order-2 w-full">
          <Boxes
            grid={game.grid}
            handleClick={game.onBoxClick}
            currentBoxIndex={game.currentBoxIndex}
            roundInProgress={game.roundInProgress}
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

          {/* --- MOBILE CONTROLS --- */}
          {game.mode === "manual" && (
            <div className="md:hidden w-full mt-4">
              {!game.manualRunning ? (
                <button
                  onClick={game.startGame}
                  className="w-full py-4 px-8 text-white rounded text-xl font-bold start-button"
                >
                  Start Game
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={game.collectApples}
                    disabled={game.openedApples === 0}
                    className={`flex-1 h-[80px] rounded text-lg font-bold text-white ${
                      game.openedApples === 0
                        ? "bg-[url('/collect_1.png')] bg-no-repeat bg-center bg-contain cursor-not-allowed"
                        : "collect-button"
                    }`}
                  >
                    Collect: {game.collectAmount().toFixed(2)}
                  </button>

                  <button
                    onClick={() => game.bankIt(game.bankValue)}
                    disabled={game.openedApples === 0}
                    className={`flex-1 h-[80px] rounded text-lg font-bold text-white ${
                      game.openedApples === 0
                        ? "bg-[url('/bank_it_1.png')] bg-no-repeat bg-center bg-contain cursor-not-allowed"
                        : "bank-button"
                    }`}
                  >
                    Bank It
                  </button>
                </div>
              )}
            </div>
          )}

          {game.mode === "auto" && (
            <div className="md:hidden w-full mt-4">
              {!game.gameActive ? (
                <button
                  onClick={game.startAutoPlay}
                  disabled={
                    game.balance < game.bet || game.selectedBoxes.length === 0
                  }
                  className={`w-full h-[100px] rounded text-2xl font-bold text-white ${
                    game.balance < game.bet || game.selectedBoxes.length === 0
                      ? "bg-[url('/start_1.png')] bg-no-repeat bg-center bg-contain cursor-not-allowed"
                      : "start-button"
                  }`}
                >
                  Start Auto Play ({game.rounds} rounds)
                  {game.selectedBoxes.length === 0 && (
                    <div className="text-sm mt-1">Select boxes first!</div>
                  )}
                </button>
              ) : (
                <button
                  onClick={game.stopAutoPlay}
                  className="w-full py-3 bg-red-500 text-white rounded hover:bg-red-600 text-lg font-bold"
                >
                  Stop Auto (Round {game.currentRound}/{game.rounds})
                </button>
              )}
            </div>
          )}
        </div>

        {/* LEFT PANEL (Stats + desktop controls) */}
        <div className="text-center text-black flex flex-col items-center order-2 md:order-1">
          <Image
            src={"/logo.png"}
            alt="Logo"
            width={400}
            height={180}
            className="mx-auto mt-6 mb-4 w-[70%] max-w-[400px] h-auto"
          />

          <div className="w-full max-w-md mx-auto p-2 space-y-6 ">
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

            {/* Manual controls (desktop only) */}
            {game.mode === "manual" && (
              <div className="w-full hidden md:block">
                {!game.manualRunning ? (
                  <button
                    onClick={game.startGame}
                    className="w-full py-6 px-20 text-white rounded start-button text-2xl font-bold"
                  >
                    Start Game
                  </button>
                ) : (
                  <div className="flex gap-2 justify-center w-full">
                    <button
                      onClick={game.collectApples}
                      disabled={game.openedApples === 0}
                      className={`flex-1 h-[100px] rounded text-2xl font-bold text-white ${
                        game.openedApples === 0
                          ? "bg-[url('/collect_1.png')] bg-no-repeat bg-center bg-contain cursor-not-allowed"
                          : "collect-button"
                      }`}
                    >
                      Collect: {game.collectAmount().toFixed(2)}
                    </button>

                    <button
                      onClick={() => game.bankIt(game.bankValue)}
                      disabled={game.openedApples === 0}
                      className={`flex-1 h-[100px] rounded text-2xl font-bold text-white ${
                        game.openedApples === 0
                          ? "bg-[url('/bank_it_1.png')] bg-no-repeat bg-center bg-contain cursor-not-allowed"
                          : "bank-button"
                      }`}
                    >
                      Bank It
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Auto controls (desktop only) */}
            {game.mode === "auto" && !game.gameActive && (
              <div className="hidden md:block space-y-2">
                <button
                  onClick={game.startAutoPlay}
                  disabled={
                    game.balance < game.bet || game.selectedBoxes.length === 0
                  }
                  className={`w-full h-[100px] rounded text-2xl font-bold text-white ${
                    game.balance < game.bet || game.selectedBoxes.length === 0
                      ? "bg-[url('/start_1.png')] bg-no-repeat bg-center bg-contain cursor-not-allowed"
                      : "start-button"
                  }`}
                >
                  Start Auto Play ({game.rounds} rounds)
                  {game.selectedBoxes.length === 0 && (
                    <div className="text-sm mt-1">Select boxes first!</div>
                  )}
                </button>
                {game.originalBet && game.originalBet !== game.bet && (
                  <div className="text-xs text-center text-gray-600">
                    Original bet: {game.originalBet} → Current: {game.bet}
                  </div>
                )}
              </div>
            )}
            {game.mode === "auto" && game.gameActive && (
              <div className="hidden md:flex flex-col gap-2">
                <button
                  onClick={game.stopAutoPlay}
                  className="w-full py-3 bg-red-500 text-white rounded hover:bg-red-600 text-xl font-bold"
                >
                  Stop Auto (Round {game.currentRound}/{game.rounds})
                </button>
                <div className="text-xs text-center text-gray-600">
                  Current bet: {game.bet} (Started: {game.originalBet})
                </div>
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
              disabled={
                game.manualRunning || (game.mode === "auto" && game.gameActive)
              }
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
