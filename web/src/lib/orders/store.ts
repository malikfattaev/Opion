/**
 * Профиля на сайте нет, поэтому пропуска к своим заказам покупатель хранит сам:
 * при оформлении API выдаёт токен, и он остаётся в браузере. Устройство сменил
 * или почистил историю - заказы придётся спрашивать у нас.
 *
 * Хранилище устроено как корзина: модуль вне React плюс useSyncExternalStore,
 * поэтому вкладки остаются согласованными и не нужен провайдер.
 */

const STORAGE_KEY = "opion.orders.v1";
const MAX_TOKENS = 50;

export type OrderTokensState = {
  tokens: readonly string[];
  /** false, пока localStorage не прочитан. */
  isReady: boolean;
};

const INITIAL_STATE: OrderTokensState = { tokens: [], isReady: false };

let state: OrderTokensState = INITIAL_STATE;
let isHydrated = false;

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener("storage", handleExternalChange);
  }

  if (!isHydrated) {
    isHydrated = true;
    setState(readStoredTokens(), { persist: false });
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener("storage", handleExternalChange);
    }
  };
}

export function getSnapshot(): OrderTokensState {
  return state;
}

/** На сервере токенов нет, и ссылка обязана быть постоянной между рендерами. */
export function getServerSnapshot(): OrderTokensState {
  return INITIAL_STATE;
}

/** Новый заказ встаёт первым: история показывается от свежих к старым. */
export function rememberToken(token: string): void {
  const stored = isHydrated ? state.tokens : readStoredTokens();

  setState([token, ...stored.filter((item) => item !== token)].slice(0, MAX_TOKENS));
  isHydrated = true;
}

function setState(tokens: readonly string[], { persist = true } = {}): void {
  state = { tokens, isReady: true };

  if (persist) {
    writeStoredTokens(tokens);
  }

  for (const listener of listeners) {
    listener();
  }
}

function handleExternalChange(event: StorageEvent): void {
  if (event.key === STORAGE_KEY || event.key === null) {
    setState(readStoredTokens(), { persist: false });
  }
}

function writeStoredTokens(tokens: readonly string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Приватный режим и переполненное хранилище не должны ронять оформление.
  }
}

function readStoredTokens(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
