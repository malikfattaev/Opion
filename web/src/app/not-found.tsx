import Link from "next/link";

import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="text-xs tracking-widest text-ink-muted uppercase">404</p>
      <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">Страница не найдена</h1>
      <p className="mt-4 text-sm text-ink-muted">Возможно, вещь уже разобрали или ссылка устарела.</p>
      <Link
        href="/catalog"
        className="mt-10 inline-block bg-accent px-8 py-3 text-sm text-accent-contrast transition-opacity hover:opacity-90"
      >
        Перейти в каталог
      </Link>
    </Container>
  );
}
