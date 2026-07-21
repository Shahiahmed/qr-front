"use client";

import { useQuery } from "@tanstack/react-query";
import { getMenu, isApiConfigured } from "@/lib/api";

export function menuQueryKey(establishmentId: number) {
  return ["menu", establishmentId] as const;
}

export function useMenu(establishmentId: number) {
  return useQuery({
    queryKey: menuQueryKey(establishmentId),
    queryFn: () => getMenu(establishmentId),
    enabled: isApiConfigured,
    retry: false,
  });
}
