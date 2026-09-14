"use client";

import { useSyncExternalStore } from "react";

import { getServerSnapshot, getSnapshot, rememberToken, subscribe } from "./store";

export function useOrderTokens() {
  const { tokens, isReady } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { tokens, isReady, rememberToken };
}
