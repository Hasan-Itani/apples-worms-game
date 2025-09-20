"use client";
import { useCallback, useMemo } from "react";
import useAudio from "../hooks/useAudio"; // ← add this

export default function AutoGameStats({
  afterWin,
  setAfterWin,
  afterLoss,
  setAfterLoss,
  stopOnWin,
  setStopOnWin,
  stopOnLoss,
  setStopOnLoss,
}) {
  const audio = useAudio(); // ← sprite mgr
  const click = useCallback(() => audio.playSfx?.("button"), [audio]); // ← SFX

  const buttonClass = useMemo(
    () =>
      [
        "w-8 h-8 flex items-center justify-center rounded-lg text-xl font-bold text-white",
        "bg-[url('/inc-dec-dark-button.png')] bg-cover bg-center",
        "hover:bg-[url('/inc-dec-button.png')] active:scale-95 transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" "),
    []
  );

  const clampPct = (n) =>
    Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const adjust = useCallback((setter, dir) => {
    setter((p) => clampPct((Number(p) || 0) + dir * 5));
  }, []);
  const reset = useCallback((setter) => setter(0), []);

  return (
    <section
      aria-label="Auto play strategy"
      className="w-full p-4 bg-[url('/stats.png')] bg-cover bg-center rounded-2xl shadow-md flex flex-col gap-4"
    >
      {/* After Win */}
      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">After Win (+%):</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              reset(setAfterWin);
              click(); // ← was playSound(modeAudioRef)
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm font-semibold text-white active:scale-95"
          >
            Reset
          </button>
          <button
            type="button"
            aria-label="Decrease after-win percentage"
            onClick={() => {
              adjust(setAfterWin, -1);
              click(); // ← was playSound(betAudioRef)
            }}
            className={buttonClass}
          >
            −
          </button>
          <output
            className="w-12 text-center font-bold text-lg text-white"
            aria-live="polite"
          >
            {clampPct(afterWin)}%
          </output>
          <button
            type="button"
            aria-label="Increase after-win percentage"
            onClick={() => {
              adjust(setAfterWin, 1);
              click();
            }}
            className={buttonClass}
          >
            +
          </button>
        </div>
      </div>

      {/* After Loss */}
      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">After Loss (+%):</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              reset(setAfterLoss);
              click();
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm font-semibold text-white active:scale-95"
          >
            Reset
          </button>
          <button
            type="button"
            aria-label="Decrease after-loss percentage"
            onClick={() => {
              adjust(setAfterLoss, -1);
              click();
            }}
            className={buttonClass}
          >
            −
          </button>
          <output
            className="w-12 text-center font-bold text-lg text-white"
            aria-live="polite"
          >
            {clampPct(afterLoss)}%
          </output>
          <button
            type="button"
            aria-label="Increase after-loss percentage"
            onClick={() => {
              adjust(setAfterLoss, 1);
              click();
            }}
            className={buttonClass}
          >
            +
          </button>
        </div>
      </div>

      {/* Stop Toggles */}
      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">Stop at Win:</span>
        <button
          type="button"
          onClick={() => {
            setStopOnWin((s) => !s);
            click();
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            stopOnWin
              ? "bg-green-500 text-white shadow"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
          aria-pressed={stopOnWin}
        >
          {stopOnWin ? "ON" : "OFF"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">Stop at Loss:</span>
        <button
          type="button"
          onClick={() => {
            setStopOnLoss((s) => !s);
            click();
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            stopOnLoss
              ? "bg-red-500 text-white shadow"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
          aria-pressed={stopOnLoss}
        >
          {stopOnLoss ? "ON" : "OFF"}
        </button>
      </div>
    </section>
  );
}
