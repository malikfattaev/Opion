"use client";

import { useEffect, useState, useTransition } from "react";

import { searchMediaFiles } from "@/app/(workspace)/media/actions";
import { CheckIcon, SearchIcon } from "@/components/icons";
import { Modal } from "@/components/modal";
import { EmptyState, inputClassName, PrimaryButton } from "@/components/ui";
import type { MediaFile } from "@/lib/api/media";
import { formatBytes } from "@/lib/money";

/**
 * Выбор уже загруженных фотографий. Окно открывается из карточки вещи,
 * поэтому список тянем при открытии: пока окно закрыто, он не нужен.
 */
export function MediaPicker({
  open,
  chosen,
  onClose,
  onPick,
}: {
  open: boolean;
  /** Ссылки, которые уже стоят в карточке: их отмечаем и не даём выбрать дважды. */
  chosen: readonly string[];
  onClose: () => void;
  onPick: (urls: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    // Ждём, пока перестанут печатать: иначе запрос уходит на каждую букву.
    const timer = setTimeout(() => {
      startLoading(async () => setFiles(await searchMediaFiles(query)));
    }, query === "" ? 0 : 400);

    return () => clearTimeout(timer);
  }, [open, query]);

  function close() {
    setSelected([]);
    setQuery("");
    onClose();
  }

  return (
    <Modal open={open} title="Медиа" size="wide" onClose={close}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-muted" />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          className={`${inputClassName} pl-11`}
        />
      </div>

      {files.length === 0 ? (
        <EmptyState>{isLoading ? "Ищем…" : query ? "Ничего не нашлось." : "Пока пусто."}</EmptyState>
      ) : (
        <ul className="mt-5 grid max-h-[50dvh] gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => {
            const isChosen = chosen.includes(file.url);
            const isSelected = selected.includes(file.url);

            return (
              <li key={file.id}>
                <button
                  type="button"
                  disabled={isChosen}
                  aria-label={file.name}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelected((current) =>
                      current.includes(file.url)
                        ? current.filter((url) => url !== file.url)
                        : [...current, file.url],
                    )
                  }
                  className={`block w-full overflow-hidden rounded-xl border text-left transition-colors disabled:opacity-40 ${
                    isSelected ? "border-ink" : "border-line hover:border-ink-muted"
                  }`}
                >
                  <span className="relative block aspect-square bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element -- файлы отдаёт API, оптимизатор их не обслуживает */}
                    <img src={file.url} alt="" loading="lazy" className="size-full object-cover" />

                    {isSelected || isChosen ? (
                      <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-accent text-accent-contrast">
                        <CheckIcon className="size-3.5" />
                      </span>
                    ) : null}
                  </span>

                  <span className="block px-3 py-2">
                    <span className="block truncate text-xs">{file.name}</span>
                    <span className="mt-0.5 block text-[0.7rem] text-ink-muted">
                      {isChosen ? "уже в карточке" : formatBytes(file.bytes)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex items-center gap-3">
        <PrimaryButton
          type="button"
          disabled={selected.length === 0}
          onClick={() => {
            onPick(selected);
            close();
          }}
        >
          {selected.length === 0 ? "Выберите фото" : `Добавить ${selected.length}`}
        </PrimaryButton>

        <button
          type="button"
          onClick={close}
          className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
        >
          Отмена
        </button>
      </div>
    </Modal>
  );
}
