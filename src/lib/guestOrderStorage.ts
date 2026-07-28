/**
 * Guest order state lives only in this browser.
 *
 * Nothing is sent to the API yet: the guest builds a cart, "places" a ticket,
 * and shows that screen to the waiter. Keyed by venue slug so two menus on
 * the same phone do not share a cart.
 */

export type GuestCart = Record<number, number>;

export type GuestOrderLine = {
  id: number;
  name_ru: string;
  name_kk: string | null;
  price: number;
  qty: number;
};

export type GuestOrderTicket = {
  id: string;
  createdAt: string;
  table: string;
  currency: string;
  items: GuestOrderLine[];
  totalMinor: number;
};

export type GuestOrderStore = {
  cart: GuestCart;
  table: string;
  ticket: GuestOrderTicket | null;
};

const STORAGE_PREFIX = "qmenu.guest-order.v1:";

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function loadGuestOrder(slug: string): GuestOrderStore | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GuestOrderStore>;
    return {
      cart: parsed.cart && typeof parsed.cart === "object" ? parsed.cart : {},
      table: typeof parsed.table === "string" ? parsed.table : "",
      ticket: parsed.ticket ?? null,
    };
  } catch {
    return null;
  }
}

export function saveGuestOrder(slug: string, store: GuestOrderStore): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(store));
  } catch {
    // Quota / private mode — ordering still works for the session in memory.
  }
}

export function clearGuestOrder(slug: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(storageKey(slug));
  } catch {
    // ignore
  }
}

export function createOrderTicket(input: {
  cart: GuestCart;
  table: string;
  currency: string;
  lines: GuestOrderLine[];
}): GuestOrderTicket {
  const totalMinor = input.lines.reduce(
    (sum, line) => sum + line.price * line.qty,
    0,
  );

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    table: input.table.trim(),
    currency: input.currency,
    items: input.lines,
    totalMinor,
  };
}
