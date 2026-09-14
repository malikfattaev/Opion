"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import type { TelegramHapticStyle, TelegramProfile, TelegramWebApp } from "./types";

/**
 * Скрипт Telegram грузится отдельно от React, поэтому объект появляется не сразу.
 * Подписываемся на его появление, а не читаем один раз при монтировании.
 */
const listeners = new Set<() => void>();
let cached: TelegramWebApp | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function readWebApp(): TelegramWebApp | null {
  return typeof window === "undefined" ? null : (window.Telegram?.WebApp ?? null);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (!cached && pollTimer === null) {
    pollTimer = setInterval(() => {
      const webApp = readWebApp();

      if (!webApp) {
        return;
      }

      cached = webApp;
      clearInterval(pollTimer!);
      pollTimer = null;

      for (const notify of listeners) {
        notify();
      }
    }, 50);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };
}

function getSnapshot(): TelegramWebApp | null {
  cached ??= readWebApp();

  return cached;
}

function getServerSnapshot(): TelegramWebApp | null {
  return null;
}

export function useTelegram(): TelegramWebApp | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Профиль для показа: имя и аватар. Подписью он не защищён, поэтому решения
 * на его основе принимает только интерфейс, но не API.
 */
export function useTelegramProfile(): TelegramProfile | null {
  return useTelegram()?.initDataUnsafe?.user ?? null;
}

/** Короткий отклик на нажатие: в вебвью это заметно приятнее, чем без него. */
export function haptic(style: TelegramHapticStyle = "light"): void {
  readWebApp()?.HapticFeedback?.impactOccurred(style);
}

export function hapticSuccess(): void {
  readWebApp()?.HapticFeedback?.notificationOccurred("success");
}

/**
 * Системная кнопка «назад» в шапке Telegram. Показываем её везде, кроме каталога,
 * чтобы не дублировать навигацию своими стрелками внутри экрана.
 */
export function useBackButton(): void {
  const webApp = useTelegram();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!webApp) {
      return;
    }

    const isRoot = pathname === "/";
    const handleClick = () => router.back();

    if (isRoot) {
      webApp.BackButton.hide();

      return;
    }

    webApp.BackButton.onClick(handleClick);
    webApp.BackButton.show();

    return () => {
      webApp.BackButton.offClick(handleClick);
      webApp.BackButton.hide();
    };
  }, [webApp, pathname, router]);
}
