
import { TMDB_API_KEY, TMDB_BEARER_TOKEN, TMDB_BASE_URL } from '../config/tmdb';
import { fetchWithRetry } from '../utils/fetchWithRetry';

export const fetchMovieDetails = async (movieId: number): Promise<any> => {
  const options = {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      accept: 'application/json'
    }
  };

  const response = await fetchWithRetry(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`,
    options
  );
  const data = await response.json();

  return {
    production_countries: data.production_countries?.map((country: any) => country.name) || [],
    genres: data.genres?.map((genre: any) => genre.name) || [],
    cast: data.credits?.cast?.slice(0, 5).map((actor: any) => actor.name) || []
  };
};
