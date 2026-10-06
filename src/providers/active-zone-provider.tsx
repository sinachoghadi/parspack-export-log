"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useZones } from "@/hooks/use-zones";
import type { ParspackZone } from "@/lib/parspack/types";
import { useTokenSession } from "@/providers/token-session-provider";

const ACTIVE_ZONE_STORAGE_KEY = "parspack_active_zone_uuid";

type ZoneSelection = {
  tokenVersion: number;
  uuid: string | null;
};

type ActiveZoneContextValue = {
  activeZone: ParspackZone | null;
  activeZoneUuid: string | null;
  activeDomain: string | null;
  setActiveZone: (zone: ParspackZone) => void;
};

type ActiveZoneProviderProps = Readonly<{
  children: ReactNode;
}>;

const ActiveZoneContext = createContext<ActiveZoneContextValue | null>(null);

export function ActiveZoneProvider({ children }: ActiveZoneProviderProps) {
  const {
    isHydrated: isTokenHydrated,
    token,
    tokenVersion,
  } = useTokenSession();
  const { data: zones } = useZones();
  const [restoredSelection, setRestoredSelection] =
    useState<ZoneSelection | null>(null);
  const [userSelection, setUserSelection] = useState<ZoneSelection | null>(null);
  const previousTokenRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isTokenHydrated) {
      return;
    }

    const isFirstHydratedToken = previousTokenRef.current === undefined;
    const tokenChanged =
      !isFirstHydratedToken && previousTokenRef.current !== token;

    previousTokenRef.current = token;

    if (tokenChanged || !token) {
      window.sessionStorage.removeItem(ACTIVE_ZONE_STORAGE_KEY);
    }

    const storedZoneUuid =
      tokenChanged || !token
        ? null
        : window.sessionStorage.getItem(ACTIVE_ZONE_STORAGE_KEY)?.trim() || null;
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setRestoredSelection({ tokenVersion, uuid: storedZoneUuid });
        setUserSelection(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isTokenHydrated, token, tokenVersion]);

  const isSelectionHydrated =
    restoredSelection?.tokenVersion === tokenVersion;
  const selectedUuid =
    userSelection?.tokenVersion === tokenVersion
      ? userSelection.uuid
      : restoredSelection?.uuid ?? null;

  const activeZone = useMemo(() => {
    if (!isSelectionHydrated || !zones?.length) {
      return null;
    }

    return zones.find((zone) => zone.uuid === selectedUuid) ?? zones[0];
  }, [isSelectionHydrated, selectedUuid, zones]);

  useEffect(() => {
    if (!isSelectionHydrated || zones === undefined) {
      return;
    }

    let cancelled = false;

    if (activeZone) {
      window.sessionStorage.setItem(ACTIVE_ZONE_STORAGE_KEY, activeZone.uuid);

      if (selectedUuid !== activeZone.uuid) {
        queueMicrotask(() => {
          if (!cancelled) {
            setUserSelection({ tokenVersion, uuid: activeZone.uuid });
          }
        });
      }
    } else {
      window.sessionStorage.removeItem(ACTIVE_ZONE_STORAGE_KEY);

      if (selectedUuid !== null) {
        queueMicrotask(() => {
          if (!cancelled) {
            setUserSelection({ tokenVersion, uuid: null });
          }
        });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [activeZone, isSelectionHydrated, selectedUuid, tokenVersion, zones]);

  const setActiveZone = useCallback(
    (zone: ParspackZone) => {
      setUserSelection({ tokenVersion, uuid: zone.uuid });
      window.sessionStorage.setItem(ACTIVE_ZONE_STORAGE_KEY, zone.uuid);
    },
    [tokenVersion],
  );

  const value = useMemo<ActiveZoneContextValue>(
    () => ({
      activeZone,
      activeZoneUuid: activeZone?.uuid ?? null,
      activeDomain: activeZone?.target_domain ?? null,
      setActiveZone,
    }),
    [activeZone, setActiveZone],
  );

  return (
    <ActiveZoneContext.Provider value={value}>
      {children}
    </ActiveZoneContext.Provider>
  );
}

export function useActiveZone() {
  const context = useContext(ActiveZoneContext);

  if (!context) {
    throw new Error("useActiveZone must be used within ActiveZoneProvider");
  }

  return context;
}
