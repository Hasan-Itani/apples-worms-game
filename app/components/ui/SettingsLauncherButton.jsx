"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Pure image button that calls onClick() to open settings.
 * Uses /ui/tabs_hover.png and /ui/tabs_unhover.png
 */
export default function SettingsLauncherButton({
  size = 45,
  className = "",
  onClick,
  ariaLabel = "Open settings",
}) {
  const [hover, setHover] = useState(false);
  const src = hover ? "/tabs_hover.png" : "/tabs_unhover.png";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`select-none inline-flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt="Settings" width={size} height={size} draggable={false} />
    </button>
  );
}
