/**
 * Server-side reader for the admin-managed SEO settings (GET /api/seo).
 *
 * Used from `generateMetadata` and `robots.ts` — server contexts only, so this
 * is a plain `fetch`, not the browser `apiFetch` (which touches `document`).
 * The response is revalidated hourly: an edit in /admin propagates without a
 * redeploy, and the landing stays static between refreshes. Any failure returns
 * null so the caller falls back to the built-in copy in `landing.ts`.
 */

import type { Locale } from "@/content/landing";
import { siteUrl } from "@/content/locales";

type SeoFields = {
  title: string | null;
  description: string | null;
  keywords: string | null;
};

export type SeoPayload = {
  canonical_host: string | null;
  og_image_url: string | null;
  ru: SeoFields;
  kk: SeoFields;
};

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export async function getSeo(): Promise<SeoPayload | null> {
  if (!API) return null;

  try {
    const response = await fetch(`${API}/api/seo`, {
      // Hourly ISR: admin edits show up within the hour, no redeploy needed.
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const { data } = (await response.json()) as { data: SeoPayload };
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Per-locale fields for the URL prefix. The route prefix is `kz`, but the
 * payload keys the Kazakh copy under `kk` (the real language tag).
 */
export function seoFieldsFor(seo: SeoPayload, locale: Locale): SeoFields {
  return locale === "kz" ? seo.kk : seo.ru;
}

/**
 * Site origin for canonical URLs, OG tags and the sitemap. An admin-set
 * canonical host wins (pins where search engines think the site lives);
 * otherwise it derives from the deploy env as before.
 */
export function canonicalBase(seo: SeoPayload | null): string {
  const host = seo?.canonical_host;
  if (!host) return siteUrl();

  return `https://${host.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
}
