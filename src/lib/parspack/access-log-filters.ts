import type {
  AccessLogMethod,
  AccessLogQueryParams,
} from "@/lib/parspack/types";

export type AccessLogFilterDraft = {
  from: string;
  to: string;
  uri: string;
  statusCode: string;
  method: "" | AccessLogMethod;
  userAgent: string;
  wcdnState: string;
  rayId: string;
};

export type AccessLogFilterErrors = {
  dateRange?: string;
  statusCode?: string;
};

export type AccessLogFilterResult =
  | { success: true; params: AccessLogQueryParams }
  | { success: false; errors: AccessLogFilterErrors };

export const EMPTY_ACCESS_LOG_FILTERS: AccessLogFilterDraft = {
  from: "",
  to: "",
  uri: "",
  statusCode: "",
  method: "",
  userAgent: "",
  wcdnState: "",
  rayId: "",
};

function trimOptional(value: string): string | undefined {
  return value.trim() || undefined;
}

export function buildAccessLogQueryParams(
  filters: AccessLogFilterDraft,
): AccessLogFilterResult {
  const from = trimOptional(filters.from);
  const to = trimOptional(filters.to);
  const statusCodeValue = filters.statusCode.trim();
  const errors: AccessLogFilterErrors = {};

  if (from && to && from > to) {
    errors.dateRange = "From date cannot be after To date.";
  }

  let statusCode: number | undefined;

  if (statusCodeValue) {
    const parsedStatusCode = Number(statusCodeValue);

    if (
      !/^\d+$/.test(statusCodeValue) ||
      !Number.isInteger(parsedStatusCode) ||
      parsedStatusCode < 1 ||
      parsedStatusCode > 65535
    ) {
      errors.statusCode =
        "Status code must be an integer between 1 and 65535.";
    } else {
      statusCode = parsedStatusCode;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const uri = trimOptional(filters.uri);
  const userAgent = trimOptional(filters.userAgent);
  const wcdnState = trimOptional(filters.wcdnState);
  const rayId = trimOptional(filters.rayId);

  return {
    success: true,
    params: {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(uri ? { uri } : {}),
      ...(statusCode !== undefined ? { status_code: statusCode } : {}),
      ...(filters.method ? { method: filters.method } : {}),
      ...(userAgent ? { user_agent: userAgent } : {}),
      ...(wcdnState ? { wcdn_state: wcdnState } : {}),
      ...(rayId ? { ray_id: rayId } : {}),
    },
  };
}
