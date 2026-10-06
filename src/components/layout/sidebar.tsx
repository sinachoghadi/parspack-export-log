import Link from "next/link";
import type { ReactNode } from "react";

type NavigationItem = {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
};

const iconClassName = "size-[18px]";

const navigationItems: NavigationItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: (
      <svg aria-hidden="true" className={iconClassName} viewBox="0 0 24 24" fill="none">
        <path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Access Logs",
    href: "/",
    active: true,
    icon: (
      <svg aria-hidden="true" className={iconClassName} viewBox="0 0 24 24" fill="none">
        <path d="M8 7h11M8 12h11M8 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Exports",
    href: "/",
    icon: (
      <svg aria-hidden="true" className={iconClassName} viewBox="0 0 24 24" fill="none">
        <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function NavigationLink({ active, href, icon, label }: NavigationItem) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
        active
          ? "bg-accent-soft text-accent"
          : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
      }`}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="hidden xl:inline">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden border-r border-border bg-surface-secondary/50 md:flex md:min-h-full md:flex-col">
      <div className="flex h-[76px] items-center gap-3 border-b border-border px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow-sm">
          P
        </span>
        <div className="hidden min-w-0 xl:block">
          <p className="truncate text-sm font-semibold text-foreground">Parspack</p>
          <p className="truncate text-xs text-muted-foreground">Log Explorer</p>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-1.5 p-4 md:px-3 xl:px-4">
        {navigationItems.map((item) => (
          <NavigationLink key={item.label} {...item} />
        ))}
      </nav>

      <nav aria-label="Utility navigation" className="border-t border-border p-4 md:px-3 xl:px-4">
        <NavigationLink
          label="Settings"
          href="/"
          icon={
            <svg aria-hidden="true" className={iconClassName} viewBox="0 0 24 24" fill="none">
              <path d="M9.6 4.4 10.2 3h3.6l.6 1.4 1.4.8 1.5-.2 1.8 3.1-.9 1.2v1.6l.9 1.2-1.8 3.1-1.5-.2-1.4.8-.6 1.4h-3.6l-.6-1.4-1.4-.8-1.5.2-1.8-3.1.9-1.2V9.3l-.9-1.2L6.7 5l1.5.2 1.4-.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="10.1" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          }
        />
      </nav>
    </aside>
  );
}
