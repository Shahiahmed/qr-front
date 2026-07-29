/**
 * Client for the Laravel API.
 *
 * Sanctum runs in SPA mode, so authentication rides on the session cookie
 * rather than a bearer token. Two consequences shape everything here:
 * every request must carry credentials, and every write must present the
 * CSRF token that Laravel handed out in the `XSRF-TOKEN` cookie.
 */

/*
 * A localhost fallback must never reach a production bundle. Shipped once, it
 * made every visitor's browser try to reach their *own* machine on port 8000,
 * and Chrome answered with a local-network permission prompt on the landing
 * page — a marketing page appearing to scan the visitor's computer.
 *
 * So: configured URL, or nothing. `localhost` only stands in during dev.
 */
const CONFIGURED = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const BASE_URL =
  CONFIGURED || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

/** False when no API is reachable — callers must not fire requests. */
export const isApiConfigured = BASE_URL !== "";

export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ValidationErrors;

  constructor(message: string, status: number, errors: ValidationErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** Laravel answers a failed Form Request with 422 and a field map. */
  get isValidation(): boolean {
    return this.status === 422;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  // Laravel URL-encodes the token; the header has to carry the decoded value.
  return match ? decodeURIComponent(match[2]) : null;
}

async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON object, or a FormData for multipart (file) uploads. */
  body?: unknown;
  /** Route locale — the API answers validation errors in this language. */
  locale?: string;
};

/** `kz` is the route prefix; `kk` is the actual language tag the API expects. */
function languageTag(locale: string | undefined): string {
  if (locale === "kz") return "kk";
  return locale ?? "ru";
}

async function send<T>(path: string, options: Options): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": languageTag(options.locale),
  };

  const isForm = options.body instanceof FormData;

  // Let the browser set multipart's Content-Type (it carries the boundary);
  // only JSON bodies get the header set by hand.
  if (options.body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
  }

  const token = readCookie("XSRF-TOKEN");
  if (token) headers["X-XSRF-TOKEN"] = token;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body:
      options.body === undefined
        ? undefined
        : isForm
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (payload as { message?: string } | null)?.message ?? `HTTP ${response.status}`,
      response.status,
      (payload as { errors?: ValidationErrors } | null)?.errors ?? {},
    );
  }

  return payload as T;
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  if (!isApiConfigured) {
    // Fail loudly rather than aiming a request at whatever host happens to be
    // reachable from the visitor's browser.
    throw new ApiError("API URL is not configured", 0);
  }

  const method = options.method ?? "GET";
  const needsCsrf = method !== "GET";

  // The cookie is missing on a cold page load, and expires with the session.
  if (needsCsrf && !readCookie("XSRF-TOKEN")) {
    await fetchCsrfCookie();
  }

  try {
    return await send<T>(path, options);
  } catch (error) {
    /*
     * 419 means the token was stale — the session was rotated or the tab sat
     * open too long. Refresh it and retry once; a second failure is real.
     */
    if (error instanceof ApiError && error.status === 419 && needsCsrf) {
      await fetchCsrfCookie();
      return send<T>(path, options);
    }

    throw error;
  }
}

/* ---------- auth ---------- */

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
};

type Wrapped<T> = { data: T };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export async function register(
  payload: RegisterPayload,
  locale?: string,
): Promise<User> {
  const { data } = await apiFetch<Wrapped<User>>("/api/register", {
    method: "POST",
    body: payload,
    locale,
  });
  return data;
}

export async function login(
  payload: { email: string; password: string; remember?: boolean },
  locale?: string,
): Promise<User> {
  const { data } = await apiFetch<Wrapped<User>>("/api/login", {
    method: "POST",
    body: payload,
    locale,
  });
  return data;
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/logout", { method: "POST" });
}

