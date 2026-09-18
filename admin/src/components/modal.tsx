"use client";

import { useEffect, useRef } from "react";

import { CloseIcon } from "@/components/icons";

/**
 * Окно поверх страницы. Внутри нативный <dialog>: он сам уводит фокус внутрь,
 * закрывается по Escape и рисует затемнение, поэтому руками это не повторяем.
 */
export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;

    if (!element) {
      return;
    }

    if (open && !element.open) {
      element.showModal();
    }

    if (!open && element.open) {
      element.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      // Клик мимо карточки попадает в сам <dialog>: это затемнение вокруг неё.
      onClick={(event) => {
        if (event.target === dialog.current) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto h-fit max-h-[calc(100dvh-3rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-canvas p-0 text-ink backdrop:bg-black/70"
    >
      <div className="flex items-start justify-between gap-6 border-b border-line px-6 py-5">
        <div>
          <h2 className="font-display text-2xl leading-tight">{title}</h2>
          {description ? <p className="mt-1.5 text-sm text-ink-muted">{description}</p> : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <CloseIcon className="size-4.5" />
        </button>
      </div>

      <div className="px-6 py-6">{children}</div>
    </dialog>
  );
}
