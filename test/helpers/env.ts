import type { CacheRecord } from "../../src/do/metadata-cache";

export interface MockCacheStub {
  get(key: string): Promise<CacheRecord | null>;
  put(key: string, value: string, ttlSeconds: number): Promise<void>;
}

export interface MockEnvHandle {
  env: Env;
  store: Map<string, CacheRecord>;
}

export function createMockEnv(options: { tmdbApiKey?: string } = {}): MockEnvHandle {
  const store = new Map<string, CacheRecord>();

  const stub: MockCacheStub = {
    async get(key) {
      return store.get(key) ?? null;
    },
    async put(key, value, ttlSeconds) {
      const now = Date.now();
      store.set(key, {
        value,
        fetchedAt: now,
        expiresAt: now + ttlSeconds * 1000,
      });
    },
  };

  const namespace = {
    idFromName: (name: string) => ({ toString: () => name, equals: () => false, name }),
    idFromString: (id: string) => ({ toString: () => id, equals: () => false, name: id }),
    newUniqueId: () => ({ toString: () => "unique", equals: () => false, name: "unique" }),
    get: () => stub,
    jurisdiction: () => namespace,
  };

  const env = {
    TMDB_API_KEY: options.tmdbApiKey ?? "test-api-key",
    METADATA_CACHE: namespace as unknown as Env["METADATA_CACHE"],
  };

  return { env, store };
}
