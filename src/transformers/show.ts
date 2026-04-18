import { buildImageUrl } from "../lib/image-url";
import { parseYear } from "../lib/year";
import type { Show } from "../types/api";
import type { TmdbGenre, TmdbShowDetails, TmdbShowSearchItem } from "../types/tmdb";
import { pickTrailerUrl } from "./trailer";

function genreNames(genres: TmdbGenre[] | undefined): string[] {
  return (genres ?? []).map((g) => g.name);
}

export function transformShowDetails(tmdb: TmdbShowDetails): Show {
  return {
    id: String(tmdb.id),
    title: tmdb.name,
    year: parseYear(tmdb.first_air_date),
    overview: tmdb.overview ?? "",
    genres: genreNames(tmdb.genres),
    rating: tmdb.vote_average ?? null,
    posterUrl: buildImageUrl(tmdb.poster_path, "poster"),
    backdropUrl: buildImageUrl(tmdb.backdrop_path, "backdrop"),
    trailerUrl: pickTrailerUrl(tmdb.videos),
    numberOfSeasons: tmdb.number_of_seasons ?? 0,
  };
}

export function transformShowSearchItem(tmdb: TmdbShowSearchItem): Show {
  return {
    id: String(tmdb.id),
    title: tmdb.name,
    year: parseYear(tmdb.first_air_date),
    overview: tmdb.overview ?? "",
    genres: [],
    rating: tmdb.vote_average ?? null,
    posterUrl: buildImageUrl(tmdb.poster_path, "poster"),
    backdropUrl: buildImageUrl(tmdb.backdrop_path, "backdrop"),
    trailerUrl: null,
    numberOfSeasons: 0,
  };
}
