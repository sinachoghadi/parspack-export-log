"use client";

import { Button } from "@/components/ui/button";
import type { AccessLogStep } from "@/lib/parspack/types";

const PAGE_SIZES: AccessLogStep[] = [10, 25, 50, 100];

type LogsPaginationProps = {
  page: number;
  step: AccessLogStep;
  hasNextPage: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onStepChange: (step: AccessLogStep) => void;
};

function isAccessLogStep(value: number): value is AccessLogStep {
  return PAGE_SIZES.some((step) => step === value);
}

export function LogsPagination({
  page,
  step,
  hasNextPage,
  isFetching = false,
  onPageChange,
  onStepChange,
}: LogsPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Rows per page
        <select
          aria-label="Rows per page"
          className="h-9 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          value={step}
          onChange={(event) => {
            const nextStep = Number(event.target.value);

            if (isAccessLogStep(nextStep)) {
              onStepChange(nextStep);
            }
          }}
        >
          {PAGE_SIZES.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button
          aria-label={`Go to page ${Math.max(1, page - 1)}`}
          disabled={page <= 1 || isFetching}
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <span className="min-w-16 text-center text-sm font-medium text-foreground">
          Page {page}
        </span>
        <Button
          aria-label={`Go to page ${page + 1}`}
          disabled={!hasNextPage || isFetching}
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
