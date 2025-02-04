import { useState } from "react";
import SearchForm from "@/components/MovieFinder/SearchForm";
import MovieCard from "@/components/MovieFinder/MovieCard";
import LoadingSpinner from "@/components/MovieFinder/LoadingSpinner";
import { analyzePreferences, enrichMovieData } from "@/lib/openai";
import { searchMovies, type Movie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE = 5;

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleMovies, setVisibleMovies] = useState(ITEMS_PER_PAGE);
  const [excludedTitles, setExcludedTitles] = useState<string[]>([]);
  const [lastPreferences, setLastPreferences] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async (preferences: any, isNewSearch: boolean = true) => {
    setIsLoading(true);
    try {
      if (isNewSearch) {
        setExcludedTitles([]);
        setLastPreferences(preferences);
      }

      // Step 1: Analyze preferences using OpenAI
      const analysis = await analyzePreferences(preferences, excludedTitles);
      console.log("OpenAI Analysis:", analysis);

      // Show the AI's understanding of the search
      toast({
        title: "Search Understanding",
        description: analysis.understanding,
      });

      // Step 2: Search TMDB with the analyzed parameters
      const movieResults = await searchMovies(analysis.searchParameters);
      
      if (movieResults.length === 0) {
        toast({
          title: "No Results",
          description: "No movies found matching your preferences. Try adjusting your search criteria.",
          variant: "destructive",
        });
        setMovies([]);
        return;
      }

      // Step 3: Enrich movie data with OpenAI
      const enrichedMovies = await enrichMovieData(movieResults);
      
      // Update excluded titles for potential "Search Again"
      const newExcludedTitles = enrichedMovies.map((movie: Movie) => movie.title);
      setExcludedTitles(prev => [...prev, ...newExcludedTitles]);

      setMovies(enrichedMovies);
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

  const handleSearchAgain = () => {
    if (lastPreferences) {
      handleSearch(lastPreferences, false);
    }
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

        <SearchForm onSearch={(prefs) => handleSearch(prefs, true)} isLoading={isLoading} />

        {isLoading && (
          <div className="mt-12">
            <LoadingSpinner />
          </div>
        )}

        {movies.length > 0 && !isLoading && (
          <div className="mt-12">
            <div className="space-y-6">
              {movies.slice(0, visibleMovies).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            
            <div className="text-center mt-8 pb-8 space-x-4">
              {visibleMovies < movies.length && (
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  className="bg-moviefinder-gold text-black hover:bg-moviefinder-silver transition-colors duration-200"
                >
                  Show More Movies
                </Button>
              )}
              
              <Button
                onClick={handleSearchAgain}
                variant="outline"
                className="bg-moviefinder-silver text-black hover:bg-moviefinder-gold transition-colors duration-200"
              >
                Search Again (Exclude Current Results)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;