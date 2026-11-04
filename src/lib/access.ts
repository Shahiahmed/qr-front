import type { Locale } from "@/content/landing";

/**
 * «Осталось 5 дн.» / «5 күн қалды» — days-remaining phrase per locale.
 * Word order differs between the two, so we template the whole sentence
 * instead of concatenating a shared "days" suffix in the components.
 */
export function daysLeftPhrase(days: number, locale: Locale): string {
  return locale === "kz" ? `${days} күн қалды` : `Осталось ${days} дн.`;
}

// Browsers ship no Kazakh month names for Intl (kk-KZ renders «2027 M08 21»),
// so Kazakh dates are spelled out by hand. TODO: native-speaker review.
const KZ_MONTHS = [
  "қаңтар",
  "ақпан",
  "наурыз",
  "сәуір",
  "мамыр",
  "маусым",
  "шілде",
  "тамыз",
  "қыркүйек",
  "қазан",
  "қараша",
  "желтоқсан",
];

/**
 * Access end date: «21 авг. 2027 г.» / «21 тамыз 2027 ж.», or without the
 * year («21 авг.» / «21 тамыз») for tight spots. Empty when absent or invalid.
 */
export function formatAccessDate(iso: string | null, locale: Locale, withYear = true): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (locale === "kz") {
    const dayMonth = `${date.getDate()} ${KZ_MONTHS[date.getMonth()]}`;
    return withYear ? `${dayMonth} ${date.getFullYear()} ж.` : dayMonth;
  }
  return new Intl.DateTimeFormat(
    "ru-RU",
    withYear ? { dateStyle: "medium" } : { day: "numeric", month: "short" },
  ).format(date);
}
