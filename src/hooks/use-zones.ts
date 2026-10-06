"use client";

import { useQuery } from "@tanstack/react-query";

import { getZones } from "@/lib/parspack/zones";
import { useTokenSession } from "@/providers/token-session-provider";

const ZONES_STALE_TIME = 5 * 60 * 1000;

export function useZones() {
  const { isHydrated, token, tokenVersion } = useTokenSession();

  return useQuery({
    queryKey: ["parspack", "zones", tokenVersion],
    queryFn: ({ signal }) => {
      if (!token) {
        throw new Error("A Parspack API token is required to load zones.");
      }

      return getZones({ token, signal });
    },
    enabled: isHydrated && Boolean(token),
    staleTime: ZONES_STALE_TIME,
  });
}
