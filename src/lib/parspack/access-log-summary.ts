import type { AccessLog } from "@/lib/parspack/types";

export type AccessLogSummary = {
  totalRequests: number;
  googlebotRequests: number;
  clientErrors: number;
  serverErrors: number;
  averageResponseTimeMs: number | null;
};

export function calculateAccessLogSummary(
  logs: AccessLog[],
): AccessLogSummary {
  let googlebotRequests = 0;
  let clientErrors = 0;
  let serverErrors = 0;
  let durationTotal = 0;
  let durationCount = 0;

  for (const log of logs) {
    if (log.userAgent?.toLowerCase().includes("googlebot")) {
      googlebotRequests += 1;
    }

    if (log.statusCode >= 400 && log.statusCode < 500) {
      clientErrors += 1;
    }

    if (log.statusCode >= 500 && log.statusCode < 600) {
      serverErrors += 1;
    }

    if (log.totalDurationMs !== null) {
      durationTotal += log.totalDurationMs;
      durationCount += 1;
    }
  }

  return {
    totalRequests: logs.length,
    googlebotRequests,
    clientErrors,
    serverErrors,
    averageResponseTimeMs:
      durationCount > 0 ? Math.round(durationTotal / durationCount) : null,
  };
}
