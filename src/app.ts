import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { createRouter } from "./lib/create-router";
import { errorHandler } from "./middleware/error-handler";
import health from "./routes/health";
import movies from "./routes/movies";
import shows from "./routes/shows";

export function createApp() {
  const app = createRouter();

  app.use("*", logger());
  app.use("*", cors({ origin: "*" }));

  app.route("/", health);
  app.route("/movies", movies);
  app.route("/shows", shows);

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "0.1.0",
      title: "movie-data-api",
      description: "Cached TMDB facade — public, unauthenticated.",
    },
  });

  app.get(
    "/docs",
    apiReference({
      url: "/openapi.json",
    }),
  );

  app.onError(errorHandler);

  return app;
}
