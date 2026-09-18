"use client";

import { useEffect, useRef } from "react";

import { CloseIcon } from "@/components/icons";

/** Ширины пишем целиком: Tailwind собирает классы по тексту исходника. */
const WIDTHS = {
  form: "w-[min(34rem,calc(100vw-2rem))]",
  wide: "w-[min(56rem,calc(100vw-2rem))]",
} as const;

/**
 * Окно поверх страницы. Внутри нативный <dialog>: он сам уводит фокус внутрь,
 * закрывается по Escape и рисует затемнение, поэтому руками это не повторяем.
 */
export function Modal({
  open,
  title,
  size = "form",
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  /** Форме хватает колонки, галерее нужна вся ширина экрана. */
  size?: "form" | "wide";
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
      className={`fixed inset-0 m-auto h-fit max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-2xl border border-line bg-canvas p-0 text-ink backdrop:bg-black/70 ${WIDTHS[size]}`}
    >
      <div className="flex items-center justify-between gap-6 border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl leading-tight">{title}</h2>

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
