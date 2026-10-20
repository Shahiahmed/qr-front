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

/**
 * A blocked menu (switched off from /admin) is told apart from a missing one:
 * the QR is right, so the guest sees "temporarily unavailable", not "not found".
 */
export type PublicMenuResult =
  | { status: "ok"; menu: PublicMenu }
  | { status: "blocked" }
  | { status: "missing" };

const MISSING: PublicMenuResult = { status: "missing" };

export async function fetchPublicMenu(slug: string): Promise<PublicMenuResult> {
  if (!API) return MISSING;

  try {
    const response = await fetch(`${API}/api/public/menu/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: MENU_REVALIDATE_SECONDS },
    });

    // 423 Locked — the API's answer for a platform-blocked menu.
    if (response.status === 423) return { status: "blocked" };
    if (!response.ok) return MISSING;

    const payload = (await response.json()) as { data: PublicMenu };
    return { status: "ok", menu: payload.data };
  } catch {
    /*
     * A venue's menu must not 500 because the API blinked — the page renders
     * "not found" instead, and the next revalidation picks it back up.
     */
    return MISSING;
  }
}
