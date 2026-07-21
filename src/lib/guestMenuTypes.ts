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

/** Falls back to Russian: Kazakh fields are optional for the owner. */
export function pick(
  locale: GuestLocale,
  ru: string | null,
  kk: string | null,
): string | null {
  if (locale === "kk") return kk?.trim() ? kk : ru;
  return ru;
}
