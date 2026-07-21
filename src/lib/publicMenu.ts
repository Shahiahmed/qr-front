import type { GuestLocale } from "@/content/guest";

/**
 * Fetching the guest menu. This runs on the server at build and revalidate
 * time, so it cannot reuse the browser client in `lib/api.ts` — that one
 * reads cookies and sends credentials.
 */

export type PublicDish = {
  id: number;
  name_ru: string;
  name_kk: string | null;
  description_ru: string | null;
  description_kk: string | null;
  price: number;
  is_available: boolean;
};

export type PublicCategory = {
  id: number;
  name_ru: string;
  name_kk: string | null;
  dishes: PublicDish[];
};

export type PublicMenu = {
  name: string;
  slug: string;
  currency: string;
  default_locale: string;
  address: string | null;
  phone: string | null;
  categories: PublicCategory[];
};

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/** How long a rendered menu may be served before it is rebuilt. */
export const MENU_REVALIDATE_SECONDS = 60;

export async function fetchPublicMenu(slug: string): Promise<PublicMenu | null> {
  try {
    const response = await fetch(`${API}/api/public/menu/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: MENU_REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as { data: PublicMenu };
    return payload.data;
  } catch {
    /*
     * A venue's menu must not 500 because the API blinked — the page renders
     * "not found" instead, and the next revalidation picks it back up.
     */
    return null;
  }
}

/** Falls back to Russian: Kazakh fields are optional for the owner. */
export function pick(
  locale: GuestLocale,
  ru: string | null,
  kk: string | null,
): string | null {
  if (locale === "kk") return kk?.trim() ? kk : ru;
  return ru;
}
