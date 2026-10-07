import {
  ParspackApiError,
  ParspackNetworkError,
} from "@/lib/parspack/errors";

export function getParspackErrorMessage(
  error: unknown,
  fallback = "Something went wrong while loading data.",
): string {
  if (error instanceof ParspackApiError) {
    if (error.status === 401) {
      return "Your API token is invalid or expired.";
    }

    if (error.status === 403) {
      return "Your API token does not have permission to access this resource.";
    }

    if (error.status === 404) {
      return "The requested Parspack resource was not found.";
    }

    if (error.status === 429) {
      return "Parspack rate limit reached. Please try again shortly.";
    }

    if (error.status >= 500) {
      return "Parspack is temporarily unavailable. Please try again.";
    }
  }

  if (error instanceof ParspackNetworkError) {
    return "Unable to connect to Parspack. Check your connection and try again.";
  }

  return fallback;
}
