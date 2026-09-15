import { fail, ok, parseBody } from "@/lib/admin/respond";
import { credentialsSchema } from "@/lib/admin/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { issueSession, readBearerToken, revokeSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Вход в админку. Пароль сверяется здесь, а токен хранит сервер админки
 * у себя в cookie, поэтому в браузер он не попадает.
 */
export async function POST(request: Request) {
  const parsed = await parseBody(request, credentialsSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  const member = await db.teamMember.findUnique({
    where: { username: parsed.data.username },
    select: { id: true, username: true, name: true, role: true, isActive: true, passwordHash: true },
  });

  // Хеш считаем даже для несуществующего логина: иначе по времени ответа
  // видно, какие логины заведены.
  const passwordHash = member?.passwordHash ?? (await decoyHash());
  const isValid = await verifyPassword(parsed.data.password, passwordHash);

  if (!member || !member.isActive || !isValid) {
    return fail("Неверный логин или пароль.", 401);
  }

  return ok(
    await issueSession({ id: member.id, username: member.username, name: member.name, role: member.role }),
  );
}

/** Выход: токен перестаёт действовать сразу, а не когда истечёт. */
export async function DELETE(request: Request) {
  await revokeSession(readBearerToken(request));

  return new Response(null, { status: 204 });
}

let decoy: Promise<string> | undefined;

function decoyHash(): Promise<string> {
  decoy ??= hashPassword("несуществующий пароль");

  return decoy;
}
