import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../lib/create-router";

const HealthSchema = z.object({ ok: z.literal(true) }).openapi("Health");

const healthRoute = createRoute({
  method: "get",
  path: "/healthz",
  tags: ["system"],
  summary: "Health check",
  responses: {
    200: {
      description: "Service is up",
      content: { "application/json": { schema: HealthSchema } },
    },
  },
});

const health = createRouter();

health.openapi(healthRoute, (c) => c.json({ ok: true as const }, 200));

export default health;
