import type { Locale } from "@/content/landing";

/** Locales that get their own URL prefix, in menu order. */
export const LOCALES = ["ru", "kz"] as const;

export const DEFAULT_LOCALE: Locale = "ru";

/**
 * Language tag for `<html lang>`. Shortest correct form per W3C i18n: use the
 * bare language subtag unless a regional variant genuinely differs (like
 * en-GB vs en-US spelling). Russian and Kazakh have no distinct "KZ variant",
 * so a region subtag adds nothing here and only confuses some tools (browser
 * "translate page?", screen readers). The route prefix stays `kz`, but the real
 * language tag is `kk` — `kz` is the country, not the language.
 *
 * Note: geo-targeting to Kazakhstan lives in the `hreflang` alternates
 * (ru-KZ / kk-KZ, hardcoded in the layout), NOT here — that is the tag Google
 * uses to pick the right version by country.
 */
export const HTML_LANG: Record<Locale, string> = {
  ru: "ru",
  kz: "kk",
};

/**
 * `og:locale` value for social previews. Facebook expects `language_TERRITORY`
 * from its own supported list — `ru_RU` and `kk_KZ` are valid, a bare `ru` or a
 * `ru_KZ` (unsupported) would be ignored.
 */
export const OG_LOCALE: Record<Locale, string> = {
  ru: "ru_RU",
  kz: "kk_KZ",
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
