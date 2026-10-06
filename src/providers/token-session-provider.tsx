"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TOKEN_STORAGE_KEY = "parspack_api_token";

type TokenSessionContextValue = {
  token: string | null;
  hasToken: boolean;
  isHydrated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
};

type TokenSessionProviderProps = Readonly<{
  children: ReactNode;
}>;

const TokenSessionContext = createContext<TokenSessionContextValue | null>(null);

export function TokenSessionProvider({ children }: TokenSessionProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const trimmedToken = storedToken?.trim() ?? "";

      if (trimmedToken) {
        setTokenState(trimmedToken);

        if (trimmedToken !== storedToken) {
          window.sessionStorage.setItem(TOKEN_STORAGE_KEY, trimmedToken);
        }
      } else if (storedToken !== null) {
        window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setToken = useCallback((nextToken: string) => {
    const trimmedToken = nextToken.trim();

    if (!trimmedToken) {
      return;
    }

    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, trimmedToken);
    setTokenState(trimmedToken);
  }, []);

  const clearToken = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setTokenState(null);
  }, []);

  const value = useMemo<TokenSessionContextValue>(
    () => ({
      token,
      hasToken: token !== null,
      isHydrated,
      setToken,
      clearToken,
    }),
    [clearToken, isHydrated, setToken, token],
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
