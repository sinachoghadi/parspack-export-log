import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statistics = [
  { label: "Total Requests", tone: "neutral" as const },
  { label: "Crawlers", tone: "accent" as const },
  { label: "4xx Responses", tone: "warning" as const },
  { label: "5xx Responses", tone: "danger" as const },
];

export default function Home() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl">
        <section aria-labelledby="page-title">
          <Badge variant="accent">Local dashboard</Badge>
          <h1
            id="page-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Access Logs
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Inspect and export CDN requests for SEO and infrastructure analysis.
          </p>
        </section>

        <section aria-labelledby="summary-title" className="mt-8">
          <h2 id="summary-title" className="sr-only">
            Access log summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((statistic) => (
              <Card key={statistic.label} className="min-h-36">
                <CardHeader className="flex-row items-start justify-between gap-3">
                  <CardDescription className="mt-0 font-medium">
                    {statistic.label}
                  </CardDescription>
                  <Badge variant={statistic.tone}>Awaiting data</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-tight text-foreground" aria-label="No data available">
                    --
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="access-logs-title" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle id="access-logs-title">Access Logs</CardTitle>
                <CardDescription>
                  Connect your Parspack account to start exploring logs.
                </CardDescription>
              </div>
              <Badge variant="neutral">Not connected</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border bg-surface-secondary px-5 py-10 text-center sm:min-h-72">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none">
                    <path d="M5 5.5h14v13H5v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">No access logs yet</h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                  Account connection and log retrieval will be added in a future step.
                </p>
                <Button className="mt-5" size="sm" disabled>
                  Connect account
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
