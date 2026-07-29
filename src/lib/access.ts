import type { Locale } from "@/content/landing";

/**
 * «Осталось 5 дн.» / «5 күн қалды» — days-remaining phrase per locale.
 * Word order differs between the two, so we template the whole sentence
 * instead of concatenating a shared "days" suffix in the components.
 */
export function daysLeftPhrase(days: number, locale: Locale): string {
  return locale === "kz" ? `${days} күн қалды` : `Осталось ${days} дн.`;
}
