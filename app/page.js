"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";

// Domain hooks & components
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

/**
 * ==========================
 * Constants
 * ==========================
 */
const COLLECT_SOUND = "/sounds/collect.mp3";
const BANKIT_SOUND = "/sounds/modes.mp3";

// Visual size presets to DRY up mobile/desktop variants
const BTN_PRESET = {
  mobile: { h: "h-[80px]", text: "text-lg" },
  desktop: { h: "h-[100px]", text: "text-2xl" },
};

/**
 * Utility to compose active/disabled button classes with identical shape
 * so we don't repeat giant template strings everywhere.
 */
function buttonClasses({
  base = "flex-1 rounded font-bold text-white",
  active = "",
  disabledBg = "",
  disabled,
  size = "desktop",
}) {
  const preset = BTN_PRESET[size] ?? BTN_PRESET.desktop;
  const common = `${base} ${preset.h} ${preset.text}`;
  return disabled
    ? `${common} ${disabledBg} cursor-not-allowed`
    : `${common} ${active}`;
}

/**
 * A tiny wrapper to safely play an <audio> element via ref, resetting currentTime.
 * (Kept local to this file because behavior is very specific.)
 */
function usePlaySound() {
  const play = (ref) => {
    if (ref?.current) {
      try {
        ref.current.currentTime = 0;
        // browsers may throw if not unlocked: that's OK, we warn and continue
        const maybePromise = ref.current.play?.();
        if (maybePromise && typeof maybePromise.catch === "function") {
          maybePromise.catch((err) => console.warn("Audio play failed:", err));
        }
      } catch (err) {
        console.warn("Audio play failed:", err);
      }
    }
  };
  return play;
}

/**
 * ==========================
 * Manual Controls (shared for mobile/desktop)
 * ==========================
 * Renders either the Start button or the Collect/Bank buttons
 * with size variants and (optionally) sound effects on click.
 */
function ManualControls({
  size = "desktop",
  manualRunning,
  onStart,
  onCollect,
  onBank,
  collectAmount,
  openedApples,
  // When true, play SFX on collect/bank (we enable this for mobile to mirror the original behavior)
  withSounds = false,
  collectAudioRef,
  bankAudioRef,
}) {
  const play = usePlaySound();

  if (!manualRunning) {
    return (
      <button
        onClick={onStart}
        className={`w-full ${buttonClasses({
          base: "rounded font-bold text-white",
          active: "start-button",
          disabled: false,
          size,
        })}`}
      >
        {size === "desktop" ? "Start Game" : "Start Game"}
      </button>
    );
  }

  const disabled = openedApples === 0;
  return (
    <div className="flex gap-2 w-full">
      <button
        onClick={() => {
          if (withSounds) play(collectAudioRef);
          onCollect();
        }}
        disabled={disabled}
        className={buttonClasses({
          active: "collect-button",
          disabledBg:
            "bg-[url('/collect_1.png')] bg-no-repeat bg-center bg-contain",
          disabled,
          size,
        })}
      >
        Collect: {collectAmount().toFixed(2)}
      </button>

      <button
        onClick={() => {
          if (withSounds) play(bankAudioRef);
          onBank();
        }}
        disabled={disabled}
        className={buttonClasses({
          active: "bank-button",
          disabledBg:
            "bg-[url('/bank_it_1.png')] bg-no-repeat bg-center bg-contain",
          disabled,
          size,
        })}
      >
        Bank It
      </button>
    </div>
  );
}

/**
 * ==========================
 * Auto Controls (shared for mobile/desktop)
 * ==========================
 * Renders Start/Stop with the same visuals while de-duplicating logic.
 */
