import Link from "next/link";

import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";

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

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden w-56 sm:block lg:w-64">
            <label htmlFor="dashboard-search" className="sr-only">
              Search access logs
            </label>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <Input id="dashboard-search" type="search" placeholder="Search..." className="pl-9" />
          </div>

          <IconButton aria-label="Notifications are not available yet" disabled>
            <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" fill="none">
              <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 5 2 5 2 6.5h-15c0-1.5 2-1.5 2-6.5ZM10 19h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          <div
            className="flex size-10 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-white"
            aria-label="Local user"
            role="img"
          >
            LU
          </div>
        </div>
      </div>

      <div className="relative mt-4 sm:hidden">
        <label htmlFor="mobile-dashboard-search" className="sr-only">
          Search access logs
        </label>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <Input id="mobile-dashboard-search" type="search" placeholder="Search..." className="pl-9" />
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
