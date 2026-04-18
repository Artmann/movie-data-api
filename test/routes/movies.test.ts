import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app";
import { createMockEnv } from "../helpers/env";
import { mockTmdbFetch, pathIs, pathStarts } from "../helpers/fetch-mock";
import { matrixDetails, matrixSearch } from "../helpers/tmdb-fixtures";

describe("GET /movies/search", () => {
  it("returns transformed results", async () => {
    mockTmdbFetch([{ match: pathIs("/3/search/movie"), body: matrixSearch }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/search?title=matrix&year=1999"), env);

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("public, max-age=86400");
    expect(res.headers.get("x-cache")).toBe("MISS");

    const body = (await res.json()) as { results: Array<Record<string, unknown>> };
    expect(body.results).toHaveLength(2);
    expect(body.results[0]).toMatchObject({
      id: "603",
      title: "The Matrix",
      year: 1999,
      posterUrl: "https://image.tmdb.org/t/p/w500/matrix-poster.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/w1280/matrix-backdrop.jpg",
      trailerUrl: null,
      genres: [],
      runtime: null,
    });
  });

  it("returns empty results on no match", async () => {
    mockTmdbFetch([{ match: pathIs("/3/search/movie"), body: { results: [] } }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/search?title=xyzxyz"), env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ results: [] });
  });

  it("returns 400 when title is missing", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/search"), env);

    expect(res.status).toBe(400);
    expect(res.headers.get("cache-control")).toBe("no-store");

    const body = (await res.json()) as { error: { message: string; details: unknown } };
    expect(body.error.message).toBe("Validation error");
    expect(body.error.details).toBeDefined();
  });

  it("returns 400 when title is empty", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/search?title="), env);

    expect(res.status).toBe(400);
  });

  it("caches search results across calls", async () => {
    const fetchMock = mockTmdbFetch([{ match: pathIs("/3/search/movie"), body: matrixSearch }]);

    const app = createApp();
    const { env } = createMockEnv();

    const first = await app.fetch(new Request("http://x/movies/search?title=matrix"), env);
    expect(first.headers.get("x-cache")).toBe("MISS");
    await first.json();

    const second = await app.fetch(new Request("http://x/movies/search?title=matrix"), env);
    expect(second.headers.get("x-cache")).toBe("HIT");
    await second.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache empty results", async () => {
    const fetchMock = mockTmdbFetch([{ match: pathIs("/3/search/movie"), body: { results: [] } }]);

    const app = createApp();
    const { env, store } = createMockEnv();

    await app.fetch(new Request("http://x/movies/search?title=xyzxyz"), env);

    expect(store.size).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("GET /movies/{id}", () => {
  it("returns transformed movie details", async () => {
    mockTmdbFetch([{ match: pathIs("/3/movie/603"), body: matrixDetails }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/603"), env);

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("public, max-age=604800");
    expect(res.headers.get("x-cache")).toBe("MISS");

    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      id: "603",
      title: "The Matrix",
      year: 1999,
      runtime: 136,
      genres: ["Action", "Science Fiction"],
      rating: 8.2,
      posterUrl: "https://image.tmdb.org/t/p/w500/matrix-poster.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/w1280/matrix-backdrop.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    });
  });

  it("requests TMDB with videos appended", async () => {
    const fetchMock = mockTmdbFetch([{ match: pathIs("/3/movie/603"), body: matrixDetails }]);

    const app = createApp();
    const { env } = createMockEnv();
    await app.fetch(new Request("http://x/movies/603"), env);

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("append_to_response=videos");
  });

  it("returns 404 on unknown id", async () => {
    mockTmdbFetch([]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/999999"), env);

    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("no-store");

    const body = (await res.json()) as { error: { message: string } };
    expect(body.error.message).toContain("999999");
  });

  it("returns 502 on TMDB failure with no cache", async () => {
    mockTmdbFetch([{ match: pathStarts("/3/movie/"), body: { status: "err" }, status: 500 }]);

    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/movies/603"), env);

    expect(res.status).toBe(502);
  });

  it("serves stale cache on TMDB failure", async () => {
    const app = createApp();
    const { env } = createMockEnv();

    // Warm the cache
    mockTmdbFetch([{ match: pathIs("/3/movie/603"), body: matrixDetails }]);
    await app.fetch(new Request("http://x/movies/603"), env);

    // Now simulate TMDB failure and verify stale serve
    vi.unstubAllGlobals();
    mockTmdbFetch([{ match: pathStarts("/3/movie/"), body: { err: true }, status: 500 }]);

    // Fast-forward past TTL by overriding Date.now temporarily
    const realNow = Date.now;
    const fakeNow = realNow() + 8 * 24 * 60 * 60 * 1000; // 8 days later
    vi.spyOn(Date, "now").mockReturnValue(fakeNow);

    const res = await app.fetch(new Request("http://x/movies/603"), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-cache")).toBe("STALE");
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.id).toBe("603");
  });

  it("caches movie details across calls", async () => {
    const fetchMock = mockTmdbFetch([{ match: pathIs("/3/movie/603"), body: matrixDetails }]);

    const app = createApp();
    const { env } = createMockEnv();

    const first = await app.fetch(new Request("http://x/movies/603"), env);
    expect(first.headers.get("x-cache")).toBe("MISS");
    await first.json();

    const second = await app.fetch(new Request("http://x/movies/603"), env);
    expect(second.headers.get("x-cache")).toBe("HIT");
    await second.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
