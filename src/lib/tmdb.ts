
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
  genres: string[];
  media_type?: string;
  production_countries?: string[];
  cast?: string[];
  themes?: string[];
  moods?: string[];
}

// Request queue implementation
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

  // Use TMDB_BASE_URL constant for constructing URLs
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
    language: 'en-US',
    include_adult: 'false',
    page: '1'
  });

  if (searchParams.year) queryParams.append('year', searchParams.year);
  if (searchParams.with_genres) queryParams.append('with_genres', searchParams.with_genres);
  if (searchParams.with_cast) queryParams.append('with_cast', searchParams.with_cast);
  if (searchParams.region) queryParams.append('region', searchParams.region);
  if (searchParams.vote_average_gte) queryParams.append('vote_average.gte', searchParams.vote_average_gte);

  try {
    // Use TMDB_BASE_URL constant for constructing URLs
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/search/movie?${queryParams.toString()}`,
      options
    );
    
    const data = await response.json();
    
    const movies = [];
    // Limit to first 10 results to reduce API calls
    const limitedResults = data.results.slice(0, 10);
    
    // Process movies sequentially to avoid overwhelming the API
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
          genres: details.genres,
          media_type: "movie",
          production_countries: details.production_countries,
          cast: details.cast,
          themes: [], // Will be populated by OpenAI
          moods: [], // Will be populated by OpenAI
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
