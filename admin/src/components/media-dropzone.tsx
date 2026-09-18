"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadMediaFile } from "@/app/(workspace)/media/actions";
import { ErrorText } from "@/components/ui";
import type { MediaFile } from "@/lib/api/media";

/**
 * Приём файлов: перетаскиванием, из буфера обмена или кнопкой. Файл уходит
 * в API, тот жмёт его в webp и кладёт в хранилище.
 */
export function MediaDropzone({ onUploaded }: { onUploaded?: (file: MediaFile) => void }) {
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const [isOver, setOver] = useState(false);
  const [pending, setPending] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(files: readonly File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));

    if (images.length === 0) {
      return;
    }

    setMessage(null);
    setPending(images.length);

    // По одному файлу за раз: так понятно, на каком остановились при ошибке.
    for (const [index, file] of images.entries()) {
      setPending(images.length - index);

      try {
        const result = await uploadMediaFile(toFormData(file));

        if (!result.ok) {
          setMessage(result.message);
          break;
        }

        onUploaded?.(result.file);
      } catch {
        // Сюда попадаем, например, когда файл не пролез по размеру.
        setMessage(`Не получилось загрузить «${file.name}».`);
        break;
      }
    }

    setPending(0);
    router.refresh();

    if (picker.current) {
      picker.current.value = "";
    }
  }

  // Скриншот удобнее вставить прямо из буфера, чем сначала сохранять файлом.
  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const files = [...(event.clipboardData?.files ?? [])];

      if (files.length > 0) {
        void upload(files);
      }
    }

    window.addEventListener("paste", onPaste);

    return () => window.removeEventListener("paste", onPaste);
  });

  const isBusy = pending > 0;

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void upload([...event.dataTransfer.files]);
        }}
        className={`flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
          isOver ? "border-ink bg-surface/60" : "border-line"
        }`}
      >
        <p className="text-sm text-ink">Перетащите файлы сюда или вставьте из буфера</p>
        <p className="text-xs text-ink-muted">Картинки до 10 МБ, сохраняем в webp</p>

        <button
          type="button"
          onClick={() => picker.current?.click()}
          disabled={isBusy}
          className="mt-3 rounded-full border border-line px-5 py-2 text-sm text-ink transition-colors hover:border-ink-muted disabled:opacity-40"
        >
          {isBusy ? `Грузим… осталось ${pending}` : "Выбрать файлы"}
        </button>
      </div>

      <input
        ref={picker}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void upload([...(event.target.files ?? [])])}
      />

      <div className="mt-3">
        <ErrorText>{message}</ErrorText>
      </div>
    </div>
  );
}

function toFormData(file: File): FormData {
  const data = new FormData();
  data.set("file", file);

  return data;
}
