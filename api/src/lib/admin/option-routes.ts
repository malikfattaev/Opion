import "server-only";

import { requireMember } from "@/lib/auth/guard";

import { createOption, deleteOption, listOptions, updateOption, type OptionKind } from "./options";
import { fail, isForeignKeyViolation, isUniqueViolation, notFound, ok, parseBody } from "./respond";
import { optionCreateSchema, optionUpdateSchema } from "./schema";

/**
 * Разделы «Типы» и «Стили» отличаются только таблицей, поэтому обработчики
 * собираются здесь, а сами маршруты остаются в две строки.
 */
export function optionListRoutes(kind: OptionKind) {
  return {
    async GET(request: Request) {
      const guarded = await requireMember(request);

      return guarded.ok ? ok({ options: await listOptions(kind) }) : guarded.response;
    },

    async POST(request: Request) {
      const guarded = await requireMember(request);

      if (!guarded.ok) {
        return guarded.response;
      }

      const parsed = await parseBody(request, optionCreateSchema);

      if (!parsed.ok) {
        return parsed.response;
      }

      try {
        return ok({ option: await createOption(kind, parsed.data) }, { status: 201 });
      } catch (error) {
        return isUniqueViolation(error) ? fail("Такой адрес уже занят.", 409) : unexpected(error);
      }
    },
  };
}

export function optionItemRoutes(kind: OptionKind) {
  return {
    async PATCH(request: Request, id: string) {
      const guarded = await requireMember(request);

      if (!guarded.ok) {
        return guarded.response;
      }

      const parsed = await parseBody(request, optionUpdateSchema);

      if (!parsed.ok) {
        return parsed.response;
      }

      try {
        const option = await updateOption(kind, id, parsed.data);

        return option ? ok({ option }) : notFound();
      } catch (error) {
        return isUniqueViolation(error) ? fail("Такой адрес уже занят.", 409) : unexpected(error);
      }
    },

    async DELETE(request: Request, id: string) {
      const guarded = await requireMember(request);

      if (!guarded.ok) {
        return guarded.response;
      }

      try {
        return (await deleteOption(kind, id)) ? new Response(null, { status: 204 }) : notFound();
      } catch (error) {
        return isForeignKeyViolation(error)
          ? fail("Сначала перенесите вещи, которые на это ссылаются.", 409)
          : unexpected(error);
      }
    },
  };
}

function unexpected(error: unknown): Response {
  console.error("Админка: неожиданная ошибка", error);

  return fail("Не получилось сохранить. Попробуйте ещё раз.", 500);
}
