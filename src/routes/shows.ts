import { createRoute } from "@hono/zod-openapi";
import { NotFoundError } from "../errors/api-error";
import { createRouter } from "../lib/create-router";
import { ErrorSchema } from "../schemas/error.schema";
import { IdParamSchema, SearchQuerySchema } from "../schemas/movie.schema";
import {
  SeasonPathParamSchema,
  SeasonSchema,
  ShowSchema,
  ShowSearchResponseSchema,
} from "../schemas/show.schema";
import * as metadata from "../services/metadata";

const DETAILS_CACHE = "public, max-age=604800";
const SEARCH_CACHE = "public, max-age=86400";

const searchRoute = createRoute({
  method: "get",
  path: "/search",
  tags: ["shows"],
  summary: "Search shows by title",
  request: { query: SearchQuerySchema },
  responses: {
    200: {
      description: "Ranked show results (empty array on no match)",
      content: { "application/json": { schema: ShowSearchResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    502: {
      description: "Upstream error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const detailsRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["shows"],
  summary: "Get show details",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Show details including trailer URL and season count",
      content: { "application/json": { schema: ShowSchema } },
    },
    404: {
      description: "Show not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
    502: {
      description: "Upstream error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const seasonRoute = createRoute({
  method: "get",
  path: "/{id}/seasons/{seasonNumber}",
  tags: ["shows"],
  summary: "Get season details with full episode list",
  request: { params: SeasonPathParamSchema },
  responses: {
    200: {
      description: "Season details with episodes",
      content: { "application/json": { schema: SeasonSchema } },
    },
    404: {
      description: "Show or season not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
    502: {
      description: "Upstream error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const shows = createRouter();

shows.openapi(searchRoute, async (c) => {
  const { title, year } = c.req.valid("query");
  const { value, cacheStatus } = await metadata.searchShows(c.env, title, year);
  c.header("Cache-Control", SEARCH_CACHE);
  c.header("X-Cache", cacheStatus);
  return c.json({ results: value }, 200);
});

shows.openapi(detailsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { value, cacheStatus } = await metadata.fetchShowDetails(c.env, id);
  if (!value) throw new NotFoundError(`Show ${id} not found`);
  c.header("Cache-Control", DETAILS_CACHE);
  c.header("X-Cache", cacheStatus);
  return c.json(value, 200);
});

shows.openapi(seasonRoute, async (c) => {
  const { id, seasonNumber } = c.req.valid("param");
  const { value, cacheStatus } = await metadata.fetchSeasonDetails(c.env, id, seasonNumber);
  if (!value) throw new NotFoundError(`Season ${seasonNumber} of show ${id} not found`);
  c.header("Cache-Control", DETAILS_CACHE);
  c.header("X-Cache", cacheStatus);
  return c.json(value, 200);
});

export default shows;
