// Note: This is a public API key and Bearer token for demo purposes
const TMDB_API_KEY = "****************************a8";
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.************************A760";

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genres: string[];
  media_type?: string;
  production_countries?: string[];
  cast?: string[];
  themes?: string[];
  moods?: string[];
}

const fetchMovieDetails = async (movieId: number): Promise<any> => {
  const [movieDetails, credits] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          accept: 'application/json'
        }
      }
    ).then(res => res.json()),
    fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          accept: 'application/json'
        }
      }
    ).then(res => res.json())
  ]);

  return {
    production_countries: movieDetails.production_countries?.map((country: any) => country.name) || [],
    genres: movieDetails.genres?.map((genre: any) => genre.name) || [],
    cast: credits.cast?.slice(0, 5).map((actor: any) => actor.name) || []
  };
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
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
  const movies = await Promise.all(
    data.results.map(async (movie: any) => {
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
        genres: details.genres,
        media_type: "movie",
        production_countries: details.production_countries,
        cast: details.cast,
        themes: [], // These would need to be populated based on analysis
        moods: [], // These would need to be populated based on analysis
      };
    })
  );
  
  return movies;
};