import type { AccessLog } from "@/lib/parspack/types";

export type ExportAccessLogsOptions = {
  logs: AccessLog[];
  domain?: string | null;
  from?: string;
  to?: string;
};

export type AccessLogExportRow = {
  Timestamp: string;
  Method: string;
  "Status Code": number;
  URI: string;
  "Remote IP": string;
  "User Agent": string;
  "Cache State": string;
  "Response Time (ms)": number | "";
  "Connection Duration (ms)": number | "";
  "Hosting Wait Duration (ms)": number | "";
  "Delivery Duration (ms)": number | "";
  "Bytes In": number | "";
  "Bytes Out": number | "";
  "Ray ID": string;
  "Edge ID": number | "";
  Scheme: string;
  "Target Domain": string;
};

export const ACCESS_LOG_EXPORT_COLUMNS: (keyof AccessLogExportRow)[] = [
  "Timestamp",
  "Method",
  "Status Code",
  "URI",
  "Remote IP",
  "User Agent",
  "Cache State",
  "Response Time (ms)",
  "Connection Duration (ms)",
  "Hosting Wait Duration (ms)",
  "Delivery Duration (ms)",
  "Bytes In",
  "Bytes Out",
  "Ray ID",
  "Edge ID",
  "Scheme",
  "Target Domain",
];

const COLUMN_WIDTHS = [
  20, 10, 12, 50, 18, 70, 14, 20, 24, 26, 22, 14, 14, 32, 12, 12, 28,
];

function emptyIfNull<T extends string | number>(value: T | null): T | "" {
  return value ?? "";
}

export function formatExportTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function accessLogsToExportRows(
  logs: AccessLog[],
): AccessLogExportRow[] {
  return logs.map((log) => ({
    Timestamp: formatExportTimestamp(log.timestamp),
    Method: log.method,
    "Status Code": log.statusCode,
    URI: log.uri,
    "Remote IP": emptyIfNull(log.remoteIp),
    "User Agent": emptyIfNull(log.userAgent),
    "Cache State": emptyIfNull(log.cacheState),
    "Response Time (ms)": emptyIfNull(log.totalDurationMs),
    "Connection Duration (ms)": emptyIfNull(log.connectionDurationMs),
    "Hosting Wait Duration (ms)": emptyIfNull(log.hostingWaitDurationMs),
    "Delivery Duration (ms)": emptyIfNull(log.deliveryDurationMs),
    "Bytes In": emptyIfNull(log.bytesIn),
    "Bytes Out": emptyIfNull(log.bytesOut),
    "Ray ID": emptyIfNull(log.rayId),
    "Edge ID": emptyIfNull(log.edgeId),
    Scheme: emptyIfNull(log.scheme),
    "Target Domain": emptyIfNull(log.targetDomain),
  }));
}

export function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildAccessLogsFilename({
  domain,
  from,
  to,
}: Omit<ExportAccessLogsOptions, "logs">): string {
  const filenameParts = ["parspack-access-logs", domain, from, to]
    .filter((part): part is string => Boolean(part?.trim()))
    .map(sanitizeFilenamePart)
    .filter(Boolean);

  return `${filenameParts.join("-")}.xlsx`;
}

export async function exportAccessLogsToExcel({
  logs,
  domain,
  from,
  to,
}: ExportAccessLogsOptions): Promise<void> {
  if (logs.length === 0) {
    throw new Error("Cannot export an empty access-log page.");
  }

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(accessLogsToExportRows(logs), {
    header: ACCESS_LOG_EXPORT_COLUMNS,
  });

  worksheet["!cols"] = COLUMN_WIDTHS.map((wch) => ({ wch }));

  if (worksheet["!ref"]) {
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Access Logs");
  XLSX.writeFile(workbook, buildAccessLogsFilename({ domain, from, to }), {
    compression: true,
  });
}
