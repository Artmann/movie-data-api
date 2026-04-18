import { z } from "@hono/zod-openapi";

export const MovieSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    year: z.number().int().nullable(),
    overview: z.string(),
    runtime: z.number().int().nullable(),
    genres: z.array(z.string()),
    rating: z.number().nullable(),
    posterUrl: z.string().url().nullable(),
    backdropUrl: z.string().url().nullable(),
    trailerUrl: z.string().url().nullable(),
  })
  .openapi("Movie");

export const MovieSearchResponseSchema = z
  .object({
    results: z.array(MovieSchema),
  })
  .openapi("MovieSearchResponse");

export const SearchQuerySchema = z.object({
  title: z
    .string()
    .min(1)
    .openapi({
      param: { name: "title", in: "query" },
      example: "The Matrix",
    }),
  year: z.coerce
    .number()
    .int()
    .optional()
    .openapi({
      param: { name: "year", in: "query" },
      example: 1999,
    }),
});

export const IdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      param: { name: "id", in: "path" },
      example: "603",
    }),
});
