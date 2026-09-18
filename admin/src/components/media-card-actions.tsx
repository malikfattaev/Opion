"use client";

import { useActionState, useState } from "react";

import { removeMediaFile, type MediaFormState } from "@/app/(workspace)/media/actions";
import { CheckIcon, CopyIcon, TrashIcon } from "@/components/icons";
import { ErrorText, IconButton } from "@/components/ui";
import type { MediaFile } from "@/lib/api/media";

const INITIAL: MediaFormState = { message: null };

/** Что можно сделать с файлом: забрать ссылку или убрать его из хранилища. */
export function MediaCardActions({ file }: { file: MediaFile }) {
  const [state, formAction, isPending] = useActionState(removeMediaFile, INITIAL);

  return (
    <div className="flex items-center justify-between gap-2">
      <ErrorText>{state.message}</ErrorText>

      <div className="ml-auto flex items-center">
        <CopyLink url={file.url} />

        <form action={formAction}>
          <input type="hidden" name="id" value={file.id} />

          <IconButton
            label="Удалить"
            type="submit"
            tone="danger"
            disabled={isPending}
            // Файл уходит из хранилища насовсем, кнопка стоит рядом с копированием.
            onClick={(event) => {
              if (!window.confirm(`Удалить «${file.name}»?`)) {
                event.preventDefault();
              }
            }}
          >
            <TrashIcon className="size-4" />
          </IconButton>
        </form>
      </div>
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  const [isCopied, setCopied] = useState(false);

  return (
    <IconButton
      label={isCopied ? "Ссылка скопирована" : "Скопировать ссылку"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Браузер может не дать доступ к буферу: тогда ссылку просто не копируем.
        }
      }}
    >
      {isCopied ? <CheckIcon className="size-4 text-success" /> : <CopyIcon className="size-4" />}
    </IconButton>
  );
}
