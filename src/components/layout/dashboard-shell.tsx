import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type DashboardShellProps = Readonly<{
  children: ReactNode;
}>;

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[0_18px_55px_rgba(24,24,27,0.06)] sm:min-h-[calc(100vh-2rem)] md:grid-cols-[76px_minmax(0,1fr)] lg:min-h-[calc(100vh-3rem)] xl:grid-cols-[230px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <Topbar />
          <main className="bg-surface-secondary/60 px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
