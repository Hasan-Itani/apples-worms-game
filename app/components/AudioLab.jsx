// app/components/AudioLab.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
// If this file is under /app/components:
import useAudio from "../hooks/useAudio";
// If you moved AudioLab under /app/components/ui, use:
// import useAudio from "../../hooks/useAudio";

const BG_NAMES = new Set(["ambience", "basic_background"]);

// Local divider to avoid path issues
function Divider() {
  return <div className="my-3 h-px w-full bg-sky-400/20" />;
}

export default function AudioLab() {
  const audio = useAudio();
  const [map, setMap] = useState({});
  const [q, setQ] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/gameaudio.json");
        const j = await res.json();
        if (!canceled) setMap(j?.spritemap || {});
      } catch {
        if (!canceled) setMap({});
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const items = Object.entries(map).map(([name, seg]) => {
      const start = Number(seg.start) || 0;
      const end = Number(seg.end) || 0;
      const duration = Math.max(0, end - start);
      return { name, loop: !!seg.loop, start, end, duration };
    });
    items.sort((a, b) => a.start - b.start);
    if (!q.trim()) return items;
    const k = q.trim().toLowerCase();
    return items.filter((r) => r.name.toLowerCase().includes(k));
  }, [map, q]);

  const unlock = async () => {
    try {
      await audio.unlock("basic_background");
      setUnlocked(true);
      audio.playSfx?.("button");
    } catch {}
  };

  // Fixed column widths so numbers line up across all rows
  const COLS = "grid grid-cols-[1fr_120px_120px_120px_260px]";

  return (
    <div className="w-full max-w-[1000px] mx-auto text-white">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-extrabold text-sky-300 text-lg">
          AUDIO TEST LAB
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sound…"
            className="px-3 py-2 rounded-md bg-white/10 border border-white/15 outline-none text-sm"
          />
          <button
            onClick={unlock}
            className="px-3 py-2 rounded-md text-sm font-bold bg-emerald-600/80 hover:bg-emerald-500/80 active:scale-95"
          >
            {unlocked ? "Audio Unlocked" : "Unlock Audio"}
          </button>
        </div>
      </div>

      <Divider />

      <div className="text-xs opacity-80 mb-3 text-center">
        <span className="font-semibold">Play</span> auto-routes (BG → Music,
        others → SFX).
        <span className="font-semibold"> Music</span> is enabled only for BG
        clips. Use <span className="font-semibold">Stop BG</span> to stop
        background music.
      </div>

      {/* Outer card with its own vertical scroll (keeps modal tidy) */}
      <div className="rounded-2xl border border-sky-400/20 bg-black/20 overflow-hidden">
        {/* HORIZONTAL SCROLL AREA */}
        <div className="overflow-x-auto max-w-full">
          {/* Give the grid a minimum width so horizontal scrollbar appears when needed */}
          <div className="min-w-[940px]">
            {/* Header */}
            <div className={`${COLS} gap-0 text-xs bg-white/5`}>
              <div
                className="px-3 py-2 font-bold text-sky-300 sticky left-0 z-20 bg-white/5 backdrop-blur-sm"
                // sticky keeps "Name" visible while scrolling horizontally
              >
                Name
              </div>
              <div className="px-3 py-2 font-bold text-sky-300 text-right">
                Start
              </div>
              <div className="px-3 py-2 font-bold text-sky-300 text-right">
                End
              </div>
              <div className="px-3 py-2 font-bold text-sky-300 text-right">
                Duration
              </div>
              <div className="px-3 py-2 font-bold text-sky-300 text-center">
                Actions
              </div>
            </div>

            {/* BODY (with optional vertical scroll if list is long) */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/10">
              {rows.map((r) => (
                <div key={r.name} className={`${COLS} items-center`}>
                  {/* Name column (sticky on horizontal scroll) */}
                  <div className="px-3 py-2 flex items-center gap-2 sticky left-0 z-10 bg-black/30 backdrop-blur-sm">
                    <span className="font-semibold">{r.name}</span>
                    {r.loop && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/25 border border-amber-400/30">
                        loop
                      </span>
                    )}
                    {BG_NAMES.has(r.name) && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/25 border border-violet-400/30">
                        bg
                      </span>
                    )}
                  </div>

                  {/* Numbers (aligned) */}
                  <div className="px-3 py-2 text-right tabular-nums">
                    {r.start.toFixed(3)}s
                  </div>
                  <div className="px-3 py-2 text-right tabular-nums">
                    {r.end.toFixed(3)}s
                  </div>
                  <div className="px-3 py-2 text-right tabular-nums">
                    {r.duration.toFixed(3)}s
                  </div>

                  {/* Actions */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => audio.play(r.name)}
                        className="px-2 py-1 rounded bg-sky-600/80 hover:bg-sky-500/80 text-[12px] font-bold active:scale-95"
                        title="Auto (BG→Music, else SFX)"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => audio.playSfx?.(r.name)}
                        className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-500/80 text-[12px] font-bold active:scale-95"
                        title="Force SFX channel"
                      >
                        SFX
                      </button>
                      <button
                        onClick={() =>
                          BG_NAMES.has(r.name) && audio.playMusic?.(r.name)
                        }
                        disabled={!BG_NAMES.has(r.name)}
                        className={[
                          "px-2 py-1 rounded text-[12px] font-bold active:scale-95",
                          BG_NAMES.has(r.name)
                            ? "bg-violet-600/80 hover:bg-violet-500/80"
                            : "bg-white/10 cursor-not-allowed opacity-50",
                        ].join(" ")}
                        title={
                          BG_NAMES.has(r.name)
                            ? "Force Music channel (loops BG)"
                            : "Music button is only for BG clips"
                        }
                      >
                        Music
                      </button>
                      <button
                        onClick={() =>
                          BG_NAMES.has(r.name) && audio.stopMusic?.()
                        }
                        disabled={!BG_NAMES.has(r.name)}
                        className={[
                          "px-2 py-1 rounded text-[12px] font-bold active:scale-95",
                          BG_NAMES.has(r.name)
                            ? "bg-rose-600/80 hover:bg-rose-500/80"
                            : "bg-white/10 cursor-not-allowed opacity-50",
                        ].join(" ")}
                        title={
                          BG_NAMES.has(r.name)
                            ? "Stop background music"
                            : "Stop BG applies only to BG clips"
                        }
                      >
                        Stop BG
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="p-6 text-center text-sm opacity-75">
                  No sounds matched.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 bg-white/5">
          <div className="text-xs opacity-80">
            Horizontal scroll keeps columns aligned. Music is single-track; use{" "}
            <span className="font-semibold">Stop Music</span> to silence it.
          </div>
          <button
            onClick={() => audio.stopMusic?.()}
            className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-500/80 text-sm font-bold active:scale-95"
          >
            Stop Music
          </button>
        </div>
      </div>
    </div>
  );
}
