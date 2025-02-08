
import { Movie } from '../types/movie';
import { TMDB_API_KEY, TMDB_BEARER_TOKEN, TMDB_BASE_URL, CACHE_DURATION } from '../config/tmdb';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { fetchMovieDetails } from './movieDetails';

// Cache implementation for search results
const searchCache = new Map<string, { data: Movie[]; timestamp: number }>();

// Helper function to generate cache key
const generateCacheKey = (params: any): string => {
  return JSON.stringify(Object.entries(params).sort());
};

export const searchMovies = async (searchParams: {
  query?: string;
  primary_release_year?: string;
  with_production_countries?: string;
  with_original_language?: string;
  with_genres?: string;
  vote_average_gte?: string;
  sort_by?: string;
}): Promise<Movie[]> => {
  const cacheKey = generateCacheKey(searchParams);
  const cachedResult = searchCache.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.data;
  }

  const options = {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      accept: 'application/json'
    }
  };

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    include_adult: 'false',
    page: '1',
    sort_by: searchParams.sort_by || 'vote_count.desc,popularity.desc',
    'vote_count.gte': '100'
  });

  if (searchParams.query) queryParams.append('query', searchParams.query);
  if (searchParams.primary_release_year) queryParams.append('primary_release_year', searchParams.primary_release_year);
  if (searchParams.with_production_countries) queryParams.append('with_production_countries', searchParams.with_production_countries);
  if (searchParams.with_original_language) queryParams.append('with_original_language', searchParams.with_original_language);
  if (searchParams.with_genres) queryParams.append('with_genres', searchParams.with_genres);
  if (searchParams.vote_average_gte) queryParams.append('vote_average.gte', searchParams.vote_average_gte);

  try {
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`,
      options
    );
    
    const data = await response.json();
    const limitedResults = data.results.slice(0, 10);
    
    const moviePromises = limitedResults.map(async (movie: any) => {
      try {
        const details = await fetchMovieDetails(movie.id);
        return {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/placeholder.svg",
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          popularity: movie.popularity,
          original_language: movie.original_language,
          genres: details.genres,
          production_countries: details.production_countries,
          cast: details.cast,
          media_type: "movie"
        };
      } catch (error) {
        console.error(`Error fetching details for movie ${movie.title}:`, error);
        return null;
      }
    });

    const movies = (await Promise.all(moviePromises)).filter((movie): movie is Movie => movie !== null);
    
    searchCache.set(cacheKey, { data: movies, timestamp: Date.now() });
    
    return movies;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};
