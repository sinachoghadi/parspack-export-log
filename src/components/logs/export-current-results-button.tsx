"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { exportAccessLogsToExcel } from "@/lib/export/access-logs-excel";
import type { AccessLog } from "@/lib/parspack/types";

type ExportCurrentResultsButtonProps = {
  logs: AccessLog[];
  domain?: string | null;
  from?: string;
  to?: string;
  isLoading?: boolean;
};

export function ExportCurrentResultsButton({
  logs,
  domain,
  from,
  to,
  isLoading = false,
}: ExportCurrentResultsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isDisabled = isLoading || isExporting || logs.length === 0;

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      await exportAccessLogsToExcel({ logs, domain, from, to });
      setMessage("Excel file exported.");
    } catch {
      setMessage("Unable to export Excel file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full sm:w-auto">
      <Button
        aria-busy={isExporting}
        aria-describedby="export-current-results-help export-current-results-status"
        aria-label="Export current access logs to Excel"
        className="w-full sm:w-auto"
        disabled={isDisabled}
        size="sm"
        variant="secondary"
        onClick={() => {
          void handleExport();
        }}
      >
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
        {isExporting ? "Exporting..." : "Export current results"}
      </Button>
      <p
        id="export-current-results-help"
        className="mt-1.5 text-xs text-muted-foreground"
      >
        Current page only
      </p>
      <p
        id="export-current-results-status"
        aria-live="polite"
        className={`mt-1 text-xs ${message?.startsWith("Unable") ? "text-danger" : "text-success"}`}
      >
        {message}
      </p>
    </div>
  );
}
