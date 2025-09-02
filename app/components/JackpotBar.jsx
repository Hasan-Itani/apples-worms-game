"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function Jackpot({ gridSize, worms, bet }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);

  const jackpotValues = Array.from(
    { length: apples },
    (_, i) => `€${(bet * (i + 1)).toFixed(2)}`
  );
  const balanceValues = Array.from({ length: apples }, () => "€0.00");

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.scrollWidth;
      const left = Math.min(0, containerWidth - contentWidth); // negative if content is wider
      setDragConstraints({ left, right: 0 });
    }
  }, [apples]);

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  const renderRow = (values, gradientFrom, gradientTo) => (
    <div ref={containerRef} className="w-full overflow-hidden relative">
      <motion.div
        ref={contentRef}
        className="flex gap-3 p-2 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={dragConstraints}
      >
        <AnimatePresence>
          {values.map((amount, i) => (
            <motion.div
              key={`${amount}-${i}`} // ✅ Unique key
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className={`flex-shrink-0 w-24 h-16 bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white font-bold rounded-xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform`}
            >
              {amount}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl p-2">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-extrabold tracking-widest text-gray-800">
          JACKPOT
        </h2>
        <div className="bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md">
          NOT AVAILABLE
        </div>
      </div>

      {/* Jackpot Values */}
      {renderRow(jackpotValues, "from-orange-500", "to-yellow-400")}

      {/* Balance Values */}
      {renderRow(balanceValues, "from-green-600", "to-green-400")}
    </div>
  );
}