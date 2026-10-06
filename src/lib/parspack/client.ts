import { PARSPACK_API_BASE_URL } from "@/lib/parspack/constants";
import {
  ParspackApiError,
  ParspackNetworkError,
} from "@/lib/parspack/errors";
import type {
  ParspackApiErrorPayload,
  ParspackApiResponse,
  ParspackQuery,
  ParspackRequestOptions,
} from "@/lib/parspack/types";

const DEFAULT_ERROR_MESSAGE = "Parspack API request failed.";
const UNEXPECTED_RESPONSE_MESSAGE =
  "Parspack API returned an unexpected response.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSuccessResponse(
  value: unknown,
): value is ParspackApiResponse<unknown> {
  return (
    isRecord(value) &&
    value.success === true &&
    typeof value.message === "string" &&
    "data" in value
  );
}

function getErrorPayload(value: unknown): ParspackApiErrorPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const message =
    typeof value.message === "string" && value.message.trim()
      ? value.message
      : undefined;
  const errors = Array.isArray(value.errors) ? value.errors : undefined;

  if (value.success !== false && !message && !errors) {
    return null;
  }

  return {
    success: value.success === false ? false : undefined,
    message,
    errors,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json") || contentType.includes("+json")) {
    try {
      return await response.json();
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        return null;
      }

      throw error;
    }
  }

  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function serializeParspackQuery(query?: ParspackQuery): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!query) {
    return searchParams;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  return searchParams;
}

export function buildParspackUrl(
  path: string,
  query?: ParspackQuery,
): URL {
  const relativePath = path.trim().replace(/^\/+/, "");

  if (!relativePath) {
    throw new TypeError("A Parspack API path is required.");
  }

  const url = new URL(`${PARSPACK_API_BASE_URL}/${relativePath}`);
  const searchParams = serializeParspackQuery(query);

  for (const [key, value] of searchParams) {
    url.searchParams.set(key, value);
  }

  return url;
}

export async function parspackRequest<T>({
  token,
  path,
  method = "GET",
  query,
  body,
  signal,
}: ParspackRequestOptions): Promise<T> {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new TypeError("A Parspack API token is required.");
  }

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${trimmedToken}`,
  });

  let requestBody: string | undefined;

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(buildParspackUrl(path, query), {
      method,
      headers,
      body: requestBody,
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new ParspackNetworkError();
  }

  let payload: unknown;

  try {
    payload = await parseResponseBody(response);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new ParspackNetworkError();
  }

  if (!response.ok) {
    const errorPayload = getErrorPayload(payload);

    throw new ParspackApiError(
      errorPayload?.message ?? DEFAULT_ERROR_MESSAGE,
      {
        status: response.status,
        statusText: response.statusText,
        errors: errorPayload?.errors,
      },
    );
  }

  if (payload === null) {
    return undefined as T;
  }

  if (isSuccessResponse(payload)) {
    return payload.data as T;
  }

  const errorPayload = getErrorPayload(payload);

  if (errorPayload?.success === false) {
    throw new ParspackApiError(
      errorPayload.message ?? DEFAULT_ERROR_MESSAGE,
      {
        status: response.status,
        statusText: response.statusText,
        errors: errorPayload.errors,
      },
    );
  }

  throw new ParspackApiError(UNEXPECTED_RESPONSE_MESSAGE, {
    status: response.status,
    statusText: response.statusText,
  });
}
