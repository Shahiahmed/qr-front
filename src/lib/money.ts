/**
 * Prices are held in minor units — тиыны, 1/100 ₸ — because a float cannot
 * hold 2490.00 exactly and the drift eventually shows up on a bill.
 * The panel talks in tenge, so conversion happens at the edges.
 */
const MINOR = 100;

/** «2490» or «2490,50» from the input → 249000 тиын. */
export function toMinorUnits(input: string): number | null {
  const normalized = input.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  // Rounding, not truncation: 0.1 + 0.2 style drift would eat a тиын.
  return Math.round(Number(normalized) * MINOR);
}

/** 249000 → «2490» for the input field. */
export function toMajorUnits(minor: number): string {
  const major = minor / MINOR;
  return Number.isInteger(major) ? String(major) : major.toFixed(2);
}

/** 249000 → «2 490 ₸» for display. */
export function formatPrice(minor: number, currency = "KZT"): string {
  const symbols: Record<string, string> = { KZT: "₸", USD: "$", RUB: "₽" };
  const major = minor / MINOR;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);

  return `${formatted} ${symbols[currency] ?? currency}`;
}

/**
 * Service charge on a bill of `minor` тиын at `percent`, rounded to a whole
 * currency unit. Mirrors `Establishment::serviceChargeFor` on the server —
 * same formula, so the cart and the Telegram order agree to the tenge.
 */
export function serviceChargeFor(minor: number, percent: number | null | undefined): number {
  if (!percent || percent <= 0) return 0;
  return Math.round((minor * percent) / 10000) * MINOR;
}

/** 10 → «10%», 12.5 → «12,5%». */
export function formatPercent(percent: number): string {
  return `${String(percent).replace(".", ",")}%`;
}
