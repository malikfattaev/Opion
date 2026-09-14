/**
 * Минимальный срез Telegram WebApp API: только то, чем пользуется мини-апп.
 * Документация: https://core.telegram.org/bots/webapps#initializing-mini-apps
 */
export type TelegramHapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

/** Профиль покупателя из Telegram. Не подписан, поэтому годится только для показа. */
export type TelegramProfile = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: TelegramProfile };
  version: string;
  colorScheme: "light" | "dark";
  ready: () => void;
  expand: () => void;
  close: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  isVersionAtLeast?: (version: string) => boolean;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (handler: () => void) => void;
    offClick: (handler: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: TelegramHapticStyle) => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
