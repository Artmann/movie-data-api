import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ApiError } from "../errors/api-error";

export function errorHandler(err: Error, c: Context): Response {
  c.header("Cache-Control", "no-store");

  if (err instanceof ApiError) {
    return c.json(
      {
        error: {
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      err.statusCode as ContentfulStatusCode,
    );
  }

  console.error("unhandled error:", err);
  return c.json({ error: { message: "Internal server error" } }, 500);
}
