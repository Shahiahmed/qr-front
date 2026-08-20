/**
 * Server-side reader for the admin-managed promo pop-up (GET /api/promo).
 *
 * Read from the landing page (a server component), so this is a plain `fetch`,
 * not the browser `apiFetch`. The response is revalidated hourly: an edit in
 * /admin propagates without a redeploy. Any failure — or an inactive promo —
 * returns null so the landing simply renders no pop-up.
 */

import type { Locale } from "@/content/landing";

type PromoFields = {
  badge: string | null;
  title: string | null;
  body: string | null;
  cta_label: string | null;
};

export type PromoPayload = {
  active: boolean;
  /** Changes on every admin save, so a dismissed promo can reappear when edited. */
  id: string;
  cta_url: string | null;
  ru: PromoFields;
  kk: PromoFields;
};

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export async function getPromo(): Promise<PromoPayload | null> {
  if (!API) return null;

  try {
    const response = await fetch(`${API}/api/promo`, {
      // Hourly ISR — schedule changes land within the hour, no redeploy needed.
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const { data } = (await response.json()) as { data: PromoPayload };
    return data?.active ? data : null;
  } catch {
    return null;
  }
}

/**
 * Per-locale fields for the URL prefix. The route prefix is `kz`, but the
 * payload keys the Kazakh copy under `kk` (the real language tag).
 */
export function promoFieldsFor(promo: PromoPayload, locale: Locale): PromoFields {
  return locale === "kz" ? promo.kk : promo.ru;
}
