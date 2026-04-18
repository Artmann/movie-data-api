import { vi } from "vitest";

export interface TmdbRoute {
  match: (url: URL) => boolean;
  body: unknown;
  status?: number;
}

export function mockTmdbFetch(routes: TmdbRoute[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const urlString = typeof input === "string" ? input : input.toString();
    const url = new URL(urlString);

    for (const route of routes) {
      if (route.match(url)) {
        const status = route.status ?? 200;
        return new Response(JSON.stringify(route.body), {
          status,
          headers: { "content-type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ status_message: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export const pathIs = (p: string) => (url: URL) => url.pathname === p;
export const pathStarts = (p: string) => (url: URL) => url.pathname.startsWith(p);
