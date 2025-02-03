import { useState } from "react";
import SearchForm from "@/components/MovieFinder/SearchForm";
import MovieCard from "@/components/MovieFinder/MovieCard";
import LoadingSpinner from "@/components/MovieFinder/LoadingSpinner";
import { generateMovieRecommendations } from "@/lib/openai";
import { searchMovies, type Movie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE = 5;

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleMovies, setVisibleMovies] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();

  const handleSearch = async (preferences: any) => {
    setIsLoading(true);
    try {
      const titles = await generateMovieRecommendations(preferences);
      const moviePromises = titles.map((title) => searchMovies(title));
      const movieResults = await Promise.all(moviePromises);
      setMovies(movieResults.map((results) => results[0]).filter(Boolean));
      setVisibleMovies(ITEMS_PER_PAGE);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch movie recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowMore = () => {
    setVisibleMovies((prev) => prev + ITEMS_PER_PAGE);
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

        {movies.length > 0 && !isLoading && (
          <div className="mt-12">
            <div className="space-y-6">
              {movies.slice(0, visibleMovies).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            
            {visibleMovies < movies.length && (
              <div className="text-center mt-8 pb-8">
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