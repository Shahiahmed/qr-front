/**
 * Per-guest menu look preferences — colour theme and layout the *visitor*
 * picked for themselves. The owner's `theme` / `layout` on the menu is only the
 * default; a guest can override it in the menu's Settings sheet, and the choice
 * lives on this phone (keyed by slug) so it sticks across refreshes without
 * touching the venue's data or any other visitor.
 */

export type GuestPrefs = {
  theme: string;
  layout: string;
};

const STORAGE_PREFIX = "qmenu.guest-prefs.v1:";

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function loadGuestPrefs(slug: string): Partial<GuestPrefs> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GuestPrefs>;
    return {
      theme: typeof parsed.theme === "string" ? parsed.theme : undefined,
      layout: typeof parsed.layout === "string" ? parsed.layout : undefined,
    };
  } catch {
    return null;
  }
}

export function saveGuestPrefs(slug: string, prefs: GuestPrefs): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(prefs));
  } catch {
    // Quota / private mode — the choice still applies for this session.
  }
}
