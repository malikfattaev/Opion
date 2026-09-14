type IconProps = {
  className?: string;
};

/**
 * Иконки нарисованы обводкой в одной сетке 24×24 и наследуют цвет текста,
 * поэтому одинаково смотрятся рядом друг с другом и меняют цвет вместе с темой.
 */
const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function CartIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 8h12l-1.1 11a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function ReceiptIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 3.5h12v17l-2.4-1.5-2.4 1.5-2.4-1.5-2.4 1.5-2.4-1.5V3.5Z" />
      <path d="M9.5 8.5h5M9.5 12.5h5" />
    </svg>
  );
}

export function MenuIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
