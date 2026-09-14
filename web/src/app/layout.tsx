import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";

import "./globals.css";

const sansBody = Geist({
  variable: "--font-sans-body",
  subsets: ["latin", "cyrillic"],
});

// Контрастная антиква перекликается с начертанием логотипа.
// Кириллица обязательна: без неё заголовки уехали бы в системный шрифт.
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.wordmark} | Каталог`,
    template: `${siteConfig.wordmark} | %s`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export const viewport: Viewport = {
  themeColor: brand.colors.black,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${sansBody.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
