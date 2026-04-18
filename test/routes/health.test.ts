import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createMockEnv } from "../helpers/env";

describe("GET /healthz", () => {
  it("returns ok", async () => {
    const app = createApp();
    const { env } = createMockEnv();
    const res = await app.fetch(new Request("http://x/healthz"), env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
