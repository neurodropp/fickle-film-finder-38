const TMDB_API_KEY = "817893c1d72568bfe2daa1d0e2c525a8";
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MTc4OTNjMWQ3MjU2OGJmZTJkYWExZDBlMmM1MjVhOCIsIm5iZiI6MTczODUxMTQ3MC43MzEsInN1YiI6IjY3OWY5NDZlZjBmOWRiZGJhNjk1NmY0ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Tx-lmCd45D5Sg9INtqsWfGCmwBnFkCadpnWOHEOa760";

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

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API calls with retry logic
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Wait for 1 second before retrying (adjust as needed)
        await delay(1000);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000);
    }
  }
  throw new Error('Max retries reached');
};

const fetchMovieDetails = async (movieId: number): Promise<any> => {
  const options = {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      accept: 'application/json'
    }
  };

  // Add delay between requests
  await delay(250);

  const [movieDetails, credits] = await Promise.all([
    fetchWithRetry(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`,
      options
    ).then(res => res.json()),
    fetchWithRetry(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`,
      options
    ).then(res => res.json())
  ]);

  return {
    production_countries: movieDetails.production_countries?.map((country: any) => country.name) || [],
    genres: movieDetails.genres?.map((genre: any) => genre.name) || [],
    cast: credits.cast?.slice(0, 5).map((actor: any) => actor.name) || []
  };
};

export const searchMovies = async (searchParams: {
  query: string;
  year?: string;
  with_genres?: string;
  with_cast?: string;
  region?: string;
  vote_average_gte?: string;
}): Promise<Movie[]> => {
  const options = {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      accept: 'application/json'
    }
  };

  let queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: searchParams.query,
  });

  if (searchParams.year) queryParams.append('year', searchParams.year);
  if (searchParams.with_genres) queryParams.append('with_genres', searchParams.with_genres);
  if (searchParams.with_cast) queryParams.append('with_cast', searchParams.with_cast);
  if (searchParams.region) queryParams.append('region', searchParams.region);
  if (searchParams.vote_average_gte) queryParams.append('vote_average.gte', searchParams.vote_average_gte);

  const response = await fetchWithRetry(
    `https://api.themoviedb.org/3/search/movie?${queryParams.toString()}`,
    options
  );
  
  const data = await response.json();
  
  // Process movies sequentially to avoid overwhelming the API
  const movies = [];
  for (const movie of data.results) {
    try {
      const details = await fetchMovieDetails(movie.id);
      movies.push({
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
        themes: [], // Will be populated by OpenAI
        moods: [], // Will be populated by OpenAI
      });
      
      if (movies.length === 10) break; // Limit to 10 results
    } catch (error) {
      console.error(`Error fetching details for movie ${movie.title}:`, error);
      continue;
    }
  }
  
  return movies;
};

// Helper functions can be added here if needed
