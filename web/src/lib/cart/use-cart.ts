"use client";

import { useSyncExternalStore } from "react";

import { addLine, clear, getServerSnapshot, getSnapshot, removeLine, setQuantity, subscribe } from "./store";

export function useCart() {
  const { lines, isReady } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    lines,
    isReady,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalMinor: lines.reduce((sum, line) => sum + line.priceMinor * line.quantity, 0),
    addLine,
    setQuantity,
    removeLine,
    clear,
  };
}
