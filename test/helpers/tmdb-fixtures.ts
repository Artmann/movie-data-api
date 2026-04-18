import type {
  TmdbMovieDetails,
  TmdbMovieSearchResponse,
  TmdbSeasonDetails,
  TmdbShowDetails,
  TmdbShowSearchResponse,
} from "../../src/types/tmdb";

export const matrixSearch: TmdbMovieSearchResponse = {
  results: [
    {
      id: 603,
      title: "The Matrix",
      release_date: "1999-03-30",
      overview: "A computer hacker...",
      poster_path: "/matrix-poster.jpg",
      backdrop_path: "/matrix-backdrop.jpg",
      vote_average: 8.2,
    },
    {
      id: 604,
      title: "The Matrix Reloaded",
      release_date: "2003-05-15",
      overview: "Neo returns...",
      poster_path: "/reloaded.jpg",
      backdrop_path: null,
      vote_average: 7.2,
    },
  ],
};

export const matrixDetails: TmdbMovieDetails = {
  id: 603,
  title: "The Matrix",
  release_date: "1999-03-30",
  overview: "A computer hacker learns about the true nature of reality.",
  runtime: 136,
  genres: [
    { id: 28, name: "Action" },
    { id: 878, name: "Science Fiction" },
  ],
  vote_average: 8.2,
  poster_path: "/matrix-poster.jpg",
  backdrop_path: "/matrix-backdrop.jpg",
  videos: {
    results: [
      {
        key: "vKQi3bBA1y8",
        site: "YouTube",
        type: "Trailer",
        official: true,
      },
      {
        key: "other",
        site: "YouTube",
        type: "Teaser",
      },
    ],
  },
};

export const matrixDetailsNoReleaseDate: TmdbMovieDetails = {
  id: 603,
  title: "The Matrix",
  release_date: null,
  overview: "",
  runtime: null,
  genres: [],
  vote_average: null,
  poster_path: null,
  backdrop_path: null,
  videos: { results: [] },
};

export const gotSearch: TmdbShowSearchResponse = {
  results: [
    {
      id: 1399,
      name: "Game of Thrones",
      first_air_date: "2011-04-17",
      overview: "Seven noble families...",
      poster_path: "/got.jpg",
      backdrop_path: "/got-bg.jpg",
      vote_average: 8.4,
    },
  ],
};

export const gotDetails: TmdbShowDetails = {
  id: 1399,
  name: "Game of Thrones",
  first_air_date: "2011-04-17",
  overview: "Seven noble families fight for control of Westeros.",
  genres: [
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 18, name: "Drama" },
  ],
  vote_average: 8.4,
  poster_path: "/got.jpg",
  backdrop_path: "/got-bg.jpg",
  number_of_seasons: 8,
  videos: {
    results: [
      {
        key: "giYeaKsXnsI",
        site: "YouTube",
        type: "Trailer",
      },
    ],
  },
};

export const gotSeason1: TmdbSeasonDetails = {
  season_number: 1,
  name: "Season 1",
  overview: "Trouble is brewing in the Seven Kingdoms.",
  poster_path: "/got-s1.jpg",
  episodes: [
    {
      episode_number: 1,
      name: "Winter Is Coming",
      overview: "Lord Ned Stark is troubled by disturbing reports.",
      runtime: 62,
      still_path: "/ep1.jpg",
    },
    {
      episode_number: 2,
      name: "The Kingsroad",
      overview: "While Bran remains in a coma...",
      runtime: 56,
      still_path: "/ep2.jpg",
    },
  ],
};
