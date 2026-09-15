import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { TeamRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

/** Сколько живёт вход в админку без повторного ввода пароля. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionMember = {
  id: string;
  username: string;
  name: string;
  role: TeamRole;
};

export type IssuedSession = {
  token: string;
  expiresAt: Date;
  member: SessionMember;
};

const MEMBER_SELECTION = { id: true, username: true, name: true, role: true } as const;

export async function issueSession(member: SessionMember, now: Date = new Date()): Promise<IssuedSession> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  await db.session.create({
    data: { tokenHash: hashToken(token), memberId: member.id, expiresAt },
  });

  return { token, expiresAt, member };
}

/** null означает «токена нет, он протух или участника выключили». */
export async function readSession(token: string | null, now: Date = new Date()): Promise<SessionMember | null> {
  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, member: { select: { ...MEMBER_SELECTION, isActive: true } } },
  });

  if (!session || session.expiresAt <= now || !session.member.isActive) {
    return null;
  }

  const { id, username, name, role } = session.member;

  return { id, username, name, role };
}

export async function revokeSession(token: string | null): Promise<void> {
  if (!token) {
    return;
  }

  await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

/** Токен приходит заголовком Authorization: Bearer <токен>. */
export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");

  if (!header?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return header.slice("bearer ".length).trim() || null;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
