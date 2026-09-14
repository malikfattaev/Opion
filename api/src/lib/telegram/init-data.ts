import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { serverEnv } from "@/lib/env";

/**
 * Проверка подписи `initData`, которую мини-апп присылает вместе с заказом.
 *
 * Telegram подписывает данные ключом, производным от токена бота:
 *   secret = HMAC_SHA256(key: "WebAppData", data: botToken)
 *   hash   = HMAC_SHA256(key: secret, data: dataCheckString)
 *
 * Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

/** Подпись считается протухшей через сутки, столько же живёт сессия мини-аппа. */
const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

const telegramUserSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;

/** null означает «подпись не подтверждена»: заказ примем, но автора не укажем. */
export function verifyInitData(initData: string, now: Date = new Date()): TelegramUser | null {
  const botToken = serverEnv().TELEGRAM_BOT_TOKEN;

  if (!botToken || !initData) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    return null;
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = createHmac("sha256", secretKey).update(dataCheckString).digest();

  if (!isEqualHex(expectedHash, hash)) {
    return null;
  }

  const authDateSeconds = Number(params.get("auth_date"));

  if (!Number.isFinite(authDateSeconds)) {
    return null;
  }

  if ((now.getTime() - authDateSeconds * 1000) / 1000 > MAX_AUTH_AGE_SECONDS) {
    return null;
  }

  return parseUser(params.get("user"));
}

function parseUser(rawUser: string | null): TelegramUser | null {
  if (!rawUser) {
    return null;
  }

  try {
    const parsed = telegramUserSchema.safeParse(JSON.parse(rawUser));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Сравнение за постоянное время, чтобы не выдать подпись по таймингам. */
function isEqualHex(expected: Buffer, actualHex: string): boolean {
  const actual = Buffer.from(actualHex, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
