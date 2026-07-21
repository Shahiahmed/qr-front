import type { Locale } from "@/content/landing";

/** Locales that get their own URL prefix, in menu order. */
export const LOCALES = ["ru", "kz"] as const;

export const DEFAULT_LOCALE: Locale = "ru";

/**
 * BCP 47 tags for `<html lang>` and hreflang. The route prefix stays `kz`
 * because that is what the client asked for and what reads naturally to a
 * Kazakh visitor, but the correct language tag is `kk` — `kz` is the country,
 * not the language. Search engines need the real tag.
 */
export const HTML_LANG: Record<Locale, string> = {
  ru: "ru-KZ",
  kz: "kk-KZ",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Absolute site origin for canonical URLs, hreflang, OG tags and the sitemap.
 *
 * Order matters. `VERCEL_URL` is unique per deployment
 * (`qr-front-a1b2c3.vercel.app`), so pointing canonicals at it would tell
 * search engines every deploy is a different site — it is only good enough for
 * previews. `VERCEL_PROJECT_PRODUCTION_URL` is the stable production domain.
 * Set `NEXT_PUBLIC_SITE_URL` once a custom domain exists and it wins over both.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}
