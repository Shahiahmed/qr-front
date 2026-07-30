import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/content/locales";
import { canonicalBase, getSeo } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = canonicalBase(await getSeo());
  const lastModified = new Date();

  return LOCALES.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
    // Tells search engines the two URLs are translations, not duplicates.
    alternates: {
      languages: {
        "ru-KZ": `${base}/ru`,
        "kk-KZ": `${base}/kz`,
      },
    },
  }));
}
