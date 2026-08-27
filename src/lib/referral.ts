/**
 * Referral attribution on the client. A friend arrives with `?ref=CODE` — on the
 * landing or straight on /register — and we stash the code in localStorage so it
 * survives the walk between pages. The register call hands it to the server,
 * which resolves it once at sign-up, and then we clear it.
 *
 * Everything is best-effort: private mode or disabled storage simply means the
 * discount is not attributed, never a crash.
 */

const REF_KEY = "qmenu.ref.v1";

/** Read `?ref=` from the current URL and persist it. Safe to call anywhere. */
export function captureRefFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const code = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (code) {
      // Codes are stored uppercase (the server upper-cases too) so a link with
      // a lower-cased code still matches.
      window.localStorage.setItem(REF_KEY, code.toUpperCase());
    }
  } catch {
    // Storage unavailable — attribution is optional, carry on.
  }
}

export function readStoredRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

export function clearStoredRef(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REF_KEY);
  } catch {
    // ignore
  }
}

/** The shareable invite link that lands a friend on the sign-up form. */
export function referralLink(code: string, locale: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/${locale}/register?ref=${encodeURIComponent(code)}`;
}
