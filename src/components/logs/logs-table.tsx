"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { StatusBadge } from "@/components/logs/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAccessLogTimestamp } from "@/lib/parspack/access-log-formatters";
import { getParspackErrorMessage } from "@/lib/parspack/error-message";
import type { AccessLog } from "@/lib/parspack/types";

type LogsTableProps = {
  logs: AccessLog[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
  selectedLogId?: string | null;
  hasActiveFilters?: boolean;
  isRetrying?: boolean;
  onResetFilters?: () => void;
  onRetry?: () => void;
  onSelectLog?: (log: AccessLog) => void;
};

const columns: ColumnDef<AccessLog>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    size: 160,
    cell: ({ row }) => (
      <time
        className="whitespace-nowrap text-sm text-foreground"
        dateTime={row.original.timestamp}
        title={row.original.timestamp}
      >
        {formatAccessLogTimestamp(row.original.timestamp)}
      </time>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
    size: 72,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-foreground">
        {row.original.method || "—"}
      </span>
    ),
  },
  {
    accessorKey: "uri",
    header: "URI",
    size: 220,
    cell: ({ row }) => (
      <span
        className="block max-w-[200px] truncate font-mono text-xs text-foreground"
        title={row.original.uri || undefined}
      >
        {row.original.uri || "—"}
      </span>
    ),
  },
  {
    accessorKey: "statusCode",
    header: "Status",
    size: 80,
    cell: ({ row }) => (
      <StatusBadge statusCode={row.original.statusCode} />
    ),
  },
  {
    accessorKey: "remoteIp",
    header: "Remote IP",
    size: 125,
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-mono text-xs text-foreground">
        {row.original.remoteIp ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "userAgent",
    header: "User Agent",
    size: 270,
    cell: ({ row }) => (
      <span
        className="block max-w-[250px] truncate text-sm text-muted-foreground"
        title={row.original.userAgent ?? undefined}
      >
        {row.original.userAgent ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "cacheState",
    header: "Cache State",
    size: 100,
    cell: ({ row }) =>
      row.original.cacheState ? (
        <Badge variant="neutral">{row.original.cacheState}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "totalDurationMs",
    header: "Response Time",
    size: 120,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-foreground">
        {row.original.totalDurationMs === null
          ? "—"
          : `${row.original.totalDurationMs} ms`}
      </span>
    ),
  },
];

function TableSkeleton() {
  return (
    <div aria-label="Loading access logs" className="overflow-x-auto" role="status">
      <div className="min-w-[1147px]">
        <div className="grid grid-cols-[160px_72px_220px_80px_125px_270px_100px_120px] gap-0 border-b border-border bg-surface-secondary px-4 py-3">
          {columns.map((column, index) => (
            <Skeleton
              key={column.id ?? index}
              className="h-3 w-20"
            />
          ))}
        </div>
        {Array.from({ length: 8 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-[160px_72px_220px_80px_125px_270px_100px_120px] items-center border-b border-border/80 px-4 py-4 last:border-b-0"
          >
            {columns.map((column, columnIndex) => (
              <Skeleton
                key={column.id ?? columnIndex}
                className={`h-3 bg-surface-secondary ${
                  columnIndex === 2 || columnIndex === 5 ? "w-4/5" : "w-3/5"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogsTable({
  logs,
  isLoading = false,
  isFetching = false,
  error = null,
  selectedLogId = null,
  hasActiveFilters = false,
  isRetrying = false,
  onResetFilters,
  onRetry,
  onSelectLog,
}: LogsTableProps) {
  // TanStack Table v8 intentionally returns non-memoizable functions; keep its table instance local.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: logs,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualPagination: true,
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error && logs.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M10.3 3.7 2.8 17a2 2 0 0 0 1.74 3h14.92A2 2 0 0 0 21.2 17L13.7 3.7a1.96 1.96 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          Could not load access logs
        </h3>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          {getParspackErrorMessage(error, "Unable to load access logs. Try again.")}
        </p>
        {onRetry ? (
          <Button
            className="mt-4 min-w-20"
            disabled={isRetrying}
            size="sm"
            variant="secondary"
            onClick={onRetry}
          >
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
        ) : null}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
            <path d="M5 5.5h14v13H5v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No access logs found
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Try adjusting the date range or filters.
        </p>
        {hasActiveFilters && onResetFilters ? (
          <Button
            className="mt-4"
            size="sm"
            variant="secondary"
            onClick={onResetFilters}
          >
            Reset filters
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div aria-busy={isFetching} className="overflow-x-auto">
      <table
        className="min-w-[1147px] table-fixed border-collapse text-left"
        style={{ width: table.getCenterTotalSize() }}
      >
        <caption className="sr-only">
          CDN access logs for the current page and filters. Select a row and
          press Enter or Space to view request details.
        </caption>
        <thead className="bg-surface-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  scope="col"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              aria-selected={
                onSelectLog ? row.original.id === selectedLogId : undefined
              }
              className={`border-b border-border/80 transition-colors last:border-b-0 ${
                onSelectLog
                  ? "cursor-pointer hover:bg-surface-secondary/70 focus-visible:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  : "hover:bg-surface-secondary/70"
              } ${row.original.id === selectedLogId ? "bg-accent-soft/70" : ""}`}
              tabIndex={onSelectLog ? 0 : undefined}
              title={onSelectLog ? "Open request details" : undefined}
              onClick={(event) => {
                if (
                  event.target instanceof HTMLElement &&
                  event.target.closest("button, a, input, select, textarea")
                ) {
                  return;
                }

                event.currentTarget.focus();
                onSelectLog?.(row.original);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectLog?.(row.original);
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3.5 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
