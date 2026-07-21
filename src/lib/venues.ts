"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiConfigured, listEstablishments } from "@/lib/api";

export const VENUES_QUERY_KEY = ["establishments"] as const;

/**
 * Host shown under a venue name. The public menu lives outside the locale
 * prefixes — the guest picks a language inside the menu itself, not in the URL
 * printed on a table tent.
 */
export const PUBLIC_MENU_HOST =
  (process.env.NEXT_PUBLIC_MENU_HOST ?? "qmenu.kz") + "/m";

export function useVenues() {
  return useQuery({
    queryKey: VENUES_QUERY_KEY,
    queryFn: listEstablishments,
    enabled: isApiConfigured,
    retry: false,
  });
}
