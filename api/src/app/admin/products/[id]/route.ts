import { fail, notFound, ok, parseBody } from "@/lib/admin/respond";
import {
  deleteProduct,
  duplicateProductMessage,
  findProduct,
  updateProduct,
  UnknownReferenceError,
} from "@/lib/admin/products";
import { productUpdateSchema } from "@/lib/admin/schema";
import { requireMember } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteContext<"/admin/products/[id]">) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const product = await findProduct((await params).id);

  return product ? ok({ product }) : notFound();
}

export async function PATCH(request: Request, { params }: RouteContext<"/admin/products/[id]">) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  const parsed = await parseBody(request, productUpdateSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const product = await updateProduct((await params).id, parsed.data);

    return product ? ok({ product }) : notFound();
  } catch (error) {
    if (error instanceof UnknownReferenceError) {
      return fail(error.message, 422);
    }

    const duplicate = duplicateProductMessage(error);

    if (duplicate) {
      return fail(duplicate, 409);
    }

    console.error("Админка: не удалось сохранить вещь", error);

    return fail("Не получилось сохранить. Попробуйте ещё раз.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext<"/admin/products/[id]">) {
  const guarded = await requireMember(request);

  if (!guarded.ok) {
    return guarded.response;
  }

  return (await deleteProduct((await params).id)) ? new Response(null, { status: 204 }) : notFound();
}
