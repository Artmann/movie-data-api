export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

export class ValidationError extends ApiError {
  constructor(details: Record<string, string>, message = "Validation error") {
    super(400, message, details);
  }
}

export class UpstreamError extends ApiError {
  constructor(message = "Upstream service error") {
    super(502, message);
  }
}
