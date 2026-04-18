import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createMockEnv } from "../helpers/env";

interface OpenApiDoc {
  openapi: string;
  info: { title: string };
  paths: Record<string, Record<string, unknown>>;
  components?: { schemas?: Record<string, unknown> };
}

describe("GET /openapi.json", () => {
  it("serves an OpenAPI document with all endpoints", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/openapi.json"), env);

    expect(res.status).toBe(200);
    const doc = (await res.json()) as OpenApiDoc;

    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.info.title).toBe("movie-data-api");

    const paths = Object.keys(doc.paths);
    expect(paths).toContain("/movies/search");
    expect(paths).toContain("/movies/{id}");
    expect(paths).toContain("/shows/search");
    expect(paths).toContain("/shows/{id}");
    expect(paths).toContain("/shows/{id}/seasons/{seasonNumber}");
    expect(paths).toContain("/healthz");
  });

  it("includes named schemas for Movie, Show, Season, Episode, Error", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/openapi.json"), env);
    const doc = (await res.json()) as OpenApiDoc;

    const schemas = doc.components?.schemas ?? {};
    expect(schemas).toHaveProperty("Movie");
    expect(schemas).toHaveProperty("Show");
    expect(schemas).toHaveProperty("Season");
    expect(schemas).toHaveProperty("Episode");
    expect(schemas).toHaveProperty("Error");
  });
});

describe("GET /docs", () => {
  it("serves HTML for Scalar", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/docs"), env);

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<html");
  });
});
