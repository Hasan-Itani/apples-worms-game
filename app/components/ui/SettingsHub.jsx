// app/components/SettingsHub.jsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAudio from "../../hooks/useAudio";
import BlueDivider from "./BlueDivider";
import RulesContent from "./RulesContent";
import AudioLab from "../AudioLab";

/**
 * SettingsHub — modal with three tabs: Rules, Settings (audio), Sounds (AudioLab)
 *
 * Improvements
 * - A11y: proper dialog semantics (role, aria-*) + ESC to close
 * - Focus mgmt: trap focus inside modal; return focus to launcher on close
 * - Body scroll lock when modal is open
 * - Extracted small helpers & callbacks; fewer new fns on every render
 * - DRY: Tab button styles & list rendering
 */

/* =====================================
 * Small presentational helpers
 * ===================================== */
function SectionTitle({ children }) {
  return (
    <div className="font-extrabold text-sky-300 text-center">{children}</div>
  );
}
function MutedText({ children }) {
  return <div className="text-xs opacity-80 text-center">{children}</div>;
}

/* =====================================
 * Audio Settings Panel
 * ===================================== */
function AudioSettings() {
  const {
    getMusicVolume,
    setMusicVolume,
    isMusicMuted,
    setMusicMuted,
    getCurrentMusic,
    playMusic,
    getSfxVolume,
    setSfxVolume,
    isSfxMuted,
    setSfxMuted,
    playSfx,
  } = useAudio();

  const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));

  const [musicVol, setMusicVol] = useState(() =>
    Math.round((getMusicVolume() || 0) * 100)
  );
  const [sfxVol, setSfxVol] = useState(() =>
    Math.round((getSfxVolume() || 0) * 100)
  );
  const [musicMuteUI, setMusicMuteUI] = useState(isMusicMuted());
  const [sfxMuteUI, setSfxMuteUI] = useState(isSfxMuted());
  const [bgChoice, setBgChoice] = useState(
    getCurrentMusic() || "basic_background"
  );

  const fmtPct = useCallback(
    (v) => `${Math.max(0, Math.min(100, Math.round(Number(v) || 0)))}%`,
    []
  );

  const onToggleMusicMute = useCallback(() => {
    const next = !musicMuteUI;
    setMusicMuteUI(next);
    setMusicMuted(next);
    playSfx?.("button");
  }, [musicMuteUI, setMusicMuted, playSfx]);

  const onToggleSfxMute = useCallback(() => {
    const next = !sfxMuteUI;
    setSfxMuteUI(next);
    setSfxMuted(next);
    playSfx?.("button");
  }, [sfxMuteUI, setSfxMuted, playSfx]);

  const onMusicVol = useCallback(
    (e) => {
      const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
      setMusicVol(v);
      setMusicVolume(clamp01(v / 100));
    },
    [setMusicVolume]
  );

  const onSfxVol = useCallback(
    (e) => {
      const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
      setSfxVol(v);
      setSfxVolume(clamp01(v / 100));
    },
    [setSfxVolume]
  );

  const bgOpts = useMemo(
    () => [
      { key: "ambience", label: "Ambience" },
      { key: "basic_background", label: "Basic" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Track chooser */}
      <div className="p-4 rounded-xl border border-sky-400/25 bg-white/5 space-y-3 ">
        <div className="font-bold text-sky-300 mb-2 text-center">
          Background Track
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {bgOpts.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={[
                "px-3 py-2 rounded-md font-bold border transition",
                bgChoice === opt.key
                  ? "bg-sky-500/30 border-sky-400/70"
                  : "bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/30",
              ].join(" ")}
              onClick={() => {
                setBgChoice(opt.key);
                playMusic(opt.key);
                playSfx?.("button");
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <MutedText>Only one background plays at a time.</MutedText>
      </div>

      {/* Music */}
      <div className="p-4 rounded-xl border border-sky-400/25 bg-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sky-300">Music Volume</div>
          <button
            type="button"
            className={[
              "px-2 py-1 rounded text-xs font-bold",
              musicMuteUI ? "bg-red-600/80" : "bg-green-600/80",
            ].join(" ")}
            onClick={onToggleMusicMute}
            aria-pressed={musicMuteUI}
          >
            {musicMuteUI ? "Unmute" : "Mute"}
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={musicVol}
          className="w-full accent-orange-500 cursor-pointer"
          onChange={onMusicVol}
          aria-label="Music volume"
        />
        <div className="text-sm opacity-80">{fmtPct(musicVol)}</div>
      </div>

      {/* SFX */}
      <div className="p-4 rounded-xl border border-sky-400/25 bg-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sky-300">SFX Volume</div>
          <button
            type="button"
            className={[
              "px-2 py-1 rounded text-xs font-bold",
              sfxMuteUI ? "bg-red-600/80" : "bg-green-600/80",
            ].join(" ")}
            onClick={onToggleSfxMute}
            aria-pressed={sfxMuteUI}
          >
            {sfxMuteUI ? "Unmute" : "Mute"}
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={sfxVol}
          className="w-full accent-orange-500 cursor-pointer"
          onChange={onSfxVol}
          aria-label="SFX volume"
        />
        <div className="text-sm opacity-80">{fmtPct(sfxVol)}</div>
        <MutedText>
          Clicks (e.g., +/-) are SFX and won't be muted by Music.
        </MutedText>
      </div>
    </div>
  );
}

/* =====================================
 * Main SettingsHub (modal + tabs)
 * ===================================== */
export default function SettingsHub({ renderLauncher }) {
  const audio = useAudio();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("idle"); // enter | idle | exit
  const [tab, setTab] = useState("rules"); // rules | audio | sounds

  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const launcherRef = useRef(null);

  const tabs = useMemo(
    () => [
      { id: "rules", label: "Rules" },
      { id: "audio", label: "Settings" },
      { id: "sounds", label: "Sounds" },
    ],
    []
  );

  // Open/close helpers
  const openWithSfx = useCallback(() => {
    audio.playSfx?.("button");
    setOpen(true);
  }, [audio]);

  const close = useCallback(() => {
    audio.playSfx?.("button");
    setPhase("exit");
    setTimeout(() => setOpen(false), 300);
  }, [audio]);

  // phase enter on open
  useEffect(() => {
    if (!open) return;
    setPhase("enter");
    const t = setTimeout(() => setPhase("idle"), 10);
    return () => clearTimeout(t);
  }, [open]);

  // ESC to close + focus trap + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      } else if (e.key === "Tab") {
        // naive trap using invisible sentinels
        const focusables = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.classList.add("overflow-hidden");
    document.addEventListener("keydown", onKey, true);

    // focus first focusable
    const t = setTimeout(() => {
      const el = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus?.();
    }, 0);

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", onKey, true);
      clearTimeout(t);
      // return focus to launcher
      launcherRef.current?.focus?.();
    };
  }, [open, close]);

  // Tab switch helper
  const onTab = useCallback(
    (id) => {
      audio.playSfx?.("button");
      setTab(id);
    },
    [audio]
  );

  const headerTitle =
    tab === "rules"
      ? "RULES & INFO"
      : tab === "audio"
      ? "SETTINGS"
      : "AUDIO TEST LAB";

  return (
    <>
      {/* External launcher */}
      {typeof renderLauncher === "function" &&
        renderLauncher({
          open: () => {
            // capture focus origin to restore later
            setTimeout(() => {
              launcherRef.current = document.activeElement;
            }, 0);
            openWithSfx();
          },
        })}

      {/* Overlay modal */}
      {open && (
        <div
          className={[
            "fixed inset-0 z-50 text-white",
            "transform transition-transform duration-300",
            phase === "enter"
              ? "translate-x-0"
              : phase === "exit"
              ? "translate-x-full md:translate-x-0 md:-translate-y-full"
              : "translate-x-0",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settingshub-title"
        >
          <div className="absolute inset-0 bg-black/75" onClick={close} />

          <div
            ref={dialogRef}
            className="relative mx-auto md:mt-14 md:max-w-4xl h-full md:h-auto md:rounded-2xl bg-black/25 backdrop-blur-md border border-sky-400/25 flex flex-col outline-none"
          >
            {/* Header + tabs (desktop) */}
            <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-sky-400/20">
              <div
                id="settingshub-title"
                className="font-extrabold text-sky-300 text-lg"
              >
                {headerTitle}
              </div>
              <div
                className="flex gap-2"
                role="tablist"
                aria-label="Settings tabs"
              >
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    aria-controls={`panel-${t.id}`}
                    id={`tab-${t.id}`}
                    onClick={() => onTab(t.id)}
                    className={[
                      "px-3 py-2 rounded-md font-bold border transition",
                      tab === t.id
                        ? "bg-sky-500/30 border-sky-400/70"
                        : "bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/30",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={close}
                  className="px-3 py-2 rounded-md font-bold border bg-red-600/80 border-red-500/40"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 overflow-y-auto">
              {tab === "rules" ? (
                <div
                  id="panel-rules"
                  role="tabpanel"
                  aria-labelledby="tab-rules"
                  className="md:max-h-[70vh] md:overflow-y-scroll md:pr-2"
                >
                  <SectionTitle>RULES & INFO</SectionTitle>
                  <BlueDivider />
                  <RulesContent />
                </div>
              ) : tab === "audio" ? (
                <div
                  id="panel-audio"
                  role="tabpanel"
                  aria-labelledby="tab-audio"
                >
                  <SectionTitle>SETTINGS</SectionTitle>
                  <MutedText>
                    Music and sound effects are controlled separately.
                  </MutedText>
                  <BlueDivider />
                  <AudioSettings />
                </div>
              ) : (
                <div
                  id="panel-sounds"
                  role="tabpanel"
                  aria-labelledby="tab-sounds"
                >
                  <SectionTitle>AUDIO TEST LAB</SectionTitle>
                  <MutedText>
                    Browse & play any clip from your sprite sheet.
                  </MutedText>
                  <BlueDivider />
                  <AudioLab />
                </div>
              )}
            </div>

            {/* Bottom tabs (mobile) */}
            <div
              className="md:hidden relative flex items-center justify-around bg-black/25 backdrop-blur-md py-5"
              role="tablist"
              aria-label="Settings tabs (mobile)"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  id={`tab-${t.id}-m`}
                  onClick={() => onTab(t.id)}
                  className={[
                    "px-4 py-2 rounded-md font-bold border",
                    tab === t.id
                      ? "bg-sky-500/30 border-sky-400/70"
                      : "bg-sky-500/15 border-sky-400/30",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-md font-bold border bg-red-600/80 border-red-500/40"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
