"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUser, isApiConfigured, type User } from "@/lib/api";

/** One key everywhere, so a login or logout updates every screen at once. */
export const USER_QUERY_KEY = ["user"] as const;

export function useAuth() {
  const query = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: currentUser,
    /*
     * This runs on the public landing, so it must not fire when there is no
     * API to ask. Without the guard the request went to the fallback host —
     * the visitor's own machine — and the browser asked them to approve
     * local network access on a marketing page.
     */
    enabled: isApiConfigured,
    /*
     * The landing is public and statically served. If the API is unreachable
     * the page must still render — treat a failure as "not signed in" rather
     * than retrying and blocking the header.
     */
    retry: false,
    staleTime: 60_000,
  });

  return {
    user: query.data ?? null,
    /*
     * A disabled query stays `pending` forever, which would leave the header
     * showing its placeholder for good. With no API there is nothing to wait
     * for: the visitor is a guest.
     */
    isLoading: isApiConfigured && query.isPending,
    isAuthenticated: Boolean(query.data),
  };
}

/** Lets a form publish the signed-in user without waiting for a refetch. */
export function useSetAuthUser() {
  const client = useQueryClient();

  return (user: User | null) => {
    client.setQueryData(USER_QUERY_KEY, user);
  };
}
