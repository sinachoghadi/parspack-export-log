"use client";

import { useCallback, useState } from "react";

import { ExportLogsActions } from "@/components/logs/export-logs-actions";
import { LogDetailDrawer } from "@/components/logs/log-detail-drawer";
import { LogKpiCards } from "@/components/logs/log-kpi-cards";
import { LogsFilters } from "@/components/logs/logs-filters";
import { LogsPagination } from "@/components/logs/logs-pagination";
import { LogsTable } from "@/components/logs/logs-table";
import { SeoQuickFilters } from "@/components/logs/seo-quick-filters";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessLogs } from "@/hooks/use-access-logs";
import {
  buildAccessLogQueryParams,
  EMPTY_ACCESS_LOG_FILTERS,
  type AccessLogFilterDraft,
  type AccessLogFilterErrors,
} from "@/lib/parspack/access-log-filters";
import type {
  AccessLog,
  AccessLogQueryParams,
  AccessLogStep,
} from "@/lib/parspack/types";
import {
  toggleSeoFilterPreset,
  type SeoQuickFilter,
} from "@/lib/parspack/seo-quick-filters";
import { useActiveZone } from "@/providers/active-zone-provider";
import { useTokenSession } from "@/providers/token-session-provider";

export function AccessLogsSection() {
  const { activeDomain, activeZoneUuid } = useActiveZone();
  const { token } = useTokenSession();
  const [draftFilters, setDraftFilters] = useState<AccessLogFilterDraft>(
    EMPTY_ACCESS_LOG_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] =
    useState<AccessLogQueryParams>({});
  const [filterErrors, setFilterErrors] =
    useState<AccessLogFilterErrors>({});
  const [quickFilterMessage, setQuickFilterMessage] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [step, setStep] = useState<AccessLogStep>(50);
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const accessLogsQuery = useAccessLogs({
    params: {
      page,
      step,
      ...appliedFilters,
    },
  });

  const handleDraftChange = (nextFilters: AccessLogFilterDraft) => {
    setDraftFilters(nextFilters);
    setFilterErrors({});
    setQuickFilterMessage(null);
  };

  const handleApply = () => {
    const result = buildAccessLogQueryParams(draftFilters);

    if (!result.success) {
      setFilterErrors(result.errors);
      return;
    }

    setFilterErrors({});
    setAppliedFilters(result.params);
    setPage(1);
    setQuickFilterMessage(null);
  };

  const handleQuickFilter = (preset: SeoQuickFilter) => {
    if (preset.kind === "informational") {
      setQuickFilterMessage(preset.message);
      return;
    }

    const nextDraftFilters = toggleSeoFilterPreset(preset, draftFilters);
    const result = buildAccessLogQueryParams(nextDraftFilters);

    setDraftFilters(nextDraftFilters);
    setQuickFilterMessage(null);

    if (!result.success) {
      setFilterErrors(result.errors);
      return;
    }

    setFilterErrors({});
    setAppliedFilters(result.params);
    setPage(1);
  };

  const handleReset = () => {
    setDraftFilters(EMPTY_ACCESS_LOG_FILTERS);
    setAppliedFilters({});
    setFilterErrors({});
    setQuickFilterMessage(null);
    setPage(1);
  };

  const handleStepChange = (nextStep: AccessLogStep) => {
    setStep(nextStep);
    setPage(1);
  };

  const closeLogDetails = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const logs = accessLogsQuery.data?.records ?? [];
  const hasActiveFilters = Object.keys(appliedFilters).length > 0;
  const canResetFilters =
    hasActiveFilters || Object.values(draftFilters).some(Boolean);
  // Without API pagination metadata, a full page is the only safe next-page signal.
  const hasNextPage = logs.length === step;

  return (
    <section aria-labelledby="access-logs-title" className="mt-8 space-y-4">
      <LogKpiCards
        isFetching={accessLogsQuery.isFetching}
        isLoading={accessLogsQuery.data === undefined}
        logs={logs}
      />

      <SeoQuickFilters
        message={quickFilterMessage}
        value={draftFilters}
        onSelect={handleQuickFilter}
      />

      <LogsFilters
        errors={filterErrors}
        isApplying={accessLogsQuery.isFetching}
        canReset={canResetFilters}
        value={draftFilters}
        onApply={handleApply}
        onChange={handleDraftChange}
        onReset={handleReset}
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle id="access-logs-title">Access Logs</CardTitle>
            <CardDescription>
              Requests returned by the active domain and applied filters.
            </CardDescription>
          </div>
          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
            <Badge
              aria-live="polite"
              variant={
                accessLogsQuery.isError
                  ? "danger"
                  : accessLogsQuery.isFetching
                    ? "accent"
                    : "neutral"
              }
            >
              {accessLogsQuery.isError
                ? "Request failed"
                : accessLogsQuery.isFetching
                  ? accessLogsQuery.data === undefined
                    ? "Loading access logs..."
                    : "Updating results..."
                  : `${logs.length} records`}
            </Badge>
            <ExportLogsActions
              appliedFilters={appliedFilters}
              currentLogs={logs}
              domain={activeDomain}
              isLoadingCurrent={accessLogsQuery.data === undefined}
              token={token}
              zoneUuid={activeZoneUuid}
            />
          </div>
        </CardHeader>
        <LogsTable
          error={accessLogsQuery.error}
          hasActiveFilters={hasActiveFilters}
          isFetching={accessLogsQuery.isFetching}
          isLoading={accessLogsQuery.isLoading}
          isRetrying={accessLogsQuery.isError && accessLogsQuery.isFetching}
          logs={logs}
          selectedLogId={selectedLog?.id}
          onResetFilters={handleReset}
          onRetry={() => {
            void accessLogsQuery.refetch();
          }}
          onSelectLog={setSelectedLog}
        />
        <LogsPagination
          hasNextPage={hasNextPage}
          isFetching={accessLogsQuery.isFetching}
          page={page}
          step={step}
          onPageChange={setPage}
          onStepChange={handleStepChange}
        />
      </Card>

      <LogDetailDrawer log={selectedLog} onClose={closeLogDetails} />
    </section>
  );
}
