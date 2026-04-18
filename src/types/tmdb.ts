export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  published_at?: string;
}

export interface TmdbVideos {
  results: TmdbVideo[];
}

export interface TmdbMovieSearchItem {
  id: number;
  title: string;
  release_date?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  genre_ids?: number[];
}

export interface TmdbMovieSearchResponse {
  results: TmdbMovieSearchItem[];
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  release_date?: string | null;
  overview?: string | null;
  runtime?: number | null;
  genres?: TmdbGenre[];
  vote_average?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  videos?: TmdbVideos;
}

export interface TmdbShowSearchItem {
  id: number;
  name: string;
  first_air_date?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  genre_ids?: number[];
}

export interface TmdbShowSearchResponse {
  results: TmdbShowSearchItem[];
}

export interface TmdbShowDetails {
  id: number;
  name: string;
  first_air_date?: string | null;
  overview?: string | null;
  genres?: TmdbGenre[];
  vote_average?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  number_of_seasons?: number;
  videos?: TmdbVideos;
}

export interface TmdbEpisode {
  episode_number: number;
  name?: string | null;
  overview?: string | null;
  runtime?: number | null;
  still_path?: string | null;
}

export interface TmdbSeasonDetails {
  season_number: number;
  name?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  episodes?: TmdbEpisode[];
}
