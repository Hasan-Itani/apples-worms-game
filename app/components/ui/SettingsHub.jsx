// app/components/SettingsHub.jsx
"use client";

import { useEffect, useState } from "react";
import useAudio from "../../hooks/useAudio";
import BlueDivider from "./BlueDivider";
import RulesContent from "./RulesContent";
import AudioLab from "../AudioLab";

function SectionTitle({ children }) {
  return (
    <div className="font-extrabold text-sky-300 text-center">{children}</div>
  );
}
function MutedText({ children }) {
  return <div className="text-xs opacity-80 text-center">{children}</div>;
}

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

  const [musicVol, setMusicVol] = useState(() =>
    Math.round(getMusicVolume() * 100)
  );
  const [sfxVol, setSfxVol] = useState(() => Math.round(getSfxVolume() * 100));
  const [musicMuteUI, setMusicMuteUI] = useState(isMusicMuted());
  const [sfxMuteUI, setSfxMuteUI] = useState(isSfxMuted());
  const [bgChoice, setBgChoice] = useState(
    getCurrentMusic() || "basic_background"
  );

  return (
    <div className="space-y-6">
      {/* Track chooser */}
      <div className="p-4 rounded-xl border border-sky-400/25 bg-white/5 space-y-3 ">
        <div className="font-bold text-sky-300 mb-2 text-center">
          Background Track
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { key: "ambience", label: "Ambience" },
            { key: "basic_background", label: "Basic" },
          ].map((opt) => (
            <button
              key={opt.key}
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
            className={[
              "px-2 py-1 rounded text-xs font-bold",
              musicMuteUI ? "bg-red-600/80" : "bg-green-600/80",
            ].join(" ")}
            onClick={() => {
              const next = !musicMuteUI;
              setMusicMuteUI(next);
              setMusicMuted(next);
              playSfx?.("button");
            }}
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
          onChange={(e) => {
            const v = Number(e.target.value);
            setMusicVol(v);
            setMusicVolume(v / 100);
          }}
        />
        <div className="text-sm opacity-80">{musicVol}%</div>
      </div>

      {/* SFX */}
      <div className="p-4 rounded-xl border border-sky-400/25 bg-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sky-300">SFX Volume</div>
          <button
            className={[
              "px-2 py-1 rounded text-xs font-bold",
              sfxMuteUI ? "bg-red-600/80" : "bg-green-600/80",
            ].join(" ")}
            onClick={() => {
              const next = !sfxMuteUI;
              setSfxMuteUI(next);
              setSfxMuted(next);
              playSfx?.("button");
            }}
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
          onChange={(e) => {
            const v = Number(e.target.value);
            setSfxVol(v);
            setSfxVolume(v / 100);
          }}
        />
        <div className="text-sm opacity-80">{sfxVol}%</div>
        <MutedText>
          Clicks (e.g., +/-) are SFX and won’t be muted by Music.
        </MutedText>
      </div>
    </div>
  );
}

/**
 * SettingsHub
 * Props:
 *  - renderLauncher?: ({ open }) => ReactNode
 */
export default function SettingsHub({ renderLauncher }) {
  const audio = useAudio();

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("idle"); // enter | idle | exit
  const [tab, setTab] = useState("rules"); // rules | audio | sounds

  useEffect(() => {
    if (open) {
      setPhase("enter");
      const t = setTimeout(() => setPhase("idle"), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  const openWithSfx = () => {
    audio.playSfx?.("button");
    setOpen(true);
  };

  const close = () => {
    audio.playSfx?.("button");
    setPhase("exit");
    setTimeout(() => setOpen(false), 300);
  };

  const tabs = [
    { id: "rules", label: "Rules" },
    { id: "audio", label: "Settings" },
    { id: "sounds", label: "Sounds" }, // NEW
  ];

  return (
    <>
      {/* External launcher (put beside mute in page.js) */}
      {typeof renderLauncher === "function" &&
        renderLauncher({ open: openWithSfx })}

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
        >
          <div className="absolute inset-0 bg-black/75" onClick={close} />

          <div className="relative mx-auto md:mt-14 md:max-w-4xl h-full md:h-auto md:rounded-2xl bg-black/25 backdrop-blur-md border border-sky-400/25 flex flex-col">
            {/* Header + tabs (desktop) */}
            <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-sky-400/20">
              <div className="font-extrabold text-sky-300 text-lg">
                {tab === "rules"
                  ? "RULES & INFO"
                  : tab === "audio"
                  ? "SETTINGS"
                  : "AUDIO TEST LAB"}
              </div>
              <div className="flex gap-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      audio.playSfx?.("button");
                      setTab(t.id);
                    }}
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
                <div className="md:max-h-[70vh] md:overflow-y-scroll md:pr-2">
                  <SectionTitle>RULES & INFO</SectionTitle>
                  <BlueDivider />
                  <RulesContent />
                </div>
              ) : tab === "audio" ? (
                <>
                  <SectionTitle>SETTINGS</SectionTitle>
                  <MutedText>
                    Music and sound effects are controlled separately.
                  </MutedText>
                  <BlueDivider />
                  <AudioSettings />
                </>
              ) : (
                <>
                  <SectionTitle>AUDIO TEST LAB</SectionTitle>
                  <MutedText>
                    Browse & play any clip from your sprite sheet.
                  </MutedText>
                  <BlueDivider />
                  <AudioLab />
                </>
              )}
            </div>

            {/* Bottom tabs (mobile) */}
            <div className="md:hidden relative flex items-center justify-around bg-black/25 backdrop-blur-md py-5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    audio.playSfx?.("button");
                    setTab(t.id);
                  }}
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
