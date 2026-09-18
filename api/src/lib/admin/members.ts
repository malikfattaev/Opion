import "server-only";

import type { TeamRole } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

import type { MemberCreate, MemberUpdate } from "./schema";

/** Участник команды без пароля: хеш наружу не выходит никогда. */
export type AdminMember = {
  id: string;
  username: string;
  name: string;
  role: TeamRole;
  isActive: boolean;
  createdAt: string;
};

const SELECTION = {
  id: true,
  username: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

export async function listMembers(): Promise<AdminMember[]> {
  const rows = await db.teamMember.findMany({ orderBy: { createdAt: "asc" }, select: SELECTION });

  return rows.map(toAdminMember);
}

export async function createMember(input: MemberCreate): Promise<AdminMember> {
  const row = await db.teamMember.create({
    data: {
      username: input.username,
      name: input.name,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    },
    select: SELECTION,
  });

  return toAdminMember(row);
}

export async function updateMember(id: string, input: MemberUpdate): Promise<AdminMember | null> {
  const existing = await db.teamMember.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    return null;
  }

  const row = await db.teamMember.update({
    where: { id },
    data: {
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.role === undefined ? {} : { role: input.role }),
      ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
      ...(input.password === undefined ? {} : { passwordHash: await hashPassword(input.password) }),
    },
    select: SELECTION,
  });

  // Смена пароля или отключение доступа должны выкидывать человека отовсюду.
  if (input.password !== undefined || input.isActive === false) {
    await db.session.deleteMany({ where: { memberId: id } });
  }

  return toAdminMember(row);
}

export async function deleteMember(id: string): Promise<boolean> {
  const { count } = await db.teamMember.deleteMany({ where: { id } });

  return count > 0;
}

/** Владелец должен остаться хотя бы один, иначе управлять командой станет некому. */
export async function isLastOwner(id: string): Promise<boolean> {
  const member = await db.teamMember.findUnique({ where: { id }, select: { role: true } });

  if (member?.role !== "OWNER") {
    return false;
  }

  return (await db.teamMember.count({ where: { role: "OWNER" } })) <= 1;
}

type MemberRow = {
  id: string;
  username: string;
  name: string;
  role: TeamRole;
  isActive: boolean;
  createdAt: Date;
};

function toAdminMember(row: MemberRow): AdminMember {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
