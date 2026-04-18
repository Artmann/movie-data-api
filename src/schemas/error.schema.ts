import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    error: z.object({
      message: z.string(),
      details: z.record(z.string(), z.string()).optional(),
    }),
  })
  .openapi("Error");

export type ErrorResponse = z.infer<typeof ErrorSchema>;
