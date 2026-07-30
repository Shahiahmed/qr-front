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
} from "@/content/locales";
import { canonicalBase, getSeo, seoFieldsFor } from "@/lib/seo";
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

  // Admin-managed overrides (title/description/keywords/OG image/robots), read
  // from the API and revalidated hourly. Any empty field or a failed fetch
  // falls back to the built-in copy in landing.ts — the page is never left bare.
  const seo = await getSeo();
  const fields = seo ? seoFieldsFor(seo, locale) : null;

  const title = fields?.title ?? meta.title;
  const description = fields?.description ?? meta.description;
  const keywords = fields?.keywords ?? undefined;
  const ogImage = seo?.og_image_url ?? undefined;

  const base = canonicalBase(seo);

  return {
    metadataBase: new URL(base),
    title,
    description,
    keywords,
    // noindex is an admin kill-switch for keeping a draft out of search.
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
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
      title,
      description,
      url: `/${locale}`,
      locale: HTML_LANG[locale].replace("-", "_"),
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
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
