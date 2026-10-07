"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

type DisconnectDialogProps = {
  isOpen: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DisconnectDialog({
  isOpen,
  isPending,
  onCancel,
  onConfirm,
}: DisconnectDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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
    cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !isPending) {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
      "button:not([disabled])",
    );

    if (!buttons?.length) {
      event.preventDefault();
      return;
    }

    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton.focus();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-foreground/35 p-4 backdrop-blur-[2px] sm:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        onClick={isPending ? undefined : onCancel}
      />
      <div
        ref={dialogRef}
        aria-busy={isPending}
        aria-describedby="disconnect-dialog-description"
        aria-labelledby="disconnect-dialog-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(24,24,27,0.18)] sm:p-8"
        role="dialog"
        onKeyDown={handleKeyDown}
      >
        <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
            <path d="M9 5H5v14h4M13 8l4 4-4 4m4-4H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </span>
        <h2
          id="disconnect-dialog-title"
          className="mt-5 text-xl font-semibold tracking-tight text-foreground"
        >
          Disconnect Parspack?
        </h2>
        <p
          id="disconnect-dialog-description"
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          This will remove the API token from the current browser session.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            ref={cancelButtonRef}
            className="w-full sm:w-auto"
            disabled={isPending}
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="w-full min-w-28 sm:w-auto"
            disabled={isPending}
            variant="danger"
            onClick={onConfirm}
          >
            {isPending ? "Disconnecting..." : "Disconnect"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
