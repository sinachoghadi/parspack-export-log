"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  getAccessLogs,
  normalizeAccessLogQueryParams,
} from "@/lib/parspack/access-logs";
import type { AccessLogQueryParams } from "@/lib/parspack/types";
import { useActiveZone } from "@/providers/active-zone-provider";
import { useTokenSession } from "@/providers/token-session-provider";

const ACCESS_LOGS_STALE_TIME = 20 * 1000;

type UseAccessLogsOptions = {
  params: AccessLogQueryParams;
};

export function useAccessLogs({ params }: UseAccessLogsOptions) {
  const { activeZoneUuid } = useActiveZone();
  const { isHydrated, token, tokenVersion } = useTokenSession();
  const {
    from,
    method,
    page,
    ray_id: rayId,
    status_code: statusCode,
    step,
    target_domain: targetDomain,
    to,
    uri,
    user_agent: userAgent,
    wcdn_state: cacheState,
  } = params;
  const normalizedParams = useMemo(
    () =>
      normalizeAccessLogQueryParams({
        page,
        step,
        from,
        to,
        uri,
        status_code: statusCode,
        wcdn_state: cacheState,
        user_agent: userAgent,
        method,
        ray_id: rayId,
        target_domain: targetDomain,
      }),
    [
      cacheState,
      from,
      method,
      page,
      rayId,
      statusCode,
      step,
      targetDomain,
      to,
      uri,
      userAgent,
    ],
  );

  return useQuery({
    queryKey: [
      "parspack",
      "access-logs",
      activeZoneUuid,
      tokenVersion,
      normalizedParams,
    ],
    queryFn: ({ signal }) => {
      if (!token || !activeZoneUuid) {
        throw new Error(
          "A Parspack API token and active zone are required to load access logs.",
        );
      }

      return getAccessLogs({
        token,
        zoneUuid: activeZoneUuid,
        params: normalizedParams,
        signal,
      });
    },
    enabled: isHydrated && Boolean(token) && Boolean(activeZoneUuid),
    placeholderData: (previousData, previousQuery) => {
      const previousQueryKey = previousQuery?.queryKey;
      const previousZoneUuid = previousQueryKey?.[2];
      const previousTokenVersion = previousQueryKey?.[3];

      if (
        previousZoneUuid !== activeZoneUuid ||
        previousTokenVersion !== tokenVersion
      ) {
        return undefined;
      }

      return keepPreviousData(previousData);
    },
    staleTime: ACCESS_LOGS_STALE_TIME,
  });
}
