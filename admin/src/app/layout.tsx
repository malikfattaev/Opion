import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";

import { adminConfig } from "@/config/site";

import "./globals.css";

const sansBody = Geist({
  variable: "--font-sans-body",
  subsets: ["latin", "cyrillic"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: `${adminConfig.wordmark} | Админка`,
    template: `${adminConfig.wordmark} | %s`,
  },
  description: "Каталог, заказы и команда OPIØN.",
  // Служебный раздел в поиске не нужен.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${sansBody.variable} ${display.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
