import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccessLogsSection } from "@/components/logs/access-logs-section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { DomainSelector } from "@/components/zones/domain-selector";

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
        <section
          aria-labelledby="page-title"
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
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
          </div>
          <DomainSelector />
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

        <AccessLogsSection />
      </div>
    </DashboardShell>
  );
}
