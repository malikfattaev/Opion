/** Заголовок экрана. Один размер и отступы на весь мини-апп, чтобы не разъезжалось. */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="font-display text-3xl leading-tight">{children}</h1>;
}
