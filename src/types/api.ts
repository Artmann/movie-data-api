export interface Movie {
  id: string;
  title: string;
  year: number | null;
  overview: string;
  runtime: number | null;
  genres: string[];
  rating: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
}

export interface Show {
  id: string;
  title: string;
  year: number | null;
  overview: string;
  genres: string[];
  rating: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  numberOfSeasons: number;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  overview: string;
  runtime: number | null;
  stillUrl: string | null;
}

export interface Season {
  seasonNumber: number;
  name: string;
  overview: string;
  posterUrl: string | null;
  episodes: Episode[];
}
