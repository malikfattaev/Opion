"use client";

import { useRef, useState } from "react";

import { uploadMediaFile } from "@/app/(workspace)/media/actions";
import { CloseIcon, ImageIcon, PlusIcon } from "@/components/icons";
import { MediaPicker } from "@/components/media-picker";
import { ErrorText } from "@/components/ui";

/**
 * Фотографии вещи. Файл уходит в API, тот сжимает его в webp, кладёт
 * в хранилище и заводит карточку в разделе «Медиа», откуда то же фото
 * можно взять для другой вещи. В форму ссылки попадают скрытыми полями,
 * поэтому сохранять их умеет то же действие.
 */
export function ImageUploader({ images = [] }: { images?: readonly { url: string }[] }) {
  const [urls, setUrls] = useState<string[]>(() => images.map((image) => image.url));
  const [isUploading, setUploading] = useState(false);
  const [isPicking, setPicking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);

  /** Одно и то же фото в карточке дважды не нужно. */
  function append(added: readonly string[]) {
    setUrls((current) => [...current, ...added.filter((url) => !current.includes(url))]);
  }

  async function add(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setMessage(null);

    // По одному файлу за раз: так понятно, на каком остановились при ошибке.
    for (const file of files) {
      const data = new FormData();
      data.set("file", file);

      try {
        const result = await uploadMediaFile(data);

        if (!result.ok) {
          setMessage(result.message);
          break;
        }

        append([result.file.url]);
      } catch {
        // Сюда попадаем, например, когда файл не пролез по размеру.
        setMessage(`Не получилось загрузить «${file.name}».`);
        break;
      }
    }

    setUploading(false);

    if (picker.current) {
      picker.current.value = "";
    }
  }

  return (
    <div>
      {urls.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      <div className="flex flex-wrap gap-3">
        {urls.map((url, index) => (
          <figure key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- файлы отдаёт API, оптимизатор их не обслуживает */}
            <img src={url} alt="" className="size-28 rounded-xl border border-line object-cover" />

            <button
              type="button"
              onClick={() => setUrls((current) => current.filter((item) => item !== url))}
              aria-label="Убрать фото"
              className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border border-line bg-canvas text-ink-muted transition-colors hover:text-danger"
            >
              <CloseIcon className="size-3.5" />
            </button>

            {index === 0 ? (
              <figcaption className="absolute inset-x-0 bottom-0 rounded-b-xl bg-canvas/80 py-1 text-center text-[0.65rem] tracking-widest text-ink-muted uppercase">
                обложка
              </figcaption>
            ) : null}
          </figure>
        ))}

        <Tile onClick={() => picker.current?.click()} disabled={isUploading}>
          <PlusIcon className="size-5" />
          {isUploading ? "Грузим…" : "Загрузить"}
        </Tile>

        <Tile onClick={() => setPicking(true)}>
          <ImageIcon className="size-5" />
          Из медиа
        </Tile>
      </div>

      <input
        ref={picker}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void add(event.target.files)}
      />

      <div className="mt-3">
        <ErrorText>{message}</ErrorText>
      </div>

      <MediaPicker open={isPicking} chosen={urls} onClose={() => setPicking(false)} onPick={append} />
    </div>
  );
}

function Tile({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
      className="flex size-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line text-xs text-ink-muted transition-colors hover:border-ink-muted hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
