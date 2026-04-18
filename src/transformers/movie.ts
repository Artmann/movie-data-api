import { buildImageUrl } from "../lib/image-url";
import { parseYear } from "../lib/year";
import type { Movie } from "../types/api";
import type { TmdbGenre, TmdbMovieDetails, TmdbMovieSearchItem } from "../types/tmdb";
import { pickTrailerUrl } from "./trailer";

function genreNames(genres: TmdbGenre[] | undefined): string[] {
  return (genres ?? []).map((g) => g.name);
}

export function transformMovieDetails(tmdb: TmdbMovieDetails): Movie {
  return {
    id: String(tmdb.id),
    title: tmdb.title,
    year: parseYear(tmdb.release_date),
    overview: tmdb.overview ?? "",
    runtime: tmdb.runtime ?? null,
    genres: genreNames(tmdb.genres),
    rating: tmdb.vote_average ?? null,
    posterUrl: buildImageUrl(tmdb.poster_path, "poster"),
    backdropUrl: buildImageUrl(tmdb.backdrop_path, "backdrop"),
    trailerUrl: pickTrailerUrl(tmdb.videos),
  };
}

export function transformMovieSearchItem(tmdb: TmdbMovieSearchItem): Movie {
  return {
    id: String(tmdb.id),
    title: tmdb.title,
    year: parseYear(tmdb.release_date),
    overview: tmdb.overview ?? "",
    runtime: null,
    genres: [],
    rating: tmdb.vote_average ?? null,
    posterUrl: buildImageUrl(tmdb.poster_path, "poster"),
    backdropUrl: buildImageUrl(tmdb.backdrop_path, "backdrop"),
    trailerUrl: null,
  };
}
