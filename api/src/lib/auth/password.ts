import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

// promisify выводит перегрузку без options, а параметры scrypt нам задавать нужно.
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
) => Promise<Buffer>;

// Без server-only: модуль состоит из чистой криптографии и нужен ещё и
// сидирующему скрипту, который выполняется обычным Node.

/**
 * Пароли команды хешируются scrypt из стандартной библиотеки: отдельной
 * зависимости не нужно, а стойкость к перебору даёт сама функция.
 *
 * Формат строки: scrypt$N$r$p$соль$хеш, параметры лежат рядом с хешем,
 * поэтому их можно поднять позже, не ломая старые пароли.
 */
const PARAMS = { N: 16384, r: 8, p: 1, keyLength: 64 } as const;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, PARAMS);

  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parse(stored);

  if (!parsed) {
    return false;
  }

  const key = await deriveKey(password, parsed.salt, parsed);

  return key.length === parsed.key.length && timingSafeEqual(key, parsed.key);
}

type StoredHash = { N: number; r: number; p: number; keyLength: number; salt: Buffer; key: Buffer };

function parse(stored: string): StoredHash | null {
  const [scheme, rawN, rawR, rawP, rawSalt, rawKey] = stored.split("$");

  if (scheme !== "scrypt" || !rawSalt || !rawKey) {
    return null;
  }

  const key = Buffer.from(rawKey, "base64url");

  return {
    N: Number(rawN),
    r: Number(rawR),
    p: Number(rawP),
    keyLength: key.length,
    salt: Buffer.from(rawSalt, "base64url"),
    key,
  };
}

async function deriveKey(
  password: string,
  salt: Buffer,
  { N, r, p, keyLength }: { N: number; r: number; p: number; keyLength: number },
): Promise<Buffer> {
  // Память scrypt считает как 128 * N * r, и по умолчанию Node ограничивает её
  // 32 МБ. При N = 16384 нужно чуть больше, поэтому задаём предел явно.
  return scrypt(password.normalize("NFKC"), salt, keyLength, { N, r, p, maxmem: 256 * N * r });
}
