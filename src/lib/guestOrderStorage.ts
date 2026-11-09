/**
 * Guest order state on this phone: the draft cart plus every order the guest
 * placed during the visit («Мои заказы»). Keyed by venue slug so two menus on
 * the same phone do not share a cart.
 *
 * Placed orders survive refreshes and closing the tab; only orders older than
 * ORDER_TTL_MS drop out, so last week's dinner doesn't greet the next visit.
 */

import { serviceChargeFor } from "@/lib/money";

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
  /** Dishes only — the service charge is kept apart so the ticket can list it. */
  totalMinor: number;
  /** Venue's percent when the order was placed; absent on older tickets. */
  servicePercent?: number | null;
  serviceMinor?: number;
};

export type GuestOrderStore = {
  cart: GuestCart;
  table: string;
  /** Placed orders, oldest first. */
  orders: GuestOrderTicket[];
};

const STORAGE_PREFIX = "qmenu.guest-order.v1:";

/** How long a placed order stays visible on the phone — one long visit. */
export const ORDER_TTL_MS = 12 * 60 * 60 * 1000;
/** Hard cap so a forgotten tab can't grow the list without end. */
const MAX_ORDERS = 30;

function isFresh(ticket: GuestOrderTicket, now: number): boolean {
  const placedAt = Date.parse(ticket.createdAt);
  return Number.isFinite(placedAt) && now - placedAt < ORDER_TTL_MS;
}

function isTicket(value: unknown): value is GuestOrderTicket {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<GuestOrderTicket>;
  return (
    typeof t.id === "string" &&
    typeof t.createdAt === "string" &&
    Array.isArray(t.items) &&
    typeof t.totalMinor === "number"
  );
}

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function loadGuestOrder(slug: string): GuestOrderStore | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GuestOrderStore> & {
      /** v1 kept only the last order — read it so an open ticket isn't lost. */
      ticket?: unknown;
    };
    const stored = Array.isArray(parsed.orders)
      ? parsed.orders
      : parsed.ticket
        ? [parsed.ticket]
        : [];
    const now = Date.now();

    return {
      cart: parsed.cart && typeof parsed.cart === "object" ? parsed.cart : {},
      table: typeof parsed.table === "string" ? parsed.table : "",
      orders: stored.filter(isTicket).filter((t) => isFresh(t, now)),
    };
  } catch {
    return null;
  }
}

export function saveGuestOrder(slug: string, store: GuestOrderStore): void {
  if (typeof window === "undefined") return;

  try {
    const orders = store.orders.slice(-MAX_ORDERS);
    window.localStorage.setItem(
      storageKey(slug),
      JSON.stringify({ ...store, orders }),
    );
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
  servicePercent?: number | null;
}): GuestOrderTicket {
  const totalMinor = input.lines.reduce(
    (sum, line) => sum + line.price * line.qty,
    0,
  );
  // Snapshot of the percent at order time — a later change by the owner
  // doesn't rewrite a ticket the waiter has already seen.
  const servicePercent = input.servicePercent ?? null;

  return {
    servicePercent,
    serviceMinor: serviceChargeFor(totalMinor, servicePercent),
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    table: input.table.trim(),
    currency: input.currency,
    items: input.lines,
    totalMinor,
  };
}
