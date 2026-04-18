import { OpenAPIHono } from "@hono/zod-openapi";
import { ValidationError } from "../errors/api-error";

export function createRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({
    defaultHook: (result, _c) => {
      if (!result.success) {
        const details: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path.join(".") || "input";
          details[path] = issue.message;
        }
        throw new ValidationError(details);
      }
    },
  });
}
