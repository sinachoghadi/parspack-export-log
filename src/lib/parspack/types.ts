export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type ParspackQuery = Record<string, QueryParamValue>;

export type ParspackApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ParspackApiErrorPayload = {
  success?: false;
  message?: string;
  errors?: unknown[];
};

export type ParspackZone = {
  uuid: string;
  target_domain: string;
  id?: string | number;
  status?: string;
  plan?: string;
};

export type AccessLogMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE";

export type AccessLogStep = 10 | 25 | 50 | 100;

export type AccessLogQueryParams = {
  page?: number;
  step?: AccessLogStep;
  from?: string;
  to?: string;
  uri?: string;
  status_code?: number;
  wcdn_state?: string;
  user_agent?: string;
  method?: AccessLogMethod;
  ray_id?: string;
  target_domain?: string;
};

export type NormalizedAccessLogQueryParams = {
  page: number;
  step: AccessLogStep;
  from?: string;
  to?: string;
  uri?: string;
  status_code?: number;
  wcdn_state?: string;
  user_agent?: string;
  method?: AccessLogMethod;
  ray_id?: string;
  target_domain?: string;
};

export type ParspackAccessLogRecord = {
  _id?: string;
  date?: string;
  timestamp: string;
  hosting_wait_duration?: number;
  status_code: number;
  scheme?: string;
  ray_id?: string;
  edge_id?: number;
  source?: string;
  target_domain?: string;
  wcdn_state?: string;
  log_type?: string;
  byte_in?: number;
  byte_out?: number;
  remote_ip?: string;
  zid?: number;
  connection_duration?: number;
  delivery_duration?: number;
  total_duration?: number;
  host?: string;
  user_host?: string;
  user_agent?: string;
  method?: string;
  uri?: string;
  level?: number;
  facility?: string;
};

export type AccessLog = {
  id: string;
  timestamp: string;
  method: string;
  uri: string;
  statusCode: number;
  remoteIp: string | null;
  userAgent: string | null;
  targetDomain: string | null;
  cacheState: string | null;
  rayId: string | null;
  scheme: string | null;
  totalDurationMs: number | null;
  hostingWaitDurationMs: number | null;
  connectionDurationMs: number | null;
  deliveryDurationMs: number | null;
  bytesIn: number | null;
  bytesOut: number | null;
  edgeId: number | null;
};

export type AccessLogPage = {
  records: AccessLog[];
  page: number;
  step: AccessLogStep;
};

export type ParspackRequestOptions = {
  token: string;
  path: string;
  method?: HttpMethod;
  query?: ParspackQuery;
  body?: unknown;
  signal?: AbortSignal;
};
