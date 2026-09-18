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

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8.5 6.5 12 10 15.5" />
      <path d="M6.5 12H15" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function GaugeIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4 18a8.5 8.5 0 1 1 16 0" />
      <path d="m12 14 4-4" />
      <circle cx="12" cy="18" r="1.25" />
    </svg>
  );
}

export function WalletIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h11a2 2 0 0 1 2 2" />
      <rect x="3.5" y="7.5" width="17" height="11.5" rx="2" />
      <path d="M20.5 11.5h-3.25a1.75 1.75 0 0 0 0 3.5h3.25" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 20v-6M13 20V9M18 20v-9.5" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <circle cx="9.5" cy="8.5" r="3.5" />
      <path d="M3.5 19.5a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.75" />
      <path d="M18 14.5a5.5 5.5 0 0 1 3 5" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4 20.5h4l10-10a2.5 2.5 0 0 0-3.5-3.5l-10 10v3.5Z" />
      <path d="m13.5 8.5 2.5 2.5" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.5 20a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5l1-13.5" />
      <path d="M10.5 10.5v7M13.5 10.5v7" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="m6 9.5 6 6 6-6" />
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
