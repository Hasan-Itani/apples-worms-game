// components/Boxes.js
"use client";

import Jackpot from "./JackpotBar";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [shakingIndex, setShakingIndex] = useState(null);
  const [revealedIndexes, setRevealedIndexes] = useState([]);
  const prevManualRunningRef = useRef(manualRunning);

  // handle gameOver: reveal all + show popup
  useEffect(() => {
    if (gameOver) {
      setRevealAll(true);
      setShowPopup(true);
    }
  }, [gameOver]);

  // reset when new game starts
  useEffect(() => {
    if (!prevManualRunningRef.current && manualRunning) {
      setRevealedIndexes([]);
      setShakingIndex(null);
      setRevealAll(false);
    }
    prevManualRunningRef.current = manualRunning;
  }, [manualRunning]);

  // handle Close popup (manual or timeout)
  const handleClosePopup = () => {
    setShowPopup(false);
    setRevealAll(false);
    onPopupClose && onPopupClose();
  };

  // local click with shake first
  const handleBoxClickLocal = (index) => {
    if (!manualRunning) return;
    if (shakingIndex !== null) return; // prevent double click during shake
    if (revealedIndexes.includes(index)) return;
    if (grid[index] !== "❓") return;

    setShakingIndex(index);
    setTimeout(() => {
      setShakingIndex(null);
      setRevealedIndexes((prev) => [...prev, index]);
      handleClick(index);
    }, 350);
  };

  return (
    <div className="flex flex-col items-center gap-6 align-center w-full">
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
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {grid.map((cell, index) => {
            const isRevealed =
              revealAll || revealedIndexes.includes(index) || cell !== "❓";
            const isDisabled =
              !manualRunning ||
              isRevealed ||
              (shakingIndex !== null && shakingIndex !== index);

            return (
              <motion.div
                key={index}
                onClick={() => handleBoxClickLocal(index)}
                className={`relative flex items-center justify-center cursor-pointer ${
                  isDisabled ? "pointer-events-none opacity-60" : ""
                }`}
                animate={
                  shakingIndex === index
                    ? {
                        x: [0, -8, 8, -6, 6, 0],
                        rotate: [0, -8, 8, -6, 6, 0],
                        scale: [1, 1.04, 0.98, 1],
                      }
                    : { x: 0, rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.35 }}
              >
                <Image
                  src="/box.png"
                  alt="Box"
                  fill
                  className="object-contain select-none pointer-events-none"
                />

                {isRevealed && cell !== "❓" && (
                  <div className="absolute w-3/4 h-3/4">
                    {cell === "🍎" && (
                      <Image
                        src="/apple.png"
                        alt="Apple"
                        fill
                        className="object-contain"
                      />
                    )}
                    {cell === "💣" && (
                      <Image
                        src="/worm.png"
                        alt="Worm"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* centered popup overlay */}
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
                {/* background image */}
                <Image
                  src="/win.png"
                  alt="Result"
                  fill
                  className="object-contain"
                />

                {/* text on top of the image */}
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

                  {/* close button */}
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
    </div>
  );
}
