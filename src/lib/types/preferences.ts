
export interface MoviePreferences {
  type: string;
  years: string;
  country: string;
  originalLanguage: string;
  actors: string;
  genre: string;
  rating: string;
}

export interface SearchParameters {
  query: string;
  primary_release_year?: string;
  with_origin_country?: string;
  with_original_language?: string;
  with_genres?: string;
  vote_average_gte?: string;
  sort_by: string;
}
