"use client";

import Link from "next/link";
import { useActionState } from "react";

import { removeProduct, type ProductFormState } from "@/app/(workspace)/products/actions";
import { ErrorText } from "@/components/ui";

const INITIAL: ProductFormState = { message: null };

export function ProductRowActions({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(removeProduct, INITIAL);

  return (
    <div className="flex items-center gap-4">
      <ErrorText>{state.message}</ErrorText>

      <Link href={`/products/${id}`} className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink">
        Изменить
      </Link>

      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={isPending}
          className="text-xs text-ink-muted underline underline-offset-4 hover:text-danger disabled:opacity-40"
        >
          Удалить
        </button>
      </form>
    </div>
  );
}
