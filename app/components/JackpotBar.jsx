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
import { computeBaseJackpotValues } from "../utils/jackpots";

/**
 * JackpotBar — shows two synchronized, draggable rows:
 * 1) Effective jackpot at each step
 * 2) Banked amounts per step
 *
 * Notes (refactor):
 * - De‑duplicated drag logic via <RowScroller/> subcomponent that shares the
 *   same motion value `x` and bounds across the two rows.
 * - Centralized value normalization and effective values calculation.
 * - Added small helpers and comments for readability.
 */
export default function JackpotBar({
  gridSize,
  worms,
  bet,
  jackpotValues: jackpotValuesProp,
  effectiveJackpotValues: effectiveJackpotValuesProp,
  bankValues,
  openedApples = 0,
  currency = "€", // allow overriding (e.g., "$")
}) {
  /* =========================
   * Derived counts
   * ========================= */
  const totalBoxes = gridSize * gridSize;
  const apples = Math.max(totalBoxes - worms, 0);

  /* =========================
   * Base jackpot values (fallback to compute)
   * ========================= */
  const baseJackpots = useMemo(() => {
    if (
      Array.isArray(jackpotValuesProp) &&
      jackpotValuesProp.length === apples
    ) {
      return jackpotValuesProp.map((v) => +v);
    }
    return computeBaseJackpotValues(bet, worms, gridSize).values;
  }, [bet, worms, gridSize, apples, jackpotValuesProp]);

  /* =========================
   * Banked values normalized to apples length
   * ========================= */
  const banked = useMemo(() => {
    if (!Array.isArray(bankValues)) return Array(apples).fill(0);
    return bankValues.slice(0, apples).map((v) => +(v || 0).toFixed(2));
  }, [bankValues, apples]);

  /* =========================
   * Effective jackpots (prop wins; else base - banked)
   * ========================= */
  const effective = useMemo(() => {
    if (
      Array.isArray(effectiveJackpotValuesProp) &&
      effectiveJackpotValuesProp.length === apples
    ) {
      return effectiveJackpotValuesProp.map((v) => +v);
    }
    return baseJackpots.map((val, i) =>
      Math.max(0, +(val - (banked[i] || 0)).toFixed(2))
    );
  }, [effectiveJackpotValuesProp, baseJackpots, banked, apples]);

  /* =========================
   * Shared drag state & bounds
   * ========================= */
  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });
  const wrapRef = useRef(null);
  const topRef = useRef(null);

  const recalcBounds = useCallback(() => {
    const wrap = wrapRef.current;
    const content = topRef.current; // width is the same for both rows
    if (!wrap || !content) return;

    const wrapW = wrap.clientWidth;
    const contentW = content.scrollWidth;

    if (contentW <= wrapW) {
      setBounds({ min: 0, max: 0 });
      x.set(0);
    } else {
      const min = wrapW - contentW; // negative
      setBounds({ min, max: 0 });
      const cur = x.get();
      if (cur > 0) x.set(0);
      if (cur < min) x.set(min);
    }
  }, [x]);

  useLayoutEffect(() => {
    recalcBounds();
  }, [recalcBounds, effective.length]);

  useEffect(() => {
    const onResize = () => recalcBounds();
    window.addEventListener("resize", onResize);
    const t = setTimeout(recalcBounds, 0);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [recalcBounds, effective.length, openedApples]);

  /* =========================
   * Item visuals
   * ========================= */
  const itemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  };

  const effClass = (i, current) =>
    current
      ? "text-[20px] bg-orange-500 text-white border-2 border-yellow-700"
      : "bg-black text-white text-[20px]";

  /* =========================
   * Reusable row scroller
   * ========================= */
  function RowScroller({ innerRef, children }) {
    return (
      <motion.div
        ref={innerRef}
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
        aria-roledescription="scrollbar"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md select-none">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-extrabold tracking-widest text-gray-800">
          JACKPOT
        </h2>
      </div>

      {/* TOP (effective jackpots) */}
      <div
        ref={wrapRef}
        className="w-full overflow-hidden relative bg-[url('/bets.png')] bg-cover"
      >
        <RowScroller innerRef={topRef}>
          <AnimatePresence initial={false}>
            {effective.map((amount, i) => {
              const isCurrent = i === Math.max(0, openedApples - 1);
              return (
                <motion.div
                  key={`eff-${i}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`min-w-[88px] rounded-lg text-center text-sm font-bold border ${effClass(
                    i,
                    isCurrent
                  )}`}
                >
                  {currency}
                  {amount.toFixed(2)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </RowScroller>
      </div>

      {/* BOTTOM label */}
      <div className="text-center -mt-1">
        <span className="text-xs font-extrabold tracking-widest text-gray-800">
          BANKED
        </span>
      </div>

      {/* BOTTOM (banked per step) */}
      <div className="w-full overflow-hidden relative bg-[url('/bg_bets.png')] bg-cover">
        <RowScroller>
          <AnimatePresence initial={false}>
            {banked.map((amount, i) => (
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
                {currency}
                {(amount || 0).toFixed(2)}
              </motion.div>
            ))}
          </AnimatePresence>
        </RowScroller>
      </div>
    </div>
  );
}
