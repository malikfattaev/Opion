import { Container } from "@/components/layout/container";

/** Шапка раздела: одинаковые отступы и типографика на всех внутренних страницах. */
export function PageIntro({ title, description }: { title: string; description?: string }) {
  return (
    <Container className="pt-14 pb-10">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-xl text-sm text-ink-muted">{description}</p> : null}
    </Container>
  );
}
