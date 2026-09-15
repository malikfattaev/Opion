import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";

import { apiUrl } from "@/lib/env";

/**
 * Токен сессии живёт в HttpOnly-cookie на домене админки, а к API уходит
 * заголовком с сервера. В браузер он не попадает никогда.
 */
const COOKIE_NAME = "opion_admin_session";

export const memberSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  role: z.enum(["OWNER", "MANAGER"]),
});

export type Member = z.infer<typeof memberSchema>;

const sessionSchema = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime(),
  member: memberSchema,
});

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function signIn(username: string, password: string): Promise<SignInResult> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl()}/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "Сервис недоступен. Попробуйте ещё раз." };
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, message: readMessage(payload) ?? "Не получилось войти." };
  }

  const parsed = sessionSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false, message: "API ответил неожиданно." };
  }

  const store = await cookies();

  store.set(COOKIE_NAME, parsed.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(parsed.data.expiresAt),
  });

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    // Токен гасим и на стороне API: иначе он останется годным до срока.
    await fetch(`${apiUrl()}/admin/session`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => null);
  }

  store.delete(COOKIE_NAME);
}

export async function sessionToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

function readMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const message = (payload as Record<string, unknown>).message;

  return typeof message === "string" ? message : null;
}