/** Returns null for a guest instead of throwing — callers branch on it. */
export async function currentUser(): Promise<User | null> {
  try {
    const { data } = await apiFetch<Wrapped<User>>("/api/user");
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function changePassword(
  payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  },
  locale?: string,
): Promise<void> {
  await apiFetch<void>("/api/user/password", {
    method: "PUT",
    body: payload,
    locale,
  });
}

/* ---------- establishments ---------- */

export type Establishment = {
  id: number;
  name: string;
  slug: string;
  currency: string;
  default_locale: string;
  address: string | null;
  phone: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  /** Colour preset key — see content/themes.ts. */
  theme: string;
  /** Owner-uploaded imagery; null until set. Absolute URLs. */
  cover_url: string | null;
  logo_url: string | null;
  created_at: string | null;
  /** When the public menu stops working (ISO), or null for no limit. */
  access_ends_at: string | null;
  /** What governs the window: "trial" | "subscription" | null (unlimited). */
  access_source: "trial" | "subscription" | null;
  is_expired: boolean;
  /** Whole days left; 0 if expired, null if unlimited. */
  days_left: number | null;
};

/** The two image slots an owner can fill. */
export type VenueImageKind = "cover" | "logo";

export type EstablishmentPayload = {
  name: string;
  slug: string;
  currency: string;
  default_locale: string;
  address?: string | null;
  phone?: string | null;
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  theme?: string;
};

export async function listEstablishments(): Promise<Establishment[]> {
  const { data } = await apiFetch<Wrapped<Establishment[]>>("/api/establishments");
  return data;
}

export async function createEstablishment(
  payload: EstablishmentPayload,
  locale?: string,
): Promise<Establishment> {
  const { data } = await apiFetch<Wrapped<Establishment>>("/api/establishments", {
    method: "POST",
    body: payload,
    locale,
  });
  return data;
}

export async function updateEstablishment(
  id: number,
  payload: Partial<EstablishmentPayload>,
  locale?: string,
): Promise<Establishment> {
  const { data } = await apiFetch<Wrapped<Establishment>>(`/api/establishments/${id}`, {
    method: "PATCH",
    body: payload,
    locale,
  });
  return data;
}

export async function deleteEstablishment(id: number): Promise<void> {
  await apiFetch<void>(`/api/establishments/${id}`, { method: "DELETE" });
}

/** Upload (or replace) the venue cover / logo. Returns the updated venue. */
export async function uploadVenueImage(
  id: number,
  kind: VenueImageKind,
  file: File,
  locale?: string,
): Promise<Establishment> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);

  const { data } = await apiFetch<Wrapped<Establishment>>(
    `/api/establishments/${id}/image`,
    { method: "POST", body: form, locale },
  );
  return data;
}

/** Remove the venue cover / logo. Returns the updated venue. */
export async function deleteVenueImage(
  id: number,
  kind: VenueImageKind,
  locale?: string,
): Promise<Establishment> {
  const { data } = await apiFetch<Wrapped<Establishment>>(
    `/api/establishments/${id}/image/${kind}`,
    { method: "DELETE", locale },
  );
  return data;
}

/* ---------- menu ---------- */

export type Dish = {
  id: number;
  menu_category_id: number;
  name_ru: string;
  name_kk: string | null;
  description_ru: string | null;
  description_kk: string | null;
  /** Minor units — тиыны. Format with `formatPrice`. */
  price: number;
  position: number;
  is_visible: boolean;
  is_available: boolean;
};

export type MenuCategory = {
  id: number;
  name_ru: string;
  name_kk: string | null;
  position: number;
  is_visible: boolean;
  dishes?: Dish[];
};

export async function getMenu(establishmentId: number): Promise<MenuCategory[]> {
  const { data } = await apiFetch<Wrapped<MenuCategory[]>>(
    `/api/establishments/${establishmentId}/menu`,
  );
  return data;
}

/** Seed an empty venue with the bilingual starter menu. 409 if not empty. */
export async function applyMenuStarter(
  establishmentId: number,
  locale?: string,
): Promise<MenuCategory[]> {
  const { data } = await apiFetch<Wrapped<MenuCategory[]>>(
    `/api/establishments/${establishmentId}/menu/starter`,
    { method: "POST", locale },
  );
  return data;
}

export async function createCategory(
  establishmentId: number,
  payload: { name_ru: string; name_kk?: string | null },
  locale?: string,
): Promise<MenuCategory> {
  const { data } = await apiFetch<Wrapped<MenuCategory>>(
    `/api/establishments/${establishmentId}/categories`,
    { method: "POST", body: payload, locale },
  );
  return data;
}

export async function updateCategory(
  establishmentId: number,
  categoryId: number,
  payload: Partial<{ name_ru: string; name_kk: string | null; is_visible: boolean }>,
  locale?: string,
): Promise<MenuCategory> {
  const { data } = await apiFetch<Wrapped<MenuCategory>>(
    `/api/establishments/${establishmentId}/categories/${categoryId}`,
    { method: "PATCH", body: payload, locale },
  );
  return data;
}

export async function deleteCategory(
  establishmentId: number,
  categoryId: number,
): Promise<void> {
  await apiFetch<void>(
    `/api/establishments/${establishmentId}/categories/${categoryId}`,
    { method: "DELETE" },
  );
}

