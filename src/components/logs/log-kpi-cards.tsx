import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAccessLogSummary } from "@/lib/parspack/access-log-summary";
import type { AccessLog } from "@/lib/parspack/types";

type LogKpiCardsProps = {
  logs: AccessLog[];
  isLoading?: boolean;
  isFetching?: boolean;
};

type KpiTone = "accent" | "neutral" | "warning" | "danger";

type KpiCardProps = {
  label: string;
  value: string;
  tone: KpiTone;
  isFetching: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const toneClasses: Record<KpiTone, { icon: string; line: string }> = {
  accent: { icon: "bg-accent-soft text-accent", line: "bg-accent" },
  neutral: {
    icon: "bg-surface-secondary text-muted-foreground",
    line: "bg-border",
  },
  warning: { icon: "bg-warning-soft text-warning", line: "bg-warning" },
  danger: { icon: "bg-danger-soft text-danger", line: "bg-danger" },
};

function KpiIcon({ tone }: { tone: KpiTone }) {
  const toneClass = toneClasses[tone].icon;

  return (
    <span
      aria-hidden="true"
      className={`flex size-9 items-center justify-center rounded-[var(--radius-md)] ${toneClass}`}
    >
      <svg className="size-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 16.5 8.2 12l3.1 3 5.8-7M16 8h1.1v1.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

function KpiCard({ label, value, tone, isFetching }: KpiCardProps) {
  return (
    <Card className="relative min-h-40 overflow-hidden shadow-[0_10px_30px_rgba(24,24,27,0.025)]">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 ${toneClasses[tone].line}`}
      />
      <CardContent className="flex h-full min-h-40 flex-col justify-between p-5 pt-5 sm:p-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-1 text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <KpiIcon tone={tone} />
        </div>
        <div className="mt-6">
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Current page</span>
            {isFetching ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5" role="status">
                  <span className="size-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
                  Updating
                </span>
              </>
            ) : null}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiCardSkeleton() {
  return (
    <Card
      aria-label="Loading current-page metric"
      className="min-h-40"
      role="status"
    >
      <CardContent className="min-h-40 p-5 pt-5 sm:p-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="mt-1 h-3 w-24" />
          <Skeleton className="size-9 rounded-[var(--radius-md)] bg-surface-secondary" />
        </div>
        <Skeleton className="mt-8 h-8 w-20 rounded-lg" />
        <Skeleton className="mt-3 h-2.5 w-16 bg-surface-secondary" />
      </CardContent>
    </Card>
  );
}

export function LogKpiCards({
  logs,
  isLoading = false,
  isFetching = false,
}: LogKpiCardsProps) {
  const summary = calculateAccessLogSummary(logs);
  const metrics = [
    {
      label: "Total Requests",
      value: numberFormatter.format(summary.totalRequests),
      tone: "accent" as const,
    },
    {
      label: "Googlebot Requests",
      value: numberFormatter.format(summary.googlebotRequests),
      tone: "neutral" as const,
    },
    {
      label: "4xx Responses",
      value: numberFormatter.format(summary.clientErrors),
      tone: "warning" as const,
    },
    {
      label: "5xx Responses",
      value: numberFormatter.format(summary.serverErrors),
      tone: "danger" as const,
    },
    {
      label: "Average Response Time",
      value:
        summary.averageResponseTimeMs === null
          ? "—"
          : `${numberFormatter.format(summary.averageResponseTimeMs)} ms`,
      tone: "accent" as const,
    },
  ];

  return (
    <section aria-labelledby="log-summary-title">
      <h2 id="log-summary-title" className="sr-only">
        Current page access log summary
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }, (_, index) => (
              <KpiCardSkeleton key={index} />
            ))
          : metrics.map((metric) => (
              <KpiCard
                key={metric.label}
                isFetching={isFetching}
                label={metric.label}
                tone={metric.tone}
                value={metric.value}
              />
            ))}
      </div>
    </section>
  );
}
