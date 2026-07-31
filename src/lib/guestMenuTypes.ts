import type { GuestLocale } from "@/content/guest";

/**
 * Shapes and helpers the guest UI needs.
 *
 * Kept apart from the fetching module: `GuestMenu` is a client component, and
 * importing it from there dragged the whole module — including the API base
 * URL and its fallback — into the browser bundle.
 */

export type PublicDish = {
  id: number;
  name_ru: string;
  name_kk: string | null;
  description_ru: string | null;
  description_kk: string | null;
  price: number;
  is_available: boolean;
  // Optional: dish photo upload is not built yet, so real menus omit it. The
  // built-in demo sets it, and the guest card renders one only when present.
  image_url?: string | null;
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
  // Header extras. Real venues fill these from the panel; empty fields are
  // simply skipped by the guest UI. Cover is the wide photo behind the header;
  // logo is a small badge centred over it.
  cover_url?: string | null;
  logo_url?: string | null;
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  // Colour preset key (see content/themes.ts). Falls back to the default.
  theme?: string | null;
  // Layout preset key (see content/layouts.ts). Falls back to the default.
  layout?: string | null;
  /** Optional venue blurb under the cover. Demo fills it; real venues later. */
  description_ru?: string | null;
  description_kk?: string | null;
  categories: PublicCategory[];
};

/** Falls back to Russian: Kazakh fields are optional for the owner. */
export function pick(
  locale: GuestLocale,
  ru: string | null,
  kk: string | null,
): string | null {
  if (locale === "kk") return kk?.trim() ? kk : ru;
  return ru;
}
