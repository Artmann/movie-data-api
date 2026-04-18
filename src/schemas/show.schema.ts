import { z } from "@hono/zod-openapi";

export const ShowSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    year: z.number().int().nullable(),
    overview: z.string(),
    genres: z.array(z.string()),
    rating: z.number().nullable(),
    posterUrl: z.string().url().nullable(),
    backdropUrl: z.string().url().nullable(),
    trailerUrl: z.string().url().nullable(),
    numberOfSeasons: z.number().int(),
  })
  .openapi("Show");

export const ShowSearchResponseSchema = z
  .object({
    results: z.array(ShowSchema),
  })
  .openapi("ShowSearchResponse");

export const EpisodeSchema = z
  .object({
    episodeNumber: z.number().int(),
    title: z.string(),
    overview: z.string(),
    runtime: z.number().int().nullable(),
    stillUrl: z.string().url().nullable(),
  })
  .openapi("Episode");

export const SeasonSchema = z
  .object({
    seasonNumber: z.number().int(),
    name: z.string(),
    overview: z.string(),
    posterUrl: z.string().url().nullable(),
    episodes: z.array(EpisodeSchema),
  })
  .openapi("Season");

export const SeasonPathParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      param: { name: "id", in: "path" },
      example: "1399",
    }),
  seasonNumber: z.coerce
    .number()
    .int()
    .min(0)
    .openapi({
      param: { name: "seasonNumber", in: "path" },
      example: 1,
    }),
});
