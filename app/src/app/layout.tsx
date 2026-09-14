import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Script from "next/script";

import { AppHeader } from "@/components/app-header";
import { appConfig } from "@/config/site";
import { TelegramBootstrap } from "@/lib/telegram/telegram-bootstrap";

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
  title: appConfig.wordmark,
  description: "Лаконичная одежда на каждый день.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  // Вебвью Telegram занимает экран целиком, включая зону под вырезом.
  viewportFit: "cover",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* Скрипт Telegram дописывает в <html> свои CSS-переменные до гидратации,
       поэтому разметку сервера и клиента здесь сверять нечего. */
    <html
      lang="ru"
      className={`${sansBody.variable} ${display.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Скрипт обязан выполниться до гидратации: иначе первый кадр рисуется
            без данных Telegram и экран моргает. */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="flex min-h-full flex-col">
        <TelegramBootstrap />
        <AppHeader />
        <main className="flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</main>
      </body>
    </html>
  );
}
