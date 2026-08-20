"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { currentUser, isApiConfigured, type User } from "@/lib/api";

/** One key everywhere, so a login or logout updates every screen at once. */
export const USER_QUERY_KEY = ["user"] as const;

/*
 * The confirmed session is mirrored into localStorage — NOT sessionStorage —
 * so it is shared across every tab and window, not just the one that logged in.
 * A fresh tab (or a locale hop, which remounts QueryProvider with a fresh
 * client) seeds the header from it instantly instead of flashing "Войти" until
 * /api/user comes back. A `storage` event keeps open tabs in sync live.
 */
const USER_STORAGE_KEY = "qmenu.user.v1";

function readStoredUser(): User | null | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (raw === null) return undefined;
    return JSON.parse(raw) as User | null;
  } catch {
    return undefined;
  }
}

function writeStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Private mode / quota — auth still works from the network.
  }
}

/**
 * Persist a confirmed session for the public header to read. The login/register
 * forms already do this through `useSetAuthUser`, but the Google sign-in is a
 * full-page redirect with no client mutation — so the cabinet shell calls this
 * when it fetches the user, otherwise the landing keeps showing "Войти".
 */
export function persistAuthUser(user: User | null): void {
  writeStoredUser(user);
}

export function useAuth() {
  const client = useQueryClient();

  // Propagate a sign-in / sign-out from another tab. The `storage` event fires
  // only in *other* tabs (the acting tab already updated its own cache), so a
  // login here lights up "Кабинет" there, and a logout drops it back to guest —
  // no refetch, no stale header lingering in a background tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== USER_STORAGE_KEY) return;
      const next = readStoredUser();
      client.setQueryData(USER_QUERY_KEY, next === undefined ? null : next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [client]);

  const query = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const user = await currentUser();
        writeStoredUser(user);
        return user;
      } catch {
        // Landing must stay usable if the API is down — treat as guest.
        writeStoredUser(null);
        return null;
      }
    },
    /*
     * This runs on the public landing, so it must not fire when there is no
     * API to ask. Without the guard the request went to the fallback host —
     * the visitor's own machine — and the browser asked them to approve
     * local network access on a marketing page.
     */
    enabled: isApiConfigured,
    retry: false,
    staleTime: 60_000,
    // Seed from the previous page in this tab so /ru ↔ /kz does not blank CTAs.
    initialData: () => {
      const stored = readStoredUser();
      return stored === undefined ? undefined : stored;
    },
    // Slightly stale so a quiet revalidation still runs after a locale hop.
    initialDataUpdatedAt: () =>
      readStoredUser() === undefined ? undefined : Date.now() - 30_000,
  });

  return {
    user: query.data ?? null,
    /*
     * A disabled query stays `pending` forever, which would leave the header
     * showing its placeholder for good. With no API there is nothing to wait
     * for: the visitor is a guest.
     *
     * Also: if we already know the answer from session storage, do not treat
     * the first paint as loading — that was blanking the header on language
     * switches.
     */
    isLoading:
      isApiConfigured && query.isPending && query.data === undefined,
    isAuthenticated: Boolean(query.data),
  };
}

/** Lets a form publish the signed-in user without waiting for a refetch. */
export function useSetAuthUser() {
  const client = useQueryClient();

  return (user: User | null) => {
    writeStoredUser(user);
    client.setQueryData(USER_QUERY_KEY, user);
  };
}
