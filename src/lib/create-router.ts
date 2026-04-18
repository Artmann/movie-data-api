import { OpenAPIHono } from "@hono/zod-openapi";
import type { $ZodIssue } from "zod/v4/core";
import { ValidationError } from "../errors/api-error";

export function createRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({
    defaultHook: (result, _c) => {
      if (!result.success) {
        const details: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path.join(".") || "input";
          details[path] = friendlyMessage(issue);
        }
        throw new ValidationError(details);
      }
    },
  });
}

function friendlyMessage(issue: $ZodIssue): string {
  if (issue.code === "invalid_type" && issue.input === undefined) {
    return "required";
  }
  return issue.message;
}
