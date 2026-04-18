import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createMockEnv } from "../helpers/env";
import { mockTmdbFetch, pathIs, pathStarts } from "../helpers/fetch-mock";
import { gotDetails, gotSearch, gotSeason1 } from "../helpers/tmdb-fixtures";

describe("GET /shows/search", () => {
  it("returns transformed show results", async () => {
    mockTmdbFetch([{ match: pathIs("/3/search/tv"), body: gotSearch }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/search?title=thrones"), env);

    expect(res.status).toBe(200);
    expect(res.headers.get("x-cache")).toBe("MISS");

    const body = (await res.json()) as { results: Array<Record<string, unknown>> };
    expect(body.results).toHaveLength(1);
    expect(body.results[0]).toMatchObject({
      id: "1399",
      title: "Game of Thrones",
      year: 2011,
      numberOfSeasons: 0,
    });
  });

  it("returns 400 when title is missing", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/search"), env);

    expect(res.status).toBe(400);
  });
});

describe("GET /shows/{id}", () => {
  it("returns transformed show details with trailer", async () => {
    mockTmdbFetch([{ match: pathIs("/3/tv/1399"), body: gotDetails }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/1399"), env);

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("public, max-age=604800");

    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      id: "1399",
      title: "Game of Thrones",
      year: 2011,
      genres: ["Sci-Fi & Fantasy", "Drama"],
      numberOfSeasons: 8,
      trailerUrl: "https://www.youtube.com/watch?v=giYeaKsXnsI",
    });
    expect(body.runtime).toBeUndefined();
  });

  it("returns 404 on unknown id", async () => {
    mockTmdbFetch([]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/999999"), env);

    expect(res.status).toBe(404);
  });
});

describe("GET /shows/{id}/seasons/{seasonNumber}", () => {
  it("returns season with full episode list", async () => {
    mockTmdbFetch([{ match: pathIs("/3/tv/1399/season/1"), body: gotSeason1 }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/1399/seasons/1"), env);

    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      seasonNumber: number;
      episodes: Array<Record<string, unknown>>;
    };
    expect(body.seasonNumber).toBe(1);
    expect(body.episodes).toHaveLength(2);
    expect(body.episodes[0]).toMatchObject({
      episodeNumber: 1,
      title: "Winter Is Coming",
      runtime: 62,
      stillUrl: "https://image.tmdb.org/t/p/w300/ep1.jpg",
    });
  });

  it("returns 404 when season not found", async () => {
    mockTmdbFetch([{ match: pathStarts("/3/tv/1399/season/"), body: null, status: 404 }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/1399/seasons/99"), env);

    expect(res.status).toBe(404);
  });

  it("returns 400 when seasonNumber is not a number", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/shows/1399/seasons/abc"), env);

    expect(res.status).toBe(400);
  });
});
