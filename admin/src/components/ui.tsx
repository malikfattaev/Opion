import Link from "next/link";

import { ChevronDownIcon } from "@/components/icons";

/** Мелкие кирпичики интерфейса: одинаковые поля, кнопки и карточки во всех разделах. */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-widest text-ink-muted uppercase">{label}</span>
      {hint ? <span className="mt-1 block text-xs text-ink-muted/80">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClassName =
  "w-full rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none";

/** Шапка раздела: название и главное действие справа. */
export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pt-10 pb-8">
      <h1 className="font-display text-4xl leading-tight">{title}</h1>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Выпадающий список. Системную стрелку убираем: в тёмной теме она чужая
 * и жмётся к самому краю поля.
 */
export function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select {...props} className={`${inputClassName} appearance-none pr-11 ${className}`} />

      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-muted" />
    </span>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-full bg-accent px-6 py-2.5 text-sm text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-line px-6 py-2.5 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  return children ? <p className="text-sm text-danger">{children}</p> : null;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-12 text-center text-sm text-ink-muted">{children}</p>;
}
