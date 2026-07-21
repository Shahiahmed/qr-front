import "server-only";

import type { PublicMenu } from "@/lib/guestMenuTypes";

/**
 * Fetching the guest menu.
 *
 * Server-only, and marked as such: this module holds the API base URL, and an
 * accidental import from a client component would ship it — and its fallback —
 * to the browser. That already happened once through a shared helper.
 *
 * It also cannot reuse the browser client in `lib/api.ts`, which reads cookies
 * and sends credentials.
 */

const CONFIGURED = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const API =
  CONFIGURED || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

/** How long a rendered menu may be served before it is rebuilt. */
export const MENU_REVALIDATE_SECONDS = 60;

export async function fetchPublicMenu(slug: string): Promise<PublicMenu | null> {
  if (!API) return null;

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
