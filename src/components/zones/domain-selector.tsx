"use client";

import { Button } from "@/components/ui/button";
import { useZones } from "@/hooks/use-zones";
import { ParspackApiError } from "@/lib/parspack/errors";
import { useActiveZone } from "@/providers/active-zone-provider";
import { useTokenSession } from "@/providers/token-session-provider";

function getZonesErrorMessage(error: Error | null): string {
  if (error instanceof ParspackApiError) {
    if (error.status === 401) {
      return "Your API token is invalid or expired.";
    }

    if (error.status === 403) {
      return "Your API token does not have permission to access CDN zones.";
    }
  }

  return "Unable to load CDN domains.";
}

export function DomainSelector() {
  const { hasToken } = useTokenSession();
  const { activeZone, setActiveZone } = useActiveZone();
  const { data: zones = [], error, isError, isPending, refetch } = useZones();

  if (!hasToken) {
    return (
      <div className="w-full sm:w-72">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          CDN domain
        </p>
        <div className="flex h-10 items-center rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-muted-foreground opacity-70">
          Connect account
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full rounded-[var(--radius-md)] border border-danger/20 bg-danger-soft p-3 sm:w-80">
        <p className="text-sm font-medium text-danger">{getZonesErrorMessage(error)}</p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const isEmpty = !isPending && zones.length === 0;

  return (
    <div className="w-full sm:w-72">
      <label
        htmlFor="domain-selector"
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        CDN domain
      </label>
      <div className="relative">
        <select
          id="domain-selector"
          value={activeZone?.uuid ?? ""}
          disabled={isPending || isEmpty}
          onChange={(event) => {
            const selectedZone = zones.find(
              (zone) => zone.uuid === event.target.value,
            );

            if (selectedZone) {
              setActiveZone(selectedZone);
            }
          }}
          aria-describedby="domain-selector-status"
          className="h-10 w-full appearance-none truncate rounded-[var(--radius-sm)] border border-border bg-surface py-2 pl-3 pr-9 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-muted-foreground disabled:opacity-70"
        >
          {isPending ? (
            <option value="">Loading domains...</option>
          ) : isEmpty ? (
            <option value="">No CDN domains found</option>
          ) : (
            <>
              {!activeZone ? <option value="">Select a domain</option> : null}
              {zones.map((zone) => (
                <option key={zone.uuid} value={zone.uuid}>
                  {zone.target_domain}
                </option>
              ))}
            </>
          )}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="m8 10 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p id="domain-selector-status" className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {isPending
          ? "Loading domains..."
          : isEmpty
            ? "No CDN domains found for this API token."
            : activeZone
              ? "Active CDN workspace"
              : "Choose a CDN domain"}
      </p>
    </div>
  );
}
