"use client";
import { useState } from "react";

/**
 * Simple balance & bet management hook.
 *
 * @param {number} initialBalance - Starting balance (default 10000)
 * @param {number} initialBet - Starting bet amount (default 5)
 * @returns {{
 *   balance: number,
 *   setBalance: Function,
 *   bet: number,
 *   setBet: Function
 * }}
 */
export function useBalance(initialBalance = 10000, initialBet = 5) {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(initialBet);

  return { balance, setBalance, bet, setBet };
}
