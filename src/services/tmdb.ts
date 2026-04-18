import { UpstreamError } from "../errors/api-error";
import type {
  TmdbMovieDetails,
  TmdbMovieSearchResponse,
  TmdbSeasonDetails,
  TmdbShowDetails,
  TmdbShowSearchResponse,
} from "../types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TIMEOUT_MS = 5000;

type QueryValue = string | number | undefined | null;

async function fetchTmdb<T>(
  apiKey: string,
  path: string,
  query: Record<string, QueryValue> = {},
): Promise<T | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`TMDB request failed: ${message}`);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new UpstreamError(`TMDB returned ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function searchMovies(
  apiKey: string,
  title: string,
  year: number | undefined,
): Promise<TmdbMovieSearchResponse> {
  const result = await fetchTmdb<TmdbMovieSearchResponse>(apiKey, "/search/movie", {
    query: title,
    year,
  });
  return result ?? { results: [] };
}

export function getMovie(apiKey: string, id: string): Promise<TmdbMovieDetails | null> {
  return fetchTmdb<TmdbMovieDetails>(apiKey, `/movie/${id}`, {
    append_to_response: "videos",
  });
}

export async function searchShows(
  apiKey: string,
  title: string,
  year: number | undefined,
): Promise<TmdbShowSearchResponse> {
  const result = await fetchTmdb<TmdbShowSearchResponse>(apiKey, "/search/tv", {
    query: title,
    first_air_date_year: year,
  });
  return result ?? { results: [] };
}

export function getShow(apiKey: string, id: string): Promise<TmdbShowDetails | null> {
  return fetchTmdb<TmdbShowDetails>(apiKey, `/tv/${id}`, {
    append_to_response: "videos",
  });
}

export function getSeason(
  apiKey: string,
  showId: string,
  seasonNumber: number,
): Promise<TmdbSeasonDetails | null> {
  return fetchTmdb<TmdbSeasonDetails>(apiKey, `/tv/${showId}/season/${seasonNumber}`);
}
