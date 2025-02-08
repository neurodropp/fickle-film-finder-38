
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genres: string[];
  production_countries: string[];
  cast: string[];
  media_type?: string;
}
