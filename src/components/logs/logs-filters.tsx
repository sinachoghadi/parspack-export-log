"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  AccessLogFilterDraft,
  AccessLogFilterErrors,
} from "@/lib/parspack/access-log-filters";
import type { AccessLogMethod } from "@/lib/parspack/types";

const ACCESS_LOG_METHODS: AccessLogMethod[] = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
  "CONNECT",
  "TRACE",
];

type LogsFiltersProps = {
  value: AccessLogFilterDraft;
  errors?: AccessLogFilterErrors;
  canReset?: boolean;
  isApplying?: boolean;
  onChange: (value: AccessLogFilterDraft) => void;
  onApply: () => void;
  onReset: () => void;
};

type FilterField = keyof AccessLogFilterDraft;

const fieldLabelStyles = "mb-1.5 block text-sm font-medium text-foreground";
const selectStyles =
  "h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20";
const errorStyles = "mt-1.5 text-xs font-medium text-danger";

function isAccessLogMethod(value: string): value is AccessLogMethod {
  return ACCESS_LOG_METHODS.some((method) => method === value);
}

export function LogsFilters({
  value,
  errors = {},
  canReset = true,
  isApplying = false,
  onChange,
  onApply,
  onReset,
}: LogsFiltersProps) {
  const updateField = <Field extends FilterField>(
    field: Field,
    nextValue: AccessLogFilterDraft[Field],
  ) => {
    onChange({ ...value, [field]: nextValue });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle id="logs-filters-title">Filter logs</CardTitle>
        <CardDescription>
          Refine the request, then apply all changes together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form aria-labelledby="logs-filters-title" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-2">
              <label className={fieldLabelStyles} htmlFor="access-log-from">
                From
              </label>
              <Input
                aria-describedby={errors.dateRange ? "date-range-error" : undefined}
                aria-invalid={Boolean(errors.dateRange)}
                id="access-log-from"
                type="date"
                value={value.from}
                onChange={(event) => updateField("from", event.target.value)}
              />
            </div>

            <div className="min-w-0 xl:col-span-2">
              <label className={fieldLabelStyles} htmlFor="access-log-to">
                To
              </label>
              <Input
                aria-describedby={errors.dateRange ? "date-range-error" : undefined}
                aria-invalid={Boolean(errors.dateRange)}
                id="access-log-to"
                type="date"
                value={value.to}
                onChange={(event) => updateField("to", event.target.value)}
              />
            </div>

            <div className="min-w-0 xl:col-span-3">
              <label className={fieldLabelStyles} htmlFor="access-log-uri">
                URI
              </label>
              <Input
                id="access-log-uri"
                placeholder="/robots.txt"
                value={value.uri}
                onChange={(event) => updateField("uri", event.target.value)}
              />
            </div>

            <div className="min-w-0 xl:col-span-2">
              <label className={fieldLabelStyles} htmlFor="access-log-status-code">
                Status code
              </label>
              <Input
                aria-describedby={errors.statusCode ? "status-code-error" : undefined}
                aria-invalid={Boolean(errors.statusCode)}
                id="access-log-status-code"
                inputMode="numeric"
                max={65535}
                min={1}
                placeholder="200"
                step={1}
                type="number"
                value={value.statusCode}
                onChange={(event) => updateField("statusCode", event.target.value)}
              />
              {errors.statusCode ? (
                <p className={errorStyles} id="status-code-error" role="alert">
                  {errors.statusCode}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 xl:col-span-3">
              <label className={fieldLabelStyles} htmlFor="access-log-method">
                Method
              </label>
              <select
                className={selectStyles}
                id="access-log-method"
                value={value.method}
                onChange={(event) => {
                  const nextMethod = event.target.value;

                  updateField(
                    "method",
                    isAccessLogMethod(nextMethod) ? nextMethod : "",
                  );
                }}
              >
                <option value="">All methods</option>
                {ACCESS_LOG_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {errors.dateRange ? (
              <p
                className={`${errorStyles} md:col-span-2 xl:col-span-12 xl:-mt-2`}
                id="date-range-error"
                role="alert"
              >
                {errors.dateRange}
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="min-w-0">
              <label className={fieldLabelStyles} htmlFor="access-log-user-agent">
                User Agent
              </label>
              <Input
                id="access-log-user-agent"
                placeholder="Googlebot"
                value={value.userAgent}
                onChange={(event) => updateField("userAgent", event.target.value)}
              />
            </div>

            <div className="min-w-0">
              <label className={fieldLabelStyles} htmlFor="access-log-wcdn-state">
                WCDN State
              </label>
              <Input
                id="access-log-wcdn-state"
                placeholder="miss"
                value={value.wcdnState}
                onChange={(event) => updateField("wcdnState", event.target.value)}
              />
            </div>

            <div className="min-w-0 md:col-span-2 xl:col-span-1">
              <label className={fieldLabelStyles} htmlFor="access-log-ray-id">
                Ray ID
              </label>
              <Input
                id="access-log-ray-id"
                placeholder="W2979131U1707911909M4392"
                value={value.rayId}
                onChange={(event) => updateField("rayId", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={!canReset || isApplying}
              onClick={onReset}
              type="button"
              variant="secondary"
            >
              Reset
            </Button>
            <Button
              aria-busy={isApplying}
              className="w-full sm:w-auto"
              disabled={isApplying}
              type="submit"
            >
              {isApplying ? (
                <span
                  aria-hidden="true"
                  className="size-3.5 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
                />
              ) : null}
              Apply filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
