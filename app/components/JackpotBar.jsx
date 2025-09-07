"use client";

import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export default function JackpotBar({
  gridSize,
  worms,
  bet,
  openedApples,
  jackpotValues: jackpotValuesProp, 
  effectiveJackpotValues: effectiveJackpotValuesProp,
  bankValues = [], 
}) {
  const containerRef = useRef(null);
  const topContentRef = useRef(null);
  const botContentRef = useRef(null);

  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });

  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);

  const computedBaseJackpotValues = useMemo(() => {
    if (
      Array.isArray(jackpotValuesProp) &&
      jackpotValuesProp.length === apples
    ) {
      return jackpotValuesProp.map((v) => +v);
    }
    const rarityFactor = 1 + (worms / totalBoxes) * 4;
    const minGrowth = 1.02;
    const maxGrowth = 1.5;

    return Array.from({ length: apples }, (_, i) => {
      const denom = Math.max(apples - 1, 1);
      const progress = i / denom;
      const dynamicGrowth =
        minGrowth + (maxGrowth - minGrowth) * (progress * progress);
      const value = bet * rarityFactor * Math.pow(dynamicGrowth, i);
      return +value.toFixed(2);
    });
  }, [bet, worms, totalBoxes, apples, jackpotValuesProp]);

  const bankValuesNormalized = useMemo(() => {
    if (!Array.isArray(bankValues)) return Array(apples).fill(0);
    return bankValues.slice(0, apples).map((v) => +(v || 0).toFixed(2));
  }, [bankValues, apples]);

  const effectiveValues = useMemo(() => {
    if (
      Array.isArray(effectiveJackpotValuesProp) &&
      effectiveJackpotValuesProp.length === apples
    ) {
      return effectiveJackpotValuesProp.map((v) => +v);
    }

    return computedBaseJackpotValues.map((val, i) => {
      const bankedAtStep = bankValuesNormalized[i] || 0;
      const remaining = val - bankedAtStep;
      return Math.max(0, +remaining.toFixed(2));
    });
  }, [
    effectiveJackpotValuesProp,
    computedBaseJackpotValues,
    bankValuesNormalized,
    apples,
  ]);

  const recalc = useCallback(() => {
    const cw = containerRef.current?.offsetWidth ?? 0;
    const sw = topContentRef.current?.scrollWidth ?? 0;
    const min = Math.min(0, cw - sw);
    setBounds({ min, max: 0 });
    const cur = x.get();
    const clamped = Math.max(min, Math.min(cur, 0));
    if (clamped !== cur) x.set(clamped);
  }, [x]);

  useLayoutEffect(() => {
    recalc();
  }, [recalc, effectiveValues.length]);

  useEffect(() => {
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => recalc());
      if (containerRef.current) ro.observe(containerRef.current);
      if (topContentRef.current) ro.observe(topContentRef.current);
      if (botContentRef.current) ro.observe(botContentRef.current);
    }
    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    const t = setTimeout(recalc, 350);
    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
      clearTimeout(t);
    };
  }, [recalc, effectiveValues.length, openedApples]);

  const itemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  };

  const itemClass = (i, current) => {
    if (current)
      return "bg-yellow-500 text-white border-2 border-yellow-700 animate-pulse";
    if (i < openedApples - 1) return "bg-green-600 text-white";
    return "bg-gray-300 text-gray-700";
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="text-center">
        <h2 className="text-xl font-extrabold tracking-widest text-gray-800">
          JACKPOT
        </h2>
      </div>

      {/* TOP (effective jackpots) */}
      <div ref={containerRef} className="w-full overflow-hidden relative">
        <motion.div
          ref={topContentRef}
          className="flex gap-3 p-2 cursor-grab active:cursor-grabbing will-change-transform"
          drag="x"
          style={{ x }}
          dragConstraints={{ left: bounds.min, right: bounds.max }}
          dragMomentum={false}
          dragElastic={0.05}
          onDragEnd={() => {
            const cur = x.get();
            if (cur > 0) x.set(0);
            else if (cur < bounds.min) x.set(bounds.min);
          }}
        >
          <AnimatePresence initial={false}>
            {effectiveValues.map((amount, i) => (
              <motion.div
                key={`eff-${i}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.16 }}
                className={`flex-shrink-0 w-16 h-12 rounded-lg shadow-md flex items-center justify-center font-bold text-sm ${itemClass(
                  i,
                  i === openedApples - 1
                )}`}
              >
                €{amount.toFixed(2)}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* BOTTOM label */}
      <div className="text-center -mt-1">
        <span className="text-xs font-semibold text-gray-700">BANKED</span>
      </div>

      {/* BOTTOM (banked per step) */}
      <div className="w-full overflow-hidden relative">
        <motion.div
          ref={botContentRef}
          className="flex gap-3 p-2 cursor-grab active:cursor-grabbing will-change-transform"
          drag="x"
          style={{ x }}
          dragConstraints={{ left: bounds.min, right: bounds.max }}
          dragMomentum={false}
          dragElastic={0.05}
          onDragEnd={() => {
            const cur = x.get();
            if (cur > 0) x.set(0);
            else if (cur < bounds.min) x.set(bounds.min);
          }}
        >
          <AnimatePresence initial={false}>
            {bankValuesNormalized.map((amount, i) => (
              <motion.div
                key={`bank-${i}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.16 }}
                className={`flex-shrink-0 w-16 h-8 rounded-lg shadow-inner flex items-center justify-center text-xs font-bold ${
                  amount > 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                €{(amount || 0).toFixed(2)}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
