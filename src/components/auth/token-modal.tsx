"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/providers/toast-provider";
import { useTokenSession } from "@/providers/token-session-provider";

const MAX_TOKEN_LENGTH = 4096;

export function TokenModal() {
  const {
    cancelTokenChange,
    hasToken,
    isChangingToken,
    isHydrated,
    setToken,
  } = useTokenSession();
  const { toast } = useToast();
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isChangeMode = hasToken && isChangingToken;
  const isOpen = isHydrated && (!hasToken || isChangingToken);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const resetInput = () => {
    setTokenInput("");
    setError(null);
  };

  const handleCancel = () => {
    if (!isChangeMode || isSubmitting) {
      return;
    }

    resetInput();
    cancelTokenChange();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedToken = tokenInput.trim();

    if (!trimmedToken) {
      setError("API token is required.");
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await setToken(trimmedToken);
      resetInput();
      toast({
        type: "success",
        message: isChangeMode
          ? "API token changed."
          : "Connected to Parspack.",
      });
    } catch {
      setError("Unable to store the API token. Try again.");
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isChangeMode) {
      event.preventDefault();
      handleCancel();
      return;
    }

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
  };

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
        aria-busy={isSubmitting}
        aria-describedby="token-modal-description"
        aria-labelledby="token-modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(24,24,27,0.18)] sm:p-8"
        role="dialog"
        onKeyDown={handleKeyDown}
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
          {isChangeMode ? "Change API token" : "Connect to Parspack"}
        </h2>
        <p
          id="token-modal-description"
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          {isChangeMode
            ? "Enter a new Parspack API token."
            : "Enter your Parspack API token to access CDN logs."}
        </p>

        <form className="mt-6" noValidate onSubmit={handleSubmit}>
          <label htmlFor="api-token" className="text-sm font-semibold text-foreground">
            API Token
          </label>
          <Input
            ref={inputRef}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            className="mt-2"
            disabled={isSubmitting}
            id="api-token"
            maxLength={MAX_TOKEN_LENGTH}
            name="api-token"
            placeholder="Enter your API token"
            type="password"
            value={tokenInput}
            onChange={(event) => {
              setTokenInput(event.target.value);

              if (error) {
                setError(null);
              }
            }}
          />
          <p id="api-token-helper" className="mt-2 text-xs leading-5 text-muted-foreground">
            Your token is stored only in this browser session. It is removed
            when the session ends or when you disconnect.
          </p>
          {error ? (
            <p id="api-token-error" role="alert" className="mt-2 text-sm font-medium text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isChangeMode ? (
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              className="w-full min-w-28 sm:w-auto"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Saving..."
                : isChangeMode
                  ? "Change token"
                  : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
