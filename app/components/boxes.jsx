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
  mode,
  selectedBoxes,
  setSelectedBoxes,
  gameActive,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [shakingIndex, setShakingIndex] = useState(null);
  const [revealedIndexes, setRevealedIndexes] = useState([]);
  const prevManualRunningRef = useRef(manualRunning);

  // Show popup and reveal all when gameOver triggers
  useEffect(() => {
    if (gameOver) {
      setRevealAll(true);
      setShowPopup(true);
    }
  }, [gameOver]);

  // Reset state when a new manual game starts
  useEffect(() => {
    if (!prevManualRunningRef.current && manualRunning) {
      setRevealedIndexes([]);
      setShakingIndex(null);
      setRevealAll(false);
    }
    prevManualRunningRef.current = manualRunning;
  }, [manualRunning]);

  // Clear selections when switching modes
  useEffect(() => {
    if (mode === "manual") {
      setSelectedBoxes([]);
    }
  }, [mode, setSelectedBoxes]);

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setRevealAll(false);
    onPopupClose && onPopupClose();
  };

  // Box selection in auto mode
  const handleBoxSelection = (index) => {
    if (mode !== "auto" || gameActive) return;
    setSelectedBoxes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Click box in manual mode with shake animation
  const handleBoxClickLocal = (index) => {
    if (mode === "auto") {
      handleBoxSelection(index);
      return;
    }

    if (!manualRunning) return;
    if (shakingIndex !== null) return;
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

      {mode === "auto" && !gameActive && (
        <div className="text-center text-sm -mt-text-gray-700">
          Select {selectedBoxes.length} boxes to open automatically
        </div>
      )}

      <div className="relative w-full max-w-md aspect-square">
        {/* grid */}
        <div
          className="grid gap-2 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {grid.map((cell, index) => {
            const isRevealed =
              revealAll || revealedIndexes.includes(index) || cell !== "❓";
            const isDisabled =
              (mode === "manual" &&
                (!manualRunning ||
                  isRevealed ||
                  (shakingIndex !== null && shakingIndex !== index))) ||
              (mode === "auto" && gameActive);
            const isSelected = mode === "auto" && selectedBoxes.includes(index);

            return (
              <motion.div
                key={index}
                onClick={() => handleBoxClickLocal(index)}
                className={`relative flex items-center justify-center cursor-pointer ${
                  isDisabled ? "pointer-events-none opacity-60" : ""
                } ${isSelected ? "ring-4 ring-blue-500 ring-opacity-70" : ""}`}
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

                {/* Auto selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {selectedBoxes.indexOf(index) + 1}
                  </div>
                )}

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
                <Image
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
    </div>
  );
}
