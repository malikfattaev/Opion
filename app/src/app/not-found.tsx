import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-5 pt-24 text-center">
      <p className="font-display text-3xl">Не найдено</p>
      <p className="mt-2 text-sm text-ink-muted">Возможно, вещь уже разобрали.</p>
      <Link href="/" className="mt-6 rounded-full bg-accent px-8 py-3 text-sm text-accent-contrast">
        В каталог
      </Link>
    </div>
  );
}
