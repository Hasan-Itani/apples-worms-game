"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import useAudio from "../../hooks/useAudio";

/**
 * Global audio mute toggle using image states.
 * - Treats the app as muted when BOTH music & sfx are muted.
 * - Adds keyboard a11y (aria-pressed, focus ring, type="button").
 * - Avoids unnecessary state churn; batches reads and only polls when tab is visible.
 */
export default function AudioMuteButton({ size = 45, className = "" }) {
  const audio = useAudio();
  const [hover, setHover] = useState(false);
  const [muted, setMuted] = useState(
    () => audio.isMusicMuted() && audio.isSfxMuted()
  );

  // Derive image source from UI state
  const src = useMemo(() => {
    if (muted) return hover ? "/audio_off_hover.png" : "/audio_off_unhover.png";
    return hover ? "/audio_hover.png" : "/audio_unhover.png";
  }, [hover, muted]);

  // Keep UI in sync if someone toggles from SettingsHub, etc.
  // We avoid a constant interval by syncing on visibility changes and a light heartbeat while visible.
  useEffect(() => {
    const sync = () => setMuted(audio.isMusicMuted() && audio.isSfxMuted());

    // Fast sync on tab visibility changes
    const onVis = () => {
      if (document.visibilityState === "visible") sync();
    };

    // Light heartbeat only while the tab is visible
    let id = null;
    const start = () => {
      if (id || document.visibilityState !== "visible") return;
      id = setInterval(sync, 750);
    };
    const stop = () => {
      if (id) {
        clearInterval(id);
        id = null;
      }
    };

    document.addEventListener("visibilitychange", onVis, { passive: true });
    start();

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [audio]);

  const toggle = useCallback(() => {
    const next = !muted;
    setMuted(next);
    audio.setMusicMuted(next);
    audio.setSfxMuted(next);
    // Play a small click on toggle ONLY when we are unmuting (so users hear feedback)
    if (!next) audio.playSfx?.("button");
  }, [audio, muted]);

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`select-none inline-flex items-center justify-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${className}`}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      aria-pressed={muted}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="Audio toggle"
        width={size}
        height={size}
        draggable={false}
      />
    </button>
  );
}
