"use client";

import { useState } from "react";

import { LogsFilters } from "@/components/logs/logs-filters";
import { SeoQuickFilters } from "@/components/logs/seo-quick-filters";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccessLogs } from "@/hooks/use-access-logs";
import {
  buildAccessLogQueryParams,
  EMPTY_ACCESS_LOG_FILTERS,
  type AccessLogFilterDraft,
  type AccessLogFilterErrors,
} from "@/lib/parspack/access-log-filters";
import type {
  AccessLogQueryParams,
  AccessLogStep,
} from "@/lib/parspack/types";
import {
  toggleSeoFilterPreset,
  type SeoQuickFilter,
} from "@/lib/parspack/seo-quick-filters";

export function AccessLogsSection() {
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
  const [step] = useState<AccessLogStep>(50);
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

  return (
    <section aria-labelledby="access-logs-title" className="mt-6 space-y-4">
      <SeoQuickFilters
        message={quickFilterMessage}
        value={draftFilters}
        onSelect={handleQuickFilter}
      />

      <LogsFilters
        errors={filterErrors}
        isApplying={accessLogsQuery.isFetching}
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
              The filter request is ready; the logs table arrives in the next step.
            </CardDescription>
          </div>
          <Badge variant={accessLogsQuery.isError ? "danger" : "neutral"}>
            {accessLogsQuery.isError ? "Request failed" : "Table not added"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-52 flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border bg-surface-secondary px-5 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none">
                <path d="M5 5.5h14v13H5v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Log table coming next
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Apply filters now to prepare the request without rendering raw log data.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
