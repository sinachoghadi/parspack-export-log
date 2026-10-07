import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AccessLogsSection } from "@/components/logs/access-logs-section";
import { Badge } from "@/components/ui/badge";
import { DomainSelector } from "@/components/zones/domain-selector";

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

        <AccessLogsSection />
      </div>
    </DashboardShell>
  );
}
