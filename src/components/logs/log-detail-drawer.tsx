"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { StatusBadge } from "@/components/logs/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  formatAccessLogTimestamp,
  formatBytes,
} from "@/lib/parspack/access-log-formatters";
import type { AccessLog } from "@/lib/parspack/types";

type LogDetailDrawerProps = {
  log: AccessLog | null;
  onClose: () => void;
};

type DetailItemProps = {
  label: string;
  value: string;
  monospace?: boolean;
  copyable?: boolean;
};

type DetailSectionProps = {
  children: ReactNode;
  id: string;
  title: string;
};

type CopyState = "idle" | "copied" | "error";

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function DetailItem({
  label,
  value,
  monospace = false,
  copyable = false,
}: DetailItemProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div className="min-w-0 rounded-[var(--radius-sm)] bg-surface-secondary px-3.5 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 flex min-w-0 items-start justify-between gap-3">
        <span
          className={`min-w-0 break-words text-sm leading-6 text-foreground ${
            monospace ? "font-mono text-xs" : ""
          }`}
        >
          {value}
        </span>
        {copyable && value !== "—" ? (
          <Button
            aria-label={`Copy ${label}`}
            aria-live="polite"
            className="h-7 shrink-0 px-2 text-xs"
            size="sm"
            variant="ghost"
            onClick={() => {
              void handleCopy();
            }}
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "error"
                ? "Unable to copy"
                : "Copy"}
          </Button>
        ) : null}
      </dd>
    </div>
  );
}

function DetailSection({ children, id, title }: DetailSectionProps) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="mb-3 text-sm font-semibold text-foreground">
        {title}
      </h3>
      <dl className="grid gap-2 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function formatMilliseconds(value: number | null): string {
  return value === null ? "—" : `${value} ms`;
}

export function LogDetailDrawer({ log, onClose }: LogDetailDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!log) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previousFocusRef.current?.focus();
    };
  }, [log, onClose]);

  if (!log) {
    return null;
  }

  const requestIdentifier = log.rayId ?? (log.uri || log.id);

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end sm:p-3">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-foreground/25"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        aria-labelledby="log-detail-title"
        aria-modal="true"
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-surface shadow-[0_24px_70px_rgba(24,24,27,0.18)] outline-none sm:max-w-[480px] sm:rounded-[var(--radius-lg)] sm:border sm:border-border"
        role="dialog"
        tabIndex={-1}
      >
        <header className="shrink-0 border-b border-border bg-surface px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Access log
              </p>
              <h2
                id="log-detail-title"
                className="mt-1 text-lg font-semibold tracking-tight text-foreground"
              >
                Request details
              </h2>
              <p
                className="mt-1 truncate font-mono text-xs text-muted-foreground"
                title={requestIdentifier}
              >
                {requestIdentifier}
              </p>
            </div>
            <IconButton
              ref={closeButtonRef}
              aria-label="Close request details"
              className="size-9"
              onClick={onClose}
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m7 7 10 10M17 7 7 17"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            </IconButton>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge statusCode={log.statusCode} />
            <Badge variant="neutral">
              <span className="font-mono">{log.method || "—"}</span>
            </Badge>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <DetailSection id="request-details-heading" title="Request">
            <DetailItem
              label="Timestamp"
              value={formatAccessLogTimestamp(log.timestamp)}
            />
            <DetailItem label="Method" monospace value={log.method || "—"} />
            <div className="sm:col-span-2">
              <DetailItem
                copyable
                label="URI"
                monospace
                value={log.uri || "—"}
              />
            </div>
            <DetailItem label="Status Code" value={String(log.statusCode)} />
            <DetailItem label="Scheme" monospace value={log.scheme ?? "—"} />
            <div className="sm:col-span-2">
              <DetailItem
                label="Target Domain"
                monospace
                value={log.targetDomain ?? "—"}
              />
            </div>
          </DetailSection>

          <section aria-labelledby="user-agent-heading">
            <h3
              id="user-agent-heading"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              User Agent
            </h3>
            <dl>
              <DetailItem
                copyable
                label="Full User Agent"
                monospace
                value={log.userAgent ?? "—"}
              />
            </dl>
          </section>

          <DetailSection id="network-details-heading" title="Network">
            <DetailItem
              copyable
              label="Remote IP"
              monospace
              value={log.remoteIp ?? "—"}
            />
            <DetailItem
              copyable
              label="Ray ID"
              monospace
              value={log.rayId ?? "—"}
            />
            <DetailItem
              label="Edge ID"
              monospace
              value={log.edgeId === null ? "—" : String(log.edgeId)}
            />
          </DetailSection>

          <DetailSection id="cdn-details-heading" title="CDN">
            <DetailItem
              label="Cache State"
              monospace
              value={log.cacheState ?? "—"}
            />
          </DetailSection>

          <DetailSection id="performance-details-heading" title="Performance">
            <DetailItem
              label="Connection Duration"
              value={formatMilliseconds(log.connectionDurationMs)}
            />
            <DetailItem
              label="Hosting Wait Duration"
              value={formatMilliseconds(log.hostingWaitDurationMs)}
            />
            <DetailItem
              label="Delivery Duration"
              value={formatMilliseconds(log.deliveryDurationMs)}
            />
            <DetailItem
              label="Total Duration"
              value={formatMilliseconds(log.totalDurationMs)}
            />
          </DetailSection>

          <DetailSection id="traffic-details-heading" title="Traffic">
            <DetailItem label="Bytes In" value={formatBytes(log.bytesIn)} />
            <DetailItem label="Bytes Out" value={formatBytes(log.bytesOut)} />
          </DetailSection>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
