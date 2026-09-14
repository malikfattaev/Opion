"use client";

import { useEffect } from "react";

import { useBackButton, useTelegram } from "./use-telegram";

/** Цвет шапки и фона внутри Telegram: чтобы мини-апп не светился белым по краям. */
const CANVAS = "#000000";

export function TelegramBootstrap() {
  const webApp = useTelegram();

  useBackButton();

  useEffect(() => {
    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();

    // Свайп вниз закрывает мини-апп прямо посреди прокрутки: выключаем.
    webApp.disableVerticalSwipes?.();
    webApp.setHeaderColor?.(CANVAS);
    webApp.setBackgroundColor?.(CANVAS);
  }, [webApp]);

  return null;
}
