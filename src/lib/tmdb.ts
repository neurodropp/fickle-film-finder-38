const TMDB_API_KEY = "817893c1d72568bfe2daa1d0e2c525a8";
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MTc4OTNjMWQ3MjU2OGJmZTJkYWExZDBlMmM1MjVhOCIsIm5iZiI6MTczODUxMTQ3MC43MzEsInN1YiI6IjY3OWY5NDZlZjBmOWRiZGJhNjk1NmY0ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Tx-lmCd45D5Sg9INtqsWfGCmwBnFkCadpnWOHEOa760";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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

// Request queue implementation for rate limiting
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private activeConnections = 0;
  private readonly MAX_CONNECTIONS = 20;
  private readonly DELAY_BETWEEN_REQUESTS = 100;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeConnections >= this.MAX_CONNECTIONS) {
      return;
    }

    this.processing = true;
    while (this.queue.length > 0 && this.activeConnections < this.MAX_CONNECTIONS) {
      const request = this.queue.shift();
      if (request) {
        this.activeConnections++;
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        } finally {
          this.activeConnections--;
          await delay(this.DELAY_BETWEEN_REQUESTS);
        }
      }
    }
    this.processing = false;

    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

const requestQueue = new RequestQueue();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  return requestQueue.add(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;
          await delay(delayMs);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await delay(Math.pow(2, i) * 1000);
      }
    }
    throw new Error('Max retries reached');
  });
};

const fetchMovieDetails = async (movieId: number): Promise<any> => {
  const options = {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      accept: 'application/json'
    }
  };

  const [movieDetails, credits] = await Promise.all([
    fetchWithRetry(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`,
      options
    ).then(res => res.json()),
    fetchWithRetry(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`,
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
  query?: string;
  primary_release_year?: string;
  region?: string;
  with_original_language?: string;
  with_genres?: string;
  vote_average_gte?: string;
  sort_by?: string;
}): Promise<Movie[]> => {
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
    sort_by: searchParams.sort_by || 'vote_count.desc,popularity.desc'
  });

  // Add optional parameters
  if (searchParams.query) queryParams.append('query', searchParams.query);
  if (searchParams.primary_release_year) queryParams.append('primary_release_year', searchParams.primary_release_year);
  if (searchParams.region) queryParams.append('region', searchParams.region);
  if (searchParams.with_original_language) queryParams.append('with_original_language', searchParams.with_original_language);
  if (searchParams.with_genres) queryParams.append('with_genres', searchParams.with_genres);
  if (searchParams.vote_average_gte) queryParams.append('vote_average.gte', searchParams.vote_average_gte);

  try {
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`,
      options
    );
    
    const data = await response.json();
    
    // Limit to first 10 results
    const limitedResults = data.results.slice(0, 10);
    
    // Process movies sequentially
    const movies = [];
    for (const movie of limitedResults) {
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
          vote_count: movie.vote_count,
          popularity: movie.popularity,
          original_language: movie.original_language,
          genres: details.genres,
          production_countries: details.production_countries,
          cast: details.cast,
          media_type: "movie"
        });
      } catch (error) {
        console.error(`Error fetching details for movie ${movie.title}:`, error);
        continue;
      }
    }
    
    return movies;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};
