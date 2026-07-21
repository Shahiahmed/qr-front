import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { notFound } from "next/navigation";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { landingByLocale } from "@/content/landing";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  LOCALES,
  isLocale,
  siteUrl,
} from "@/content/locales";
import "../globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) return {};

  const { meta } = landingByLocale[locale];
  const base = siteUrl();

  return {
    metadataBase: new URL(base),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      // hreflang lets Google serve the right language instead of guessing.
      languages: {
        "ru-KZ": "/ru",
        "kk-KZ": "/kz",
        "x-default": `/${DEFAULT_LOCALE}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Qmenu",
      title: meta.title,
      description: meta.description,
      url: `/${locale}`,
      locale: HTML_LANG[locale].replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${onest.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
