import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES, siteUrl } from "@/content/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
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
