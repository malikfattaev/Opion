import Link from "next/link";

import { Container } from "@/components/layout/container";
import { footerNavigation, mainNavigation, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <p className="max-w-xs text-sm text-ink-muted">{siteConfig.description}</p>

          <div className="flex gap-12">
            <FooterColumn title="Магазин" items={mainNavigation} />
            <FooterColumn title="Покупателям" items={footerNavigation} />
          </div>
        </div>

        <p className="mt-12 text-xs text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs tracking-widest text-ink-muted uppercase">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-ink transition-colors hover:text-ink-muted">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
