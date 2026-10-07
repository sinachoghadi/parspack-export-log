import Link from "next/link";

import { ParspackConnectionControl } from "@/components/auth/parspack-connection-control";

const mobileNavigation = ["Overview", "Access Logs", "Exports"];

export function Topbar() {
  return (
    <header className="border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow-sm md:hidden">
            P
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">CDN Access Logs</p>
            <p className="truncate text-xs text-muted-foreground">Parspack Log Explorer</p>
          </div>
        </div>

        <ParspackConnectionControl />
      </div>

      <nav aria-label="Mobile navigation" className="mt-4 flex gap-1 overflow-x-auto md:hidden">
        {mobileNavigation.map((item) => {
          const active = item === "Access Logs";

          return (
            <Link
              key={item}
              href="/"
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
              }`}
            >
              {item}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