/** Save a new section order. Returns the menu in the new order. */
export async function reorderCategories(
  establishmentId: number,
  ids: number[],
  locale?: string,
): Promise<MenuCategory[]> {
  const { data } = await apiFetch<Wrapped<MenuCategory[]>>(
    `/api/establishments/${establishmentId}/categories/reorder`,
    { method: "PATCH", body: { ids }, locale },
  );
  return data;
}

export type DishPayload = {
  menu_category_id: number;
  name_ru: string;
  name_kk?: string | null;
  description_ru?: string | null;
  description_kk?: string | null;
  price: number;
  is_visible?: boolean;
  is_available?: boolean;
};

export async function createDish(
  establishmentId: number,
  payload: DishPayload,
  locale?: string,
): Promise<Dish> {
  const { data } = await apiFetch<Wrapped<Dish>>(
    `/api/establishments/${establishmentId}/dishes`,
    { method: "POST", body: payload, locale },
  );
  return data;
}

export async function updateDish(
  establishmentId: number,
  dishId: number,
  payload: Partial<DishPayload>,
  locale?: string,
): Promise<Dish> {
  const { data } = await apiFetch<Wrapped<Dish>>(
    `/api/establishments/${establishmentId}/dishes/${dishId}`,
    { method: "PATCH", body: payload, locale },
  );
  return data;
}

export async function deleteDish(establishmentId: number, dishId: number): Promise<void> {
  await apiFetch<void>(`/api/establishments/${establishmentId}/dishes/${dishId}`, {
    method: "DELETE",
  });
}

/* ---------- subscription plans ---------- */

/** A public plan as served by GET /api/plans (see PublicPlans::present). */
export type Plan = {
  id: number;
  name_ru: string;
  name_kk: string | null;
  tagline_ru: string | null;
  tagline_kk: string | null;
  /** Original price in minor units (тиыны). */
  price: number;
  /** Price after discount, in minor units. Equals `price` when no discount. */
  price_final: number;
  discount_percent: number;
  period: "month" | "halfyear" | "year";
  features: { ru: string; kk: string | null }[];
  max_establishments: number | null;
  is_featured: boolean;
};

/** Public catalogue — no auth. Returns [] rather than throwing on failure, so
 *  a static landing page survives the API being unreachable. */
export async function getPlans(locale?: string): Promise<Plan[]> {
  try {
    const { data } = await apiFetch<Wrapped<Plan[]>>("/api/plans", { locale });
    return data;
  } catch {
    return [];
  }
}

export type SubscriptionRequestStatus = "new" | "approved" | "rejected";

/** The menu a request/subscription is attached to (subscriptions are per menu). */
export type SubscriptionMenuRef = { id: number; name: string; slug: string };

export type SubscriptionRequest = {
  id: number;
  status: SubscriptionRequestStatus;
  contact_phone: string | null;
  note: string | null;
  plan: { id: number; name_ru: string; name_kk: string | null } | null;
  establishment: SubscriptionMenuRef | null;
  created_at: string | null;
  reviewed_at: string | null;
};

export type Subscription = {
  id: number;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  /** Live: active and not past its end date. */
  is_active: boolean;
  /** Whole days until it ends; 0 if past, null if open-ended. */
  days_left: number | null;
  plan: Plan | null;
};

/**
 * One of the owner's menus with its own access window and subscription state.
 * Billing is per menu: each row carries its own grant and pending request.
 */
export type MenuSubscription = {
  id: number;
  name: string;
  slug: string;
  access_source: "trial" | "subscription" | null;
  access_ends_at: string | null;
  days_left: number | null;
  is_expired: boolean;
  subscription: Subscription | null;
  pending_request: SubscriptionRequest | null;
};

export type SubscriptionStatus = {
  menus: MenuSubscription[];
};

/** Every menu the owner has, each with its plan + any request awaiting a decision. */
export async function getSubscriptionStatus(locale?: string): Promise<SubscriptionStatus> {
  return apiFetch<SubscriptionStatus>("/api/subscription", { locale });
}

/** File a request for a plan on one menu. 409 if that menu already has a pending one. */
export async function createSubscriptionRequest(
  payload: {
    establishment_id: number;
    plan_id: number;
    contact_phone?: string | null;
    note?: string | null;
  },
  locale?: string,
): Promise<SubscriptionRequest> {
  const { data } = await apiFetch<Wrapped<SubscriptionRequest>>("/api/subscription-requests", {
    method: "POST",
    body: payload,
    locale,
  });
  return data;
}
