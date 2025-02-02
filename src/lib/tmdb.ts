const TMDB_API_KEY = "3e3f0b48f6f362f4c4c8a604b5a8c2f8"; // This is a public API key

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
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
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