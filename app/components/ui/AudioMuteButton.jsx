"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import useAudio from "../../hooks/useAudio";

/**
 * Global audio mute toggle using image states.
 * Props:
 *  - size: number (px) for width/height (default 45)
 *  - className: extra classes for the <button>
 */
export default function AudioMuteButton({ size = 45, className = "" }) {
  const audio = useAudio();
  const [hover, setHover] = useState(false);
  const [muted, setMuted] = useState(
    () => audio.isMusicMuted() && audio.isSfxMuted()
  );

  // keep UI in sync if changed elsewhere
  useEffect(() => {
    const t = setInterval(() => {
      setMuted(audio.isMusicMuted() && audio.isSfxMuted());
    }, 400);
    return () => clearInterval(t);
  }, [audio]);

  const src = muted
    ? hover
      ? "/audio_off_hover.png"
      : "/audio_off_unhover.png"
    : hover
    ? "/audio_hover.png"
    : "/audio_unhover.png";

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    audio.setMusicMuted(next);
    audio.setSfxMuted(next);
    audio.playSfx?.("button");
  };

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`select-none inline-flex items-center justify-center ${className}`}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
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
