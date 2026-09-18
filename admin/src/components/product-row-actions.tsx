"use client";

import { useActionState } from "react";

import { removeProduct, type ProductFormState } from "@/app/(workspace)/products/actions";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { ErrorText, IconButton, IconLink } from "@/components/ui";

const INITIAL: ProductFormState = { message: null };

export function ProductRowActions({ id, name }: { id: string; name: string }) {
  const [state, formAction, isPending] = useActionState(removeProduct, INITIAL);

  return (
    <div className="flex items-center justify-end gap-1">
      <ErrorText>{state.message}</ErrorText>

      <IconLink href={`/products/${id}`} label="Изменить">
        <PencilIcon className="size-4" />
      </IconLink>

      <form action={formAction}>
        <input type="hidden" name="id" value={id} />

        <IconButton
          label="Удалить"
          type="submit"
          tone="danger"
          disabled={isPending}
          // Удаление необратимо, а строки в таблице стоят вплотную: переспрашиваем.
          onClick={(event) => {
            if (!window.confirm(`Удалить «${name}» из каталога?`)) {
              event.preventDefault();
            }
          }}
        >
          <TrashIcon className="size-4" />
        </IconButton>
      </form>
    </div>
  );
}
