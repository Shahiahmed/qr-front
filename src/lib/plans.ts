import type { Plan } from "@/lib/api";

// Same resolution as lib/api: the configured URL, or localhost in dev only.
const API =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

/**
 * Public plan catalogue for the landing, fetched on the server so the prices
 * are in the HTML (crawlers, no-JS, no skeleton flash). Hourly ISR like the rest
 * of the page; the client still refreshes on mount, so an /admin price change
 * shows up without waiting for revalidation. [] on any failure — Pricing then
 * falls back to the hand-written copy.
 */
export async function getPublicPlans(): Promise<Plan[]> {
  if (!API) return [];

  try {
    const response = await fetch(`${API}/api/plans`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const { data } = (await response.json()) as { data: Plan[] };
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
