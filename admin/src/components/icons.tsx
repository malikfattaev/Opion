/** Иконки разделов. Рисуем в коде: одна линия, один размер, без внешних файлов. */

type IconProps = { className?: string };

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function TagIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5a1 1 0 0 1 .7.3l7.5 7.5a1 1 0 0 1 0 1.4l-8.5 8.5a1 1 0 0 1-1.4 0L3.3 13.2a1 1 0 0 1-.3-.7Z" />
      <circle cx="7.5" cy="7.5" r="1.25" />
    </svg>
  );
}

export function LayersIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M12 3c.6 4.2 1.8 6 6 6.5-4.2.6-5.4 2.3-6 6.5-.6-4.2-1.8-5.9-6-6.5 4.2-.5 5.4-2.3 6-6.5Z" />
      <path d="M18 16.5c.3 2 .9 2.8 2.8 3.1-1.9.3-2.5 1.1-2.8 3.1" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
