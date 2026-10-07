"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { exportAccessLogsToExcel } from "@/lib/export/access-logs-excel";
import {
  AccessLogExportLimitError,
  fetchAllAccessLogs,
  type ExportProgress,
} from "@/lib/export/fetch-all-access-logs";
import {
  getParspackErrorMessage,
} from "@/lib/parspack/error-message";
import type {
  AccessLog,
  AccessLogQueryParams,
} from "@/lib/parspack/types";
import { useToast } from "@/providers/toast-provider";

type ExportLogsActionsProps = {
  appliedFilters: AccessLogQueryParams;
  currentLogs: AccessLog[];
  domain: string | null;
  isLoadingCurrent?: boolean;
  token: string | null;
  zoneUuid: string | null;
};

type FullExportStage = "idle" | "fetching" | "building";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function getFullExportErrorMessage(error: unknown): string {
  if (error instanceof AccessLogExportLimitError) {
    return error.message;
  }

  return getParspackErrorMessage(
    error,
    "Unable to export all filtered logs.",
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 18.5h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ExportLogsActions({
  appliedFilters,
  currentLogs,
  domain,
  isLoadingCurrent = false,
  token,
  zoneUuid,
}: ExportLogsActionsProps) {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isExportingCurrent, setIsExportingCurrent] = useState(false);
  const [fullExportStage, setFullExportStage] =
    useState<FullExportStage>("idle");
  const [progress, setProgress] = useState<ExportProgress>({
    pagesFetched: 0,
    recordsFetched: 0,
  });
  const isExportingAll = fullExportStage !== "idle";
  const hasDateRange = Boolean(appliedFilters.from || appliedFilters.to);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );

  const handleCurrentExport = async () => {
    setIsExportingCurrent(true);

    try {
      await exportAccessLogsToExcel({
        logs: currentLogs,
        domain,
        from: appliedFilters.from,
        to: appliedFilters.to,
      });
      toast({ type: "success", message: "Current results exported." });
    } catch {
      toast({ type: "error", message: "Unable to export current results." });
    } finally {
      setIsExportingCurrent(false);
    }
  };

  const handleFullExport = async () => {
    const tokenSnapshot = token?.trim() ?? "";
    const zoneUuidSnapshot = zoneUuid?.trim() ?? "";
    const domainSnapshot = domain;
    const filtersSnapshot = { ...appliedFilters };

    if (!tokenSnapshot || !zoneUuidSnapshot) {
      toast({
        type: "error",
        message: "Connect to a CDN domain before exporting logs.",
      });
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setFullExportStage("fetching");
    setProgress({ pagesFetched: 0, recordsFetched: 0 });

    try {
      const logs = await fetchAllAccessLogs({
        token: tokenSnapshot,
        zoneUuid: zoneUuidSnapshot,
        filters: filtersSnapshot,
        signal: controller.signal,
        onProgress: setProgress,
      });

      if (logs.length === 0) {
        toast({
          type: "info",
          message: "No logs found for the current filters.",
        });
        return;
      }

      setFullExportStage("building");
      await exportAccessLogsToExcel({
        logs,
        domain: domainSnapshot,
        from: filtersSnapshot.from,
        to: filtersSnapshot.to,
        scope: "all",
        signal: controller.signal,
      });
      toast({
        type: "success",
        message: `All ${logs.length.toLocaleString("en-US")} filtered logs exported.`,
      });
    } catch (error) {
      if (!isAbortError(error)) {
        toast({ type: "error", message: getFullExportErrorMessage(error) });
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      setFullExportStage("idle");
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    toast({ type: "info", message: "Full export cancelled." });
  };

  return (
    <div className="w-full sm:w-auto" aria-busy={isExportingAll}>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
        <Button
          aria-label="Export current access logs to Excel"
          className="w-full sm:w-auto"
          disabled={
            isLoadingCurrent ||
            isExportingCurrent ||
            isExportingAll ||
            currentLogs.length === 0
          }
          size="sm"
          variant="secondary"
          onClick={() => {
            void handleCurrentExport();
          }}
        >
          <DownloadIcon />
          {isExportingCurrent ? "Exporting..." : "Export current results"}
        </Button>
        <Button
          aria-label="Export all filtered access logs to Excel"
          className="w-full sm:w-auto"
          disabled={isExportingCurrent || isExportingAll || !token || !zoneUuid}
          size="sm"
          onClick={() => {
            void handleFullExport();
          }}
        >
          <DownloadIcon />
          {isExportingAll ? "Exporting..." : "Export all filtered logs"}
        </Button>
      </div>

      <div className="mt-2 text-left text-xs text-muted-foreground sm:text-right">
        <p>Current results exports this page. Full export uses applied filters.</p>
        {!hasDateRange ? (
          <p className="mt-1 text-warning">
            No date range is applied. The full export may be large.
          </p>
        ) : null}
      </div>

      {isExportingAll ? (
        <div
          className="mt-3 rounded-[var(--radius-sm)] border border-accent/20 bg-accent-soft px-3 py-2.5 text-sm text-foreground"
          role="status"
        >
          <p className="font-semibold">
            {fullExportStage === "building"
              ? "Preparing Excel file..."
              : "Fetching logs..."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {progress.pagesFetched.toLocaleString("en-US")} pages ·{" "}
            {progress.recordsFetched.toLocaleString("en-US")} records
          </p>
          {fullExportStage === "fetching" ? (
            <Button
              className="mt-2"
              size="sm"
              variant="ghost"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
