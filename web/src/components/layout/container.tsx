import type { ReactNode } from "react";

/** Единая ширина контента: правки полей делаются в одном месте, а не в каждой секции. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`.trim()}>{children}</div>;
}
