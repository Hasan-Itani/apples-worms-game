"use client";

import Jackpot from "./JackpotBar";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

const OPEN_TILE_SRC = "/sounds/open_tile.mp3";

/**
 * PreloadedSequencer
 * - Preloads frames once on client (useEffect + window.Image)
 * - Imperatively swaps <img>.src via rAF (no React re-render per frame)
 * - mode: 'loop' | 'once'
 */
function PreloadedSequencer({
  active,
  mode = "loop",
  frames = 9,
  fps = 30,
  prefix = "/box_explode_",
  ext = ".png",
  scalePct = 170,
  onDone,
}) {
  const imgRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const loadedSrcsRef = useRef([]);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    readyRef.current = false;
    loadedSrcsRef.current = [];

    if (typeof window === "undefined") return;

    const preload = async () => {
      const list = [];
      for (let i = 1; i <= frames; i++) {
        const src = `${prefix}${i}${ext}`;
        list.push(src);
      }

      await Promise.all(
        list.map(
          (src) =>
            new Promise((resolve) => {
              const im = new window.Image();
              im.decoding = "async";
              im.loading = "eager";
              im.onload = im.onerror = () => resolve();
              im.src = src;
            })
        )
      );
      if (!cancelled) {
        loadedSrcsRef.current = list;
        readyRef.current = true;
      }
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [frames, prefix, ext]);

  useEffect(() => {
    if (!active) return;
    if (!imgRef.current) return;

    let stopped = false;
    startRef.current = 0;
    const msPerFrame = 1000 / fps;

    const run = (t) => {
      if (!readyRef.current) {
        rafRef.current = requestAnimationFrame(run);
        return;
      }

      if (!startRef.current) startRef.current = t;
      const elapsed = t - startRef.current;

      let fi = Math.floor(elapsed / msPerFrame);
      const lastIndex = frames - 1;

      if (mode === "loop") {
        fi = fi % frames;
      } else {
        if (fi >= frames) {
          fi = lastIndex;
          if (!stopped) {
            stopped = true;
            onDone && onDone();
          }
        }
      }

      const src = loadedSrcsRef.current[fi] || loadedSrcsRef.current[lastIndex];
      if (src && imgRef.current && imgRef.current.src !== src) {
        imgRef.current.src = src;
      }

      if (!stopped) rafRef.current = requestAnimationFrame(run);
    };

    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, fps, frames, mode, onDone]);

  if (!active) return null;

  const sizeStyle = {
    width: `${scalePct}%`,
    height: `${scalePct}%`,
    transform: "translate(-50%, -50%)",
    left: "50%",
    top: "50%",
  };

  return (
    <div
      className="absolute pointer-events-none select-none z-10 transform-gpu will-change-transform"
      style={sizeStyle}
    >
      <img
        ref={imgRef}
        src={`${prefix}1${ext}`}
        alt=""
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function LoopFX({ active }) {
  return (
    <PreloadedSequencer
      active={active}
      mode="loop"
      frames={9}
      fps={20}
      scalePct={115}
    />
  );
}

function RevealFX({ active, onDone }) {
  return (
    <PreloadedSequencer
      active={active}
      mode="once"
      frames={9}
      fps={30}
      scalePct={180}
      onDone={onDone}
    />
  );
}

export default function Boxes({
  grid,
  handleClick,
  gridSize,
  worms,
  bet,
  manualRunning,
  openedApples,
  jackpotValues,
  bankValues,
  effectiveJackpots,
  gameOver,
  finalValue,
  onPopupClose,
  mode,
  selectedBoxes,
  setSelectedBoxes,
  gameActive,
  currentBoxIndex,
  roundInProgress,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [shakingIndex, setShakingIndex] = useState(null);

  const [loopFx, setLoopFx] = useState(new Set());
  const [revealFx, setRevealFx] = useState(new Set());

  const [animLock, setAnimLock] = useState(false);
  const [openingIndex, setOpeningIndex] = useState(null);

  const playedRevealRef = useRef(new Set());

  const prevManualRunningRef = useRef(manualRunning);
  const prevGridRef = useRef(grid);

  useEffect(() => {
    if (gameOver) {
      setRevealAll(true);
      setShowPopup(true);
    }
  }, [gameOver]);

  useEffect(() => {
    if (!prevManualRunningRef.current && manualRunning) {
      setShakingIndex(null);
      setRevealAll(false);
      setLoopFx(new Set());
      setRevealFx(new Set());
      setAnimLock(false);
      setOpeningIndex(null);
      playedRevealRef.current = new Set();
    }
    prevManualRunningRef.current = manualRunning;
  }, [manualRunning]);

  useEffect(() => {
    if (mode === "manual") setSelectedBoxes([]);
  }, [mode, setSelectedBoxes]);

  const handleClosePopup = () => {
    setShowPopup(false);
    setRevealAll(false);
    onPopupClose && onPopupClose();
  };

  const handleBoxSelection = (index) => {
    if (mode !== "auto" || gameActive) return;
    if (animLock) return;
    setSelectedBoxes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const audioRef = useRef(null);
  <audio ref={audioRef} src={OPEN_TILE_SRC} preload="auto" />
  const handleBoxClickLocal = (index) => {
    if (mode === "auto") {
      handleBoxSelection(index);
      return;
    }
    if (!manualRunning) return;
    if (animLock) return;
    if (grid[index] !== "❓") return;

    setAnimLock(true);
    setOpeningIndex(index);

    setShakingIndex(index);
    setLoopFx((prev) => new Set([...prev, index]));

    setTimeout(() => {
      setShakingIndex(null);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      handleClick(index);

      setLoopFx((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 280);
  };

  const autoShakingIndex = useMemo(() => {
    if (
      mode !== "auto" ||
      !gameActive ||
      !roundInProgress ||
      !Array.isArray(selectedBoxes) ||
      selectedBoxes.length === 0
    )
      return null;

    const step = Math.min(
      Math.max(0, currentBoxIndex || 0),
      selectedBoxes.length - 1
    );
    return selectedBoxes[step] ?? null;
  }, [mode, gameActive, roundInProgress, selectedBoxes, currentBoxIndex]);

  useEffect(() => {
    const prev = prevGridRef.current || [];
    if (grid && prev && grid.length === prev.length) {
      const toBlast = [];
      for (let i = 0; i < grid.length; i++) {
        if (
          prev[i] === "❓" &&
          grid[i] !== "❓" &&
          !playedRevealRef.current.has(i)
        ) {
          toBlast.push(i);
        }
      }
      if (toBlast.length) {
        setRevealFx((prevSet) => {
          const next = new Set(prevSet);
          toBlast.forEach((i) => next.add(i));
          return next;
        });
        setLoopFx((prevSet) => {
          const next = new Set(prevSet);
          toBlast.forEach((i) => next.delete(i));
          return next;
        });

        toBlast.forEach((i) => playedRevealRef.current.add(i));
      }
    }
    prevGridRef.current = grid;
  }, [grid]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <Jackpot
        gridSize={gridSize}
        worms={worms}
        bet={bet}
        openedApples={openedApples}
        jackpotValues={jackpotValues}
        effectiveJackpotValues={effectiveJackpots}
        bankValues={bankValues}
      />

      <div className="relative w-full max-w-md aspect-square">
        {/* grid */}
        <div
          className="grid gap-2 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {grid.map((cell, index) => {
            const isRevealed = revealAll || grid[index] !== "❓";

            // Disable when:
            // - manual: not running / revealed / lock
            // - auto: gameActive animLock
            const isDisabled =
              (mode === "manual" &&
                (!manualRunning ||
                  isRevealed ||
                  (animLock && openingIndex !== index) ||
                  (shakingIndex !== null && shakingIndex !== index))) ||
              (mode === "auto" && (gameActive || animLock));

            const isSelected = mode === "auto" && selectedBoxes.includes(index);
            const isShaking =
              shakingIndex === index || autoShakingIndex === index;
            const order = isSelected ? selectedBoxes.indexOf(index) + 1 : null;

            const loopActive = !isRevealed && (isShaking || loopFx.has(index));
            const revealActive = revealFx.has(index);

            return (
              <motion.div
                key={index}
                onClick={() => !isDisabled && handleBoxClickLocal(index)}
                className={`relative flex items-center justify-center cursor-pointer transform-gpu will-change-transform ${
                  isDisabled ? "pointer-events-none" : ""
                }`}
                animate={
                  isShaking
                    ? {
                        x: [0, -6, 6, -4, 4, 0],
                        rotate: [0, -4, 4, -3, 3, 0],
                        scale: [1, 1.03, 0.995, 1],
                      }
                    : { x: 0, rotate: 0, scale: 1 }
                }
                transition={
                  isShaking
                    ? {
                        duration:
                          mode === "auto" && autoShakingIndex === index
                            ? 0.5
                            : 0.45,
                        repeat:
                          mode === "auto" && autoShakingIndex === index
                            ? Infinity
                            : 0,
                        repeatType: "loop",
                        ease: [0.22, 0.61, 0.36, 1],
                      }
                    : { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }
                }
              >
                {/* Base box */}
                <NextImage
                  src="/box.png"
                  alt="Box"
                  fill
                  className="object-contain select-none pointer-events-none transform-gpu will-change-transform"
                />

                {/* Auto selection order */}
                {order && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow">
                    {order}
                  </div>
                )}

                {/* Small loop FX while shaking */}
                <LoopFX active={loopActive && !isRevealed} />

                {/* Revealed content */}
                {isRevealed && cell !== "❓" && (
                  <div className="absolute w-3/4 h-3/4 transform-gpu will-change-transform">
                    {cell === "🍎" && (
                      <NextImage
                        src="/apple.png"
                        alt="Apple"
                        fill
                        className="object-contain"
                      />
                    )}
                    {(cell === "💣" || cell === "🐛" || cell === "🪱") && (
                      <NextImage
                        src="/worm.png"
                        alt="Worm"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                )}

                {/* One-shot reveal blast; unlock when done */}
                <RevealFX
                  active={revealActive}
                  onDone={() => {
                    setRevealFx((prev) => {
                      const next = new Set(prev);
                      next.delete(index);
                      return next;
                    });
                    if (openingIndex === index) {
                      setOpeningIndex(null);
                      setAnimLock(false);
                    }
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Result popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                <NextImage
                  src="/win.png"
                  alt="Result"
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`text-3xl font-extrabold drop-shadow-lg text-center ${
                      (finalValue || 0) > 0 ? "text-green-200" : "text-red-300"
                    }`}
                  >
                    <div>{(finalValue || 0) > 0 ? "You Win" : "You Lose"}</div>
                    <div>
                      {(finalValue || 0) > 0
                        ? `+€${finalValue.toFixed(2)}`
                        : `-€${Math.abs(finalValue || bet).toFixed(2)}`}
                    </div>
                  </motion.div>

                  <button
                    onClick={handleClosePopup}
                    className="mt-4 px-3 py-1 bg-white/20 rounded text-white text-sm pointer-events-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <audio ref={audioRef} src={OPEN_TILE_SRC} preload="auto" />
    </div>
  );
}