function AutoControls({
  size = "desktop",
  gameActive,
  balance,
  bet,
  selectedBoxes,
  rounds,
  currentRound,
  roundInProgress,
  onStart,
  onStop,
  originalBet,
}) {
  const cannotStart = balance < bet || selectedBoxes.length === 0;

  if (!gameActive) {
    return (
      <div className="w-full">
        <button
          onClick={onStart}
          disabled={cannotStart}
          className={`w-full ${buttonClasses({
            base: "rounded font-bold text-white",
            active: "start-button",
            disabledBg:
              "bg-[url('/start_1.png')] bg-no-repeat bg-center bg-contain",
            disabled: cannotStart,
            size,
          })}`}
        >
          Start Auto Play ({rounds} rounds)
          {selectedBoxes.length === 0 && (
            <div className="text-sm mt-1">Select boxes first!</div>
          )}
        </button>
        {size === "desktop" && originalBet && originalBet !== bet && (
          <div className="text-xs text-center text-gray-600">
            Original bet: {originalBet} → Current: {bet}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={size === "desktop" ? "flex flex-col gap-2" : "w-full"}>
      <button
        onClick={onStop}
        className="w-full py-3 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
      >
        {size === "desktop"
          ? `Stop Auto (Round ${currentRound}/${rounds})`
          : `Stop Auto (Round ${currentRound}/${rounds})`}
      </button>

      {size === "desktop" && (
        <>
          <div className="text-xs text-center text-gray-600">
            Current bet: {bet}
            {originalBet ? ` (Started: ${originalBet})` : null}
          </div>
          {roundInProgress && (
            <div className="text-center text-sm text-gray-600">
              Opening box{" "}
              {Math.min(
                currentRound /* placeholder for box index UI */,
                selectedBoxes.length
              )}{" "}
              of {selectedBoxes.length}...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const game = useGameLogic();

  // Local audio refs (for one-shot SFX)
  const collectAudioRef = useRef(null);
  const bankAudioRef = useRef(null);

  // Sprite/looping audio manager (unlock on first interaction)
  const audio = useAudio();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Compute some derived values only when needed
  const manualChances = useMemo(() => {
    if (game.mode !== "manual") return null;
    const applesRemaining = game.totalBoxes - game.worms - game.openedApples;
    const unopened = game.totalBoxes - game.openedApples;
    const chanceOfApple =
      unopened > 0 ? Math.round((applesRemaining / unopened) * 100) : 0;
    return {
      applesRemaining,
      chanceOfApple,
      chanceOfWorm:
        unopened > 0 ? 100 - Math.round((applesRemaining / unopened) * 100) : 0,
    };
  }, [game.mode, game.totalBoxes, game.worms, game.openedApples]);

  if (loading) return <Loading onStart={() => setLoading(false)} />;

  return (
    <div className="min-h-screen bg-[url(/landscape_background.jpg)] bg-no-repeat bg-cover bg-center relative">
      {/* === Top-right floating controls bar === */}
      <SettingsHub
        renderLauncher={({ open }) => (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <AudioMuteButton size={45} />
            <SettingsLauncherButton size={45} onClick={open} />
          </div>
        )}
      />

      {/* Grid Layout */}
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

          {/* --- MOBILE CONTROLS (shared components) --- */}
          {game.mode === "manual" && (
            <div className="md:hidden w-full mt-4">
              <ManualControls
                size="mobile"
                manualRunning={game.manualRunning}
                onStart={game.startGame}
                onCollect={game.collectApples}
                onBank={() => game.bankIt(game.bankValue)}
                collectAmount={game.collectAmount}
                openedApples={game.openedApples}
                withSounds
                collectAudioRef={collectAudioRef}
                bankAudioRef={bankAudioRef}
              />
            </div>
          )}

          {game.mode === "auto" && (
            <div className="md:hidden w-full mt-4">
              <AutoControls
                size="mobile"
                gameActive={game.gameActive}
                balance={game.balance}
                bet={game.bet}
                selectedBoxes={game.selectedBoxes}
                rounds={game.rounds}
                currentRound={game.currentRound}
                roundInProgress={game.roundInProgress}
                onStart={game.startAutoPlay}
                onStop={game.stopAutoPlay}
                originalBet={game.originalBet}
              />
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
            className="mx-auto mt-2 mb-2 w-[70%] max-w-[400px] h-auto"
            priority
          />

          <div className="w-full max-w-md mx-auto p-2 space-y-6">
            {/* Manual stats */}
            {game.mode === "manual" && manualChances && (
              <GameStats
                applesRemaining={manualChances.applesRemaining}
                chanceOfApple={manualChances.chanceOfApple}
                chanceOfWorm={manualChances.chanceOfWorm}
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

            {/* Manual controls (desktop) */}
            {game.mode === "manual" && (
              <div className="w-full hidden md:block">
                <ManualControls
                  size="desktop"
                  manualRunning={game.manualRunning}
                  onStart={game.startGame}
                  onCollect={game.collectApples}
                  onBank={() => game.bankIt(game.bankValue)}
                  collectAmount={game.collectAmount}
                  openedApples={game.openedApples}
                  // keep desktop silent to match original behavior
                  withSounds={false}
                />
              </div>
            )}

            {/* Auto controls (desktop) */}
            {game.mode === "auto" && (
              <div className="hidden md:block">
                <AutoControls
                  size="desktop"
                  gameActive={game.gameActive}
                  balance={game.balance}
                  bet={game.bet}
                  selectedBoxes={game.selectedBoxes}
                  rounds={game.rounds}
                  currentRound={game.currentRound}
                  roundInProgress={game.roundInProgress}
                  onStart={game.startAutoPlay}
                  onStop={game.stopAutoPlay}
                  originalBet={game.originalBet}
                />
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

      {/* One-shot SFX */}
      <audio
        ref={collectAudioRef}
        src={COLLECT_SOUND}
        preload="auto"
        playsInline
      />
      <audio ref={bankAudioRef} src={BANKIT_SOUND} preload="auto" playsInline />
    </div>
  );
}
