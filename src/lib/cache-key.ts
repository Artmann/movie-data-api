const VERSION = "v1";

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

export const cacheKeys = {
  movieDetails: (id: string) => `${VERSION}:movie:details:${id}`,
  movieSearch: (title: string, year: number | null | undefined) =>
    `${VERSION}:movie:search:${normalizeTitle(title)}:${year ?? ""}`,
  showDetails: (id: string) => `${VERSION}:show:details:${id}`,
  showSearch: (title: string, year: number | null | undefined) =>
    `${VERSION}:show:search:${normalizeTitle(title)}:${year ?? ""}`,
  season: (showId: string, seasonNumber: number) =>
    `${VERSION}:show:${showId}:season:${seasonNumber}`,
} as const;
