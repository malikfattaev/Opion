import type { Metadata } from "next";

import { MediaCardActions } from "@/components/media-card-actions";
import { MediaDropzone } from "@/components/media-dropzone";
import { MediaFilters } from "@/components/media-filters";
import { EmptyState, PageHeader } from "@/components/ui";
import { mediaSort } from "@/config/site";
import { readMedia, type MediaFile } from "@/lib/api/media";
import { formatBytes, formatDate, formatNumber } from "@/lib/money";

export const metadata: Metadata = { title: "Медиа" };

export default async function MediaPage({ searchParams }: PageProps<"/media">) {
  const params = await searchParams;
  const query = first(params.q);
  const sort = mediaSort(first(params.sort));
  const { items, stats } = await readMedia(query, sort);

  return (
    <>
      <PageHeader title="Медиа" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Файлов" value={formatNumber(stats.files)} />
        <Stat label="В карточках" value={formatNumber(stats.used)} />
        <Stat label="Объём" value={formatBytes(stats.bytes)} />
      </div>

      <div className="mt-6">
        <MediaDropzone />
      </div>

      <div className="mt-8">
        <MediaFilters query={query} sort={sort} />
      </div>

      {items.length === 0 ? (
        <EmptyState>{query ? "Ничего не нашлось." : "Пока пусто."}</EmptyState>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((file) => (
            <li key={file.id} className="overflow-hidden rounded-2xl border border-line">
              <Preview file={file} />

              <div className="px-4 py-3">
                <p className="truncate text-sm" title={file.name}>
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-ink-muted">
                  {formatBytes(file.bytes)}
                  {file.width && file.height ? ` · ${file.width}×${file.height}` : ""} ·{" "}
                  {formatDate(file.createdAt)}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Usage count={file.usedBy} />

                  <MediaCardActions file={file} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line px-5 py-4">
      <p className="text-xs tracking-widest text-ink-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl leading-none">{value}</p>
    </div>
  );
}

function Preview({ file }: { file: MediaFile }) {
  return (
    <div className="aspect-square border-b border-line bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element -- файлы отдаёт API, оптимизатор их не обслуживает */}
      <img src={file.url} alt={file.name} loading="lazy" className="size-full object-cover" />
    </div>
  );
}

/** Занятый файл удалять нельзя, поэтому видно сразу, стоит он где-то или нет. */
function Usage({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-2 text-xs whitespace-nowrap text-ink-muted">
      <span aria-hidden className={`size-1.5 rounded-full ${count > 0 ? "bg-success" : "bg-ink-muted/50"}`} />
      {usageLabel(count)}
    </span>
  );
}

function usageLabel(count: number): string {
  if (count === 0) {
    return "не используется";
  }

  return count === 1 ? "в одной карточке" : `в ${count} карточках`;
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? (value[0] ?? "") : (value ?? "")).trim();
}
