"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTokenSession } from "@/providers/token-session-provider";

const MAX_TOKEN_LENGTH = 4096;

export function TokenModal() {
  const { hasToken, isHydrated, setToken } = useTokenSession();
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = isHydrated && !hasToken;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedToken = tokenInput.trim();

    if (!trimmedToken) {
      setError("API token is required.");
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setToken(trimmedToken);
    setTokenInput("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  if (!isOpen) {
    return null;
  }

  const describedBy = error
    ? "api-token-helper api-token-error"
    : "api-token-helper";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/35 p-4 backdrop-blur-[2px] sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-modal-title"
        aria-describedby="token-modal-description"
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(24,24,27,0.18)] sm:p-8"
      >
        <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
            <circle cx="8.5" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 12h8m-3 0v3m-3-3v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h2
          id="token-modal-title"
          className="mt-5 text-2xl font-semibold tracking-tight text-foreground"
        >
          Connect to Parspack
        </h2>
        <p
          id="token-modal-description"
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          Enter your Parspack API token to access CDN logs.
        </p>

        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <label htmlFor="api-token" className="text-sm font-semibold text-foreground">
            API Token
          </label>
          <Input
            ref={inputRef}
            id="api-token"
            name="api-token"
            type="password"
            autoComplete="off"
            maxLength={MAX_TOKEN_LENGTH}
            value={tokenInput}
            onChange={(event) => {
              setTokenInput(event.target.value);

              if (error) {
                setError(null);
              }
            }}
            placeholder="Enter your API token"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="mt-2"
          />
          <p id="api-token-helper" className="mt-2 text-xs leading-5 text-muted-foreground">
            Your token is stored only in this browser session and is removed when the session ends.
          </p>
          {error ? (
            <p id="api-token-error" role="alert" className="mt-2 text-sm font-medium text-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
