import { buildImageUrl } from "../lib/image-url";
import type { Episode, Season } from "../types/api";
import type { TmdbEpisode, TmdbSeasonDetails } from "../types/tmdb";

function transformEpisode(tmdb: TmdbEpisode): Episode {
  return {
    episodeNumber: tmdb.episode_number,
    title: tmdb.name ?? "",
    overview: tmdb.overview ?? "",
    runtime: tmdb.runtime ?? null,
    stillUrl: buildImageUrl(tmdb.still_path, "still"),
  };
}

export function transformSeasonDetails(tmdb: TmdbSeasonDetails): Season {
  return {
    seasonNumber: tmdb.season_number,
    name: tmdb.name ?? "",
    overview: tmdb.overview ?? "",
    posterUrl: buildImageUrl(tmdb.poster_path, "poster"),
    episodes: (tmdb.episodes ?? []).map(transformEpisode),
  };
}
