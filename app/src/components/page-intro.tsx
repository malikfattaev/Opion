import { PageTitle } from "@/components/page-title";

/** Заголовок и вводный абзац информационных разделов. */
export function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-5">
      <PageTitle>{title}</PageTitle>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{description}</p>
    </div>
  );
}
