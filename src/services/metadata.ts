import { UpstreamError } from "../errors/api-error";
import { cacheKeys } from "../lib/cache-key";
import { transformMovieDetails, transformMovieSearchItem } from "../transformers/movie";
import { transformSeasonDetails } from "../transformers/season";
import { transformShowDetails, transformShowSearchItem } from "../transformers/show";
import type { Movie, Season, Show } from "../types/api";
import * as tmdb from "./tmdb";

export type CacheStatus = "HIT" | "MISS" | "STALE";

export interface CacheResult<T> {
  value: T;
  cacheStatus: CacheStatus;
}

const DAY_SECONDS = 24 * 60 * 60;
const WEEK_SECONDS = 7 * DAY_SECONDS;
const MAX_STALE_MS = 30 * DAY_SECONDS * 1000;

const TTL = {
  details: WEEK_SECONDS,
  search: DAY_SECONDS,
} as const;

function getCacheStub(env: Env) {
  const id = env.METADATA_CACHE.idFromName("global");
  return env.METADATA_CACHE.get(id);
}

async function fetchWithCache<T>(
  env: Env,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T | null>,
): Promise<CacheResult<T | null>> {
  const cache = getCacheStub(env);
  const now = Date.now();
  const cached = await cache.get(key);

  if (cached && cached.expiresAt > now) {
    return { value: JSON.parse(cached.value) as T, cacheStatus: "HIT" };
  }

  try {
    const fresh = await loader();
    if (fresh !== null) {
      await cache.put(key, JSON.stringify(fresh), ttlSeconds);
    }
    return { value: fresh, cacheStatus: "MISS" };
  } catch (err) {
    if (err instanceof UpstreamError && cached && now - cached.fetchedAt < MAX_STALE_MS) {
      return { value: JSON.parse(cached.value) as T, cacheStatus: "STALE" };
    }
    throw err;
  }
}

async function fetchSearchWithCache<T>(
  env: Env,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T[]>,
): Promise<CacheResult<T[]>> {
  const cache = getCacheStub(env);
  const now = Date.now();
  const cached = await cache.get(key);

  if (cached && cached.expiresAt > now) {
    return { value: JSON.parse(cached.value) as T[], cacheStatus: "HIT" };
  }

  try {
    const fresh = await loader();
    if (fresh.length > 0) {
      await cache.put(key, JSON.stringify(fresh), ttlSeconds);
    }
    return { value: fresh, cacheStatus: "MISS" };
  } catch (err) {
    if (err instanceof UpstreamError && cached && now - cached.fetchedAt < MAX_STALE_MS) {
      return { value: JSON.parse(cached.value) as T[], cacheStatus: "STALE" };
    }
    throw err;
  }
}

export function fetchMovieDetails(env: Env, id: string): Promise<CacheResult<Movie | null>> {
  return fetchWithCache(env, cacheKeys.movieDetails(id), TTL.details, async () => {
    const raw = await tmdb.getMovie(env.TMDB_API_KEY, id);
    return raw ? transformMovieDetails(raw) : null;
  });
}

export function searchMovies(
  env: Env,
  title: string,
  year: number | undefined,
): Promise<CacheResult<Movie[]>> {
  return fetchSearchWithCache(env, cacheKeys.movieSearch(title, year), TTL.search, async () => {
    const raw = await tmdb.searchMovies(env.TMDB_API_KEY, title, year);
    return raw.results.map(transformMovieSearchItem);
  });
}

export function fetchShowDetails(env: Env, id: string): Promise<CacheResult<Show | null>> {
  return fetchWithCache(env, cacheKeys.showDetails(id), TTL.details, async () => {
    const raw = await tmdb.getShow(env.TMDB_API_KEY, id);
    return raw ? transformShowDetails(raw) : null;
  });
}

export function searchShows(
  env: Env,
  title: string,
  year: number | undefined,
): Promise<CacheResult<Show[]>> {
  return fetchSearchWithCache(env, cacheKeys.showSearch(title, year), TTL.search, async () => {
    const raw = await tmdb.searchShows(env.TMDB_API_KEY, title, year);
    return raw.results.map(transformShowSearchItem);
  });
}

export function fetchSeasonDetails(
  env: Env,
  showId: string,
  seasonNumber: number,
): Promise<CacheResult<Season | null>> {
  return fetchWithCache(env, cacheKeys.season(showId, seasonNumber), TTL.details, async () => {
    const raw = await tmdb.getSeason(env.TMDB_API_KEY, showId, seasonNumber);
    return raw ? transformSeasonDetails(raw) : null;
  });
}
