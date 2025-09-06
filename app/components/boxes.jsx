// components/Boxes.js
"use client";

import Jackpot from "./JackpotBar";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (gameOver) {
      setShowPopup(true);
      const t = setTimeout(() => {
        setShowPopup(false);
        onPopupClose && onPopupClose();
      }, 3000);
      return () => clearTimeout(t);
    }
    if (!gameOver) setShowPopup(false);
  }, [gameOver, onPopupClose]);

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
          {grid.map((cell, index) => (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className={`relative flex items-center justify-center cursor-pointer ${
                !manualRunning ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <Image
                src="/box.png"
                alt="Box"
                fill
                className="object-contain select-none pointer-events-none"
              />
              {cell !== "❓" && (
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
            </div>
          ))}
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
                {/* background image (your uploaded win.png in /public) */}
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
                    className={`text-3xl font-extrabold drop-shadow-lg ${
                      (finalValue || 0) > 0 ? "text-green-200" : "text-red-300"
                    }`}
                  >
                    {(finalValue || 0) > 0
                      ? `+€${finalValue.toFixed(2)}`
                      : finalValue === 0
                      ? `No Win! - €${bet.toFixed(2)}`
                      : `-€${Math.abs(finalValue).toFixed(2)}`}
                  </motion.div>

                  {/* small close control (optional) */}
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      onPopupClose && onPopupClose();
                    }}
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
