import type { Metadata } from "next";
import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import { TelegramProfileCard } from "@/components/telegram-profile";
import { appConfig, moreLinks } from "@/config/site";

export const metadata: Metadata = { title: "Меню" };

export default function MenuPage() {
  return (
    <div className="px-5 pt-2">
      <h1 className="sr-only">Меню</h1>

      <TelegramProfileCard />

      <nav aria-label="Разделы" className="mt-8">
        <ul className="overflow-hidden rounded-2xl border border-line">
          {moreLinks.map((link, index) => (
            <li key={link.href} className={index === 0 ? "" : "border-t border-line"}>
              <Link href={link.href} className="flex items-center gap-4 px-4 py-4 active:bg-surface">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{link.description}</span>
                </span>

                <ChevronRightIcon className="size-4 shrink-0 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-10 text-center text-xs tracking-widest text-ink-muted uppercase">
        {appConfig.wordmark}, Ташкент
      </p>
    </div>
  );
}
