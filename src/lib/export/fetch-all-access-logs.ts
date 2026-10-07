import { getAccessLogs } from "@/lib/parspack/access-logs";
import type {
  AccessLog,
  AccessLogQueryParams,
} from "@/lib/parspack/types";

export const ALL_LOGS_EXPORT_PAGE_SIZE = 100;
export const MAX_EXPORT_PAGES = 500;
export const MAX_EXPORT_RECORDS = 50_000;

export type ExportProgress = {
  pagesFetched: number;
  recordsFetched: number;
};

type FetchAllAccessLogsOptions = {
  token: string;
  zoneUuid: string;
  filters: AccessLogQueryParams;
  signal?: AbortSignal;
  onProgress?: (progress: ExportProgress) => void;
};

export class AccessLogExportLimitError extends Error {
  constructor() {
    super("Export stopped because the result set is too large.");
    this.name = "AccessLogExportLimitError";
  }
}

export function getFilterOnlyAccessLogParams(
  params: AccessLogQueryParams,
): Omit<AccessLogQueryParams, "page" | "step"> {
  const filters = { ...params };

  delete filters.page;
  delete filters.step;

  return filters;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }
}

export async function fetchAllAccessLogs({
  token,
  zoneUuid,
  filters,
  signal,
  onProgress,
}: FetchAllAccessLogsOptions): Promise<AccessLog[]> {
  const filterOnlyParams = getFilterOnlyAccessLogParams(filters);
  const allLogs: AccessLog[] = [];

  for (let page = 1; page <= MAX_EXPORT_PAGES; page += 1) {
    throwIfAborted(signal);

    const result = await getAccessLogs({
      token,
      zoneUuid,
      params: {
        ...filterOnlyParams,
        page,
        step: ALL_LOGS_EXPORT_PAGE_SIZE,
      },
      signal,
    });

    if (allLogs.length + result.records.length > MAX_EXPORT_RECORDS) {
      throw new AccessLogExportLimitError();
    }

    allLogs.push(...result.records);
    onProgress?.({
      pagesFetched: page,
      recordsFetched: allLogs.length,
    });

    if (result.records.length < ALL_LOGS_EXPORT_PAGE_SIZE) {
      return allLogs;
    }
  }

  throw new AccessLogExportLimitError();
}
