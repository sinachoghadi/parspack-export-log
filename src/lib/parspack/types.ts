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

export type ParspackRequestOptions = {
  token: string;
  path: string;
  method?: HttpMethod;
  query?: ParspackQuery;
  body?: unknown;
  signal?: AbortSignal;
};
