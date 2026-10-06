type ParspackApiErrorOptions = {
  status: number;
  statusText: string;
  errors?: unknown[];
};

export class ParspackApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly errors?: unknown[];

  constructor(
    message: string,
    { errors, status, statusText }: ParspackApiErrorOptions,
  ) {
    super(message);
    this.name = "ParspackApiError";
    this.status = status;
    this.statusText = statusText;
    this.errors = errors;
  }
}

export class ParspackNetworkError extends Error {
  constructor(message = "Unable to reach the Parspack API.") {
    super(message);
    this.name = "ParspackNetworkError";
  }
}
