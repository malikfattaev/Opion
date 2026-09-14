import { cartLineKey, type CartLine } from "./types";

/**
 * Корзина живёт вне React, в модуле, синхронизированном с localStorage.
 * Компоненты подписываются на неё через useSyncExternalStore, поэтому не нужен
 * ни провайдер, ни чтение хранилища в эффекте. Побочный выигрыш: изменение
 * корзины в одной вкладке долетает до остальных.
 */

const STORAGE_KEY = "opion.cart.v1";
const MAX_QUANTITY = 20;

export type CartState = {
  lines: readonly CartLine[];
  /** false, пока localStorage не прочитан: на сервере и в первом рендере корзина неизвестна. */
  isReady: boolean;
};

const INITIAL_STATE: CartState = { lines: [], isReady: false };

let state: CartState = INITIAL_STATE;
let isHydrated = false;

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener("storage", handleExternalChange);
  }

  if (!isHydrated) {
    isHydrated = true;
    setState(readStoredLines(), { persist: false });
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener("storage", handleExternalChange);
    }
  };
}

export function getSnapshot(): CartState {
  return state;
}

/** На сервере корзины нет, и ссылка обязана быть постоянной между рендерами. */
export function getServerSnapshot(): CartState {
  return INITIAL_STATE;
}

export function addLine(line: Omit<CartLine, "quantity">, quantity = 1): void {
  const key = cartLineKey(line);
  const existing = state.lines.find((item) => cartLineKey(item) === key);

  setState(
    existing
      ? state.lines.map((item) =>
          cartLineKey(item) === key ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item,
        )
      : [...state.lines, { ...line, quantity: clampQuantity(quantity) }],
  );
}

export function setQuantity(key: string, quantity: number): void {
  setState(
    quantity <= 0
      ? state.lines.filter((item) => cartLineKey(item) !== key)
      : state.lines.map((item) =>
          cartLineKey(item) === key ? { ...item, quantity: clampQuantity(quantity) } : item,
        ),
  );
}

export function removeLine(key: string): void {
  setState(state.lines.filter((item) => cartLineKey(item) !== key));
}

export function clear(): void {
  setState([]);
}

function setState(lines: readonly CartLine[], { persist = true } = {}): void {
  state = { lines, isReady: true };

  if (persist) {
    writeStoredLines(lines);
  }

  for (const listener of listeners) {
    listener();
  }
}

function handleExternalChange(event: StorageEvent): void {
  if (event.key === STORAGE_KEY || event.key === null) {
    setState(readStoredLines(), { persist: false });
  }
}

function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.round(quantity), 1), MAX_QUANTITY);
}

function writeStoredLines(lines: readonly CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Приватный режим и переполненное хранилище не должны ронять витрину.
  }
}

/** Чужие или устаревшие данные в localStorage не должны ломать корзину. */
function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const line = value as Record<string, unknown>;

  return (
    typeof line.productSlug === "string" &&
    typeof line.name === "string" &&
    typeof line.size === "string" &&
    typeof line.price === "number" &&
    Number.isFinite(line.price) &&
    typeof line.quantity === "number" &&
    line.quantity > 0
  );
}
