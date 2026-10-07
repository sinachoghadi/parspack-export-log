"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  PARSPACK_ACTIVE_ZONE_STORAGE_KEY,
  PARSPACK_TOKEN_STORAGE_KEY,
} from "@/lib/parspack/session-storage";

type TokenSessionContextValue = {
  token: string | null;
  hasToken: boolean;
  isHydrated: boolean;
  isChangingToken: boolean;
  tokenVersion: number;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  openTokenChange: () => void;
  cancelTokenChange: () => void;
};

type TokenSessionProviderProps = Readonly<{
  children: ReactNode;
}>;

const TokenSessionContext = createContext<TokenSessionContextValue | null>(null);

export function TokenSessionProvider({ children }: TokenSessionProviderProps) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isChangingToken, setIsChangingToken] = useState(false);
  const [tokenVersion, setTokenVersion] = useState(0);

  useEffect(() => {
    try {
      const storedToken = window.sessionStorage.getItem(
        PARSPACK_TOKEN_STORAGE_KEY,
      );
      const trimmedToken = storedToken?.trim() ?? "";

      if (trimmedToken) {
        setTokenState(trimmedToken);
        setTokenVersion((version) => version + 1);

        if (trimmedToken !== storedToken) {
          window.sessionStorage.setItem(
            PARSPACK_TOKEN_STORAGE_KEY,
            trimmedToken,
          );
        }
      } else if (storedToken !== null) {
        window.sessionStorage.removeItem(PARSPACK_TOKEN_STORAGE_KEY);
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const clearParspackQueries = useCallback(async () => {
    await queryClient.cancelQueries({ queryKey: ["parspack"] });
    queryClient.removeQueries({ queryKey: ["parspack"] });
  }, [queryClient]);

  const setToken = useCallback(async (nextToken: string) => {
    const trimmedToken = nextToken.trim();

    if (!trimmedToken) {
      return;
    }

    await clearParspackQueries();
    window.sessionStorage.removeItem(PARSPACK_ACTIVE_ZONE_STORAGE_KEY);
    window.sessionStorage.setItem(PARSPACK_TOKEN_STORAGE_KEY, trimmedToken);
    setTokenState(trimmedToken);
    setTokenVersion((version) => version + 1);
    setIsChangingToken(false);
  }, [clearParspackQueries]);

  const clearToken = useCallback(async () => {
    await clearParspackQueries();
    window.sessionStorage.removeItem(PARSPACK_TOKEN_STORAGE_KEY);
    window.sessionStorage.removeItem(PARSPACK_ACTIVE_ZONE_STORAGE_KEY);
    setTokenState(null);
    setTokenVersion((version) => version + 1);
    setIsChangingToken(false);
  }, [clearParspackQueries]);

  const openTokenChange = useCallback(() => {
    setIsChangingToken(true);
  }, []);

  const cancelTokenChange = useCallback(() => {
    setIsChangingToken(false);
  }, []);

  const value = useMemo<TokenSessionContextValue>(
    () => ({
      token,
      hasToken: token !== null,
      isHydrated,
      isChangingToken,
      tokenVersion,
      setToken,
      clearToken,
      openTokenChange,
      cancelTokenChange,
    }),
    [
      cancelTokenChange,
      clearToken,
      isChangingToken,
      isHydrated,
      openTokenChange,
      setToken,
      token,
      tokenVersion,
    ],
  );

  return (
    <TokenSessionContext.Provider value={value}>
      {children}
    </TokenSessionContext.Provider>
  );
}

export function useTokenSession() {
  const context = useContext(TokenSessionContext);

  if (!context) {
    throw new Error("useTokenSession must be used within TokenSessionProvider");
  }

  return context;
}
