import Link from "next/link";

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
      <span className="text-xs tracking-widest text-ink-muted uppercase">
        {label}
        {hint ? <span className="ml-2 normal-case tracking-normal">({hint})</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClassName =
  "w-full rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line p-6 ${className}`}>{children}</div>;
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
