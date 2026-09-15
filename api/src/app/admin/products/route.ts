import { fail, isUniqueViolation, ok, parseBody } from "@/lib/admin/respond";
import { createProduct, listProducts, UnknownReferenceError } from "@/lib/admin/products";
import { productCreateSchema } from "@/lib/admin/schema";
import { requireMember } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guarded = await requireMember(request);

  return guarded.ok ? ok({ products: await listProducts() }) : guarded.response;
}

export async function POST(request: Request) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const parsed = await parseBody(request, productCreateSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    return ok({ product: await createProduct(parsed.data) }, { status: 201 });
  } catch (error) {
    if (error instanceof UnknownReferenceError) {
      return fail(error.message, 422);
    }

    if (isUniqueViolation(error)) {
      return fail("Такой адрес уже занят.", 409);
    }

    console.error("Админка: не удалось создать вещь", error);

    return fail("Не получилось сохранить. Попробуйте ещё раз.", 500);
  }
}
