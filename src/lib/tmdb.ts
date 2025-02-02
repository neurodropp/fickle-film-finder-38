// Note: This is a public API key and Bearer token for demo purposes
const TMDB_API_KEY = "3e3f0b48f6f362f4c4c8a604b5a8c2f8";
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZTNmMGI0OGY2ZjM2MmY0YzRjOGE2MDRiNWE4YzJmOCIsInN1YiI6IjY1ZjIyNDQ3ZTlkYTY5MDE3YzE2ZDJhYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gQwB9dc_hqDYm_8jXBpJZJ9y6WvqI6gGXG9HpZpwQoE";

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genres: string[];
}

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        accept: 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.status_message || 'Failed to fetch movies');
  }
  
  const data = await response.json();
  return data.results.map((movie: any) => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "/placeholder.svg",
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    genres: [], // We'll fetch genres in a separate call if needed
  }));
};