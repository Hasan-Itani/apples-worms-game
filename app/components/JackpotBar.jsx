"use client";

import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { computeBaseJackpotValues } from "../utils/jackpots";
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
  jackpotValues: jackpotValuesProp,
  effectiveJackpotValues: effectiveJackpotValuesProp,
  bankValues,
  openedApples = 0,
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
    return computeBaseJackpotValues(bet, worms, gridSize).values;
  }, [bet, worms, gridSize, apples, jackpotValuesProp]);

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
    const wrap = containerRef.current;
    const content = topContentRef.current;
    if (!wrap || !content) return;

    const wrapW = wrap.clientWidth;
    const contentW = content.scrollWidth;

    if (contentW <= wrapW) {
      setBounds({ min: 0, max: 0 });
      x.set(0);
    } else {
      setBounds({ min: wrapW - contentW, max: 0 });
      const cur = x.get();
      if (cur > 0) x.set(0);
      if (cur < wrapW - contentW) x.set(wrapW - contentW);
    }
  }, [x]);

  useLayoutEffect(() => {
    recalc();
  }, [recalc, effectiveValues.length]);

  useEffect(() => {
    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    const t = setTimeout(recalc, 0);
    return () => {
      window.removeEventListener("resize", onResize);
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
      return "text-[20px] bg-orange-500 text-white border-2 border-yellow-700";
    if (i < openedApples - 1) return "bg-black text-white text-[20px]";
    return "bg-black text-white text-[20px]";
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="text-center">
        <h2 className="text-xl font-extrabold tracking-widest text-gray-800">
          JACKPOT
        </h2>
      </div>

      {/* TOP (effective jackpots) */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden relative bg-[url('/bets.png')] bg-cover"
      >
        <motion.div
          ref={topContentRef}
          className="flex gap-1 p-2 cursor-grab active:cursor-grabbing will-change-transform"
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
            {effectiveValues.map((amount, i) => {
              const isCurrent = i === Math.max(0, openedApples - 1);
              return (
                <motion.div
                  key={`eff-${i}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`min-w-[88px] rounded-lg text-center text-sm font-bold border ${itemClass(
                    i,
                    isCurrent
                  )}`}
                >
                  €{amount.toFixed(2)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* BOTTOM label */}
      <div className="text-center -mt-1">
        <span className="text-xs font-extrabold tracking-widest text-gray-800">BANKED</span>
      </div>

      {/* BOTTOM (banked per step) */}
      <div className="w-full overflow-hidden relative bg-[url('/bg_bets.png')] bg-cover">
        <motion.div
          ref={botContentRef}
          className="flex gap-1 p-2 cursor-grab active:cursor-grabbing will-change-transform"
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
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`min-w-[88px] rounded-lg text-center text-sm font-bold border ${
                  amount > 0
                    ? "bg-blue-600 text-white"
                    : "bg-green-200 text-black"
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
