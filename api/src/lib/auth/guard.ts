import "server-only";

import { TeamRole } from "@/generated/prisma/enums";

import { readBearerToken, readSession, type SessionMember } from "./session";

export type Guarded = { ok: true; member: SessionMember } | { ok: false; response: Response };

/**
 * Пропускает дальше только живую сессию участника команды. Админка ходит
 * в API со своего сервера, поэтому токен передаётся заголовком, а не cookie.
 */
export async function requireMember(request: Request): Promise<Guarded> {
  const member = await readSession(readBearerToken(request));

  if (!member) {
    return { ok: false, response: Response.json({ message: "Нужен вход." }, { status: 401 }) };
  }

  return { ok: true, member };
}

/** Команду правит только владелец: менеджер не должен заводить себе коллег. */
export async function requireOwner(request: Request): Promise<Guarded> {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded;
  }

  if (guarded.member.role !== TeamRole.OWNER) {
    return { ok: false, response: Response.json({ message: "Недостаточно прав." }, { status: 403 }) };
  }

  return guarded;
}
