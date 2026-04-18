import { createRoute } from "@hono/zod-openapi";
import { NotFoundError } from "../errors/api-error";
import { createRouter } from "../lib/create-router";
import { ErrorSchema } from "../schemas/error.schema";
import {
  IdParamSchema,
  MovieSchema,
  MovieSearchResponseSchema,
  SearchQuerySchema,
} from "../schemas/movie.schema";
import * as metadata from "../services/metadata";

const DETAILS_CACHE = "public, max-age=604800";
const SEARCH_CACHE = "public, max-age=86400";

const searchRoute = createRoute({
  method: "get",
  path: "/search",
  tags: ["movies"],
  summary: "Search movies by title",
  request: { query: SearchQuerySchema },
  responses: {
    200: {
      description: "Ranked movie results (empty array on no match)",
      content: { "application/json": { schema: MovieSearchResponseSchema } },
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
  tags: ["movies"],
  summary: "Get movie details",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Movie details including trailer URL",
      content: { "application/json": { schema: MovieSchema } },
    },
    404: {
      description: "Movie not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
    502: {
      description: "Upstream error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const movies = createRouter();

movies.openapi(searchRoute, async (c) => {
  const { title, year } = c.req.valid("query");
  const { value, cacheStatus } = await metadata.searchMovies(c.env, title, year);
  c.header("Cache-Control", SEARCH_CACHE);
  c.header("X-Cache", cacheStatus);
  return c.json({ results: value }, 200);
});

movies.openapi(detailsRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { value, cacheStatus } = await metadata.fetchMovieDetails(c.env, id);
  if (!value) throw new NotFoundError(`Movie ${id} not found`);
  c.header("Cache-Control", DETAILS_CACHE);
  c.header("X-Cache", cacheStatus);
  return c.json(value, 200);
});

export default movies;
