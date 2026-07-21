"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUser, type User } from "@/lib/api";

/** One key everywhere, so a login or logout updates every screen at once. */
export const USER_QUERY_KEY = ["user"] as const;

export function useAuth() {
  const query = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: currentUser,
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
    isLoading: query.isPending,
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
