/** Заголовок и вводный абзац информационных разделов. */
export function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-5">
      <h1 className="font-display text-3xl leading-tight">{title}</h1>
      <p className="mt-3 text-sm text-ink-muted">{description}</p>
    </div>
  );
}
