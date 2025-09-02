"use client";
import { useState } from "react";

export function useBalance(initialBalance = 10000, initialBet = 5) {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(initialBet);

  return { balance, setBalance, bet, setBet };
}