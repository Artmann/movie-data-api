import type { TmdbVideo, TmdbVideos } from "../types/tmdb";

const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch";

function toYoutubeUrl(video: TmdbVideo): string {
  return `${YOUTUBE_WATCH_URL}?v=${video.key}`;
}

export function pickTrailerUrl(videos: TmdbVideos | undefined): string | null {
  if (!videos?.results) return null;

  const youtube = videos.results.filter((v) => v.site === "YouTube" && v.key);

  const trailer = youtube.find((v) => v.type === "Trailer");
  if (trailer) return toYoutubeUrl(trailer);

  const teaser = youtube.find((v) => v.type === "Teaser");
  if (teaser) return toYoutubeUrl(teaser);

  return null;
}
