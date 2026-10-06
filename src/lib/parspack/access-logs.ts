import { parspackRequest } from "@/lib/parspack/client";
import type {
  AccessLog,
  AccessLogPage,
  AccessLogQueryParams,
  AccessLogStep,
  NormalizedAccessLogQueryParams,
  ParspackAccessLogRecord,
  ParspackQuery,
} from "@/lib/parspack/types";

const DEFAULT_PAGE = 1;
const DEFAULT_STEP: AccessLogStep = 50;
const ACCESS_LOG_STEPS: ReadonlySet<number> = new Set([10, 25, 50, 100]);
const INVALID_RESPONSE_MESSAGE =
  "Parspack API returned invalid access-log data.";

type GetAccessLogsOptions = {
  token: string;
  zoneUuid: string;
  params: AccessLogQueryParams;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || typeof value === "number";
}

function isParspackAccessLogRecord(
  value: unknown,
): value is ParspackAccessLogRecord {
  if (
    !isRecord(value) ||
    typeof value.timestamp !== "string" ||
    typeof value.status_code !== "number"
  ) {
    return false;
  }

  const stringFields = [
    "_id",
    "date",
    "scheme",
    "ray_id",
    "source",
    "target_domain",
    "wcdn_state",
    "log_type",
    "remote_ip",
    "host",
    "user_host",
    "user_agent",
    "method",
    "uri",
    "facility",
  ] as const;
  const numberFields = [
    "hosting_wait_duration",
    "edge_id",
    "byte_in",
    "byte_out",
    "zid",
    "connection_duration",
    "delivery_duration",
    "total_duration",
    "level",
  ] as const;

  return (
    stringFields.every((field) => isOptionalString(value[field])) &&
    numberFields.every((field) => isOptionalNumber(value[field]))
  );
}

function trimOptional(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();

  return trimmedValue || undefined;
}

function toNullableString(value: string | undefined): string | null {
  return trimOptional(value) ?? null;
}

function toNullableNumber(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isAccessLogStep(value: number | undefined): value is AccessLogStep {
  return value !== undefined && ACCESS_LOG_STEPS.has(value);
}

export function normalizeAccessLogQueryParams(
  params: AccessLogQueryParams,
): NormalizedAccessLogQueryParams {
  const requestedPage = Number.isFinite(params.page)
    ? Math.floor(params.page ?? DEFAULT_PAGE)
    : DEFAULT_PAGE;

  return {
    page: Math.max(DEFAULT_PAGE, requestedPage),
    step: isAccessLogStep(params.step) ? params.step : DEFAULT_STEP,
    ...(trimOptional(params.from) ? { from: params.from?.trim() } : {}),
    ...(trimOptional(params.to) ? { to: params.to?.trim() } : {}),
    ...(trimOptional(params.uri) ? { uri: params.uri?.trim() } : {}),
    ...(params.status_code !== undefined
      ? { status_code: params.status_code }
      : {}),
    ...(trimOptional(params.wcdn_state)
      ? { wcdn_state: params.wcdn_state?.trim() }
      : {}),
    ...(trimOptional(params.user_agent)
      ? { user_agent: params.user_agent?.trim() }
      : {}),
    ...(params.method ? { method: params.method } : {}),
    ...(trimOptional(params.ray_id) ? { ray_id: params.ray_id?.trim() } : {}),
    ...(trimOptional(params.target_domain)
      ? { target_domain: params.target_domain?.trim() }
      : {}),
  };
}

export function normalizeAccessLog(
  record: ParspackAccessLogRecord,
): AccessLog {
  const method = record.method?.trim() ?? "";
  const uri = record.uri?.trim() ?? "";
  const rayId = toNullableString(record.ray_id);
  const fallbackId = [
    record.timestamp,
    rayId ?? "",
    method,
    uri,
    record.remote_ip?.trim() ?? "",
    String(record.status_code),
  ].join("|");

  return {
    id: trimOptional(record._id) ?? fallbackId,
    timestamp: record.timestamp,
    method,
    uri,
    statusCode: record.status_code,
    remoteIp: toNullableString(record.remote_ip),
    userAgent: toNullableString(record.user_agent),
    targetDomain: toNullableString(record.target_domain),
    cacheState: toNullableString(record.wcdn_state),
    rayId,
    scheme: toNullableString(record.scheme),
    totalDurationMs: toNullableNumber(record.total_duration),
    hostingWaitDurationMs: toNullableNumber(record.hosting_wait_duration),
    connectionDurationMs: toNullableNumber(record.connection_duration),
    deliveryDurationMs: toNullableNumber(record.delivery_duration),
    bytesIn: toNullableNumber(record.byte_in),
    bytesOut: toNullableNumber(record.byte_out),
    edgeId: toNullableNumber(record.edge_id),
  };
}

function toParspackQuery(
  params: NormalizedAccessLogQueryParams,
): ParspackQuery {
  return { ...params };
}

export async function getAccessLogs({
  token,
  zoneUuid,
  params,
  signal,
}: GetAccessLogsOptions): Promise<AccessLogPage> {
  const normalizedZoneUuid = zoneUuid.trim();

  if (!normalizedZoneUuid) {
    throw new TypeError("A Parspack zone UUID is required to load access logs.");
  }

  const normalizedParams = normalizeAccessLogQueryParams(params);
  const data = await parspackRequest<unknown>({
    token,
    path: `/zones/${encodeURIComponent(normalizedZoneUuid)}/report/access-log`,
    method: "GET",
    query: toParspackQuery(normalizedParams),
    signal,
  });

  if (!isRecord(data)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const rawRecords = data.records;

  if (rawRecords !== undefined && !Array.isArray(rawRecords)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const records = rawRecords ?? [];

  if (!records.every(isParspackAccessLogRecord)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    records: records.map(normalizeAccessLog),
    page: normalizedParams.page,
    step: normalizedParams.step,
  };
}
