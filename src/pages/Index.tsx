
import { useState } from "react";
import SearchForm from "@/components/MovieFinder/SearchForm";
import MovieCard from "@/components/MovieFinder/MovieCard";
import LoadingSpinner from "@/components/MovieFinder/LoadingSpinner";
import APIDebugPanel from "@/components/MovieFinder/APIDebugPanel";
import { analyzePreferences, enrichMovieData } from "@/lib/openai";
import { searchMovies, type Movie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { SearchFormData } from "@/components/MovieFinder/SearchForm";

const ITEMS_PER_PAGE = 5;

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleMovies, setVisibleMovies] = useState(ITEMS_PER_PAGE);
  const [apiDebugInfo, setApiDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async (preferences: SearchFormData) => {
    setIsLoading(true);
    try {
      // Step 1: Analyze preferences using OpenAI
      const analysis = await analyzePreferences(preferences);
      
      // Step 2: Search TMDB with the analyzed parameters
      const searchParams = analysis.searchParameters;
      const movieResults = await searchMovies(searchParams);
      
      // Step 3: Enrich movie data
      const enrichedMovies = await enrichMovieData(movieResults);
      
      // Store API debug information
      setApiDebugInfo({
        openai: {
          input: { preferences },
          output: analysis
        },
        tmdb: {
          searchUrl: 'https://api.themoviedb.org/3/search/movie',
          searchParams: searchParams,
          resultsCount: enrichedMovies.length
        }
      });

      if (enrichedMovies.length === 0) {
        toast({
          title: "No Results",
          description: "No movies found matching your preferences. Try adjusting your search criteria.",
          variant: "destructive",
        });
        setMovies([]);
        return;
      }

      // Sort movies by vote count and popularity
      const sortedMovies = [...enrichedMovies].sort((a, b) => 
        (b.vote_count - a.vote_count) || (b.popularity - a.popularity)
      );

      setMovies(sortedMovies);
      setVisibleMovies(ITEMS_PER_PAGE);

    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch movie recommendations. Please try again.",
        variant: "destructive",
      });
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowMore = () => {
    setVisibleMovies((prev) => Math.min(prev + ITEMS_PER_PAGE, movies.length));
  };

  return (
    <div className="min-h-screen bg-moviefinder-background text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-moviefinder-gold">
            Movie Matchmaker
          </h1>
          <p className="text-moviefinder-silver text-lg">
            Find your perfect movie match based on your preferences
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && (
          <div className="mt-12">
            <LoadingSpinner />
          </div>
        )}

        {apiDebugInfo && !isLoading && (
          <APIDebugPanel apiCalls={apiDebugInfo} />
        )}

        {movies.length > 0 && !isLoading && (
          <div className="mt-12">
            <div className="space-y-6">
              {movies.slice(0, visibleMovies).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            
            {visibleMovies < movies.length && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  className="bg-moviefinder-gold text-black hover:bg-moviefinder-silver transition-colors duration-200"
                >
                  Show More Movies
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
