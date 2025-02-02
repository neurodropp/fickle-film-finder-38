import { useState } from "react";
import SearchForm from "@/components/MovieFinder/SearchForm";
import MovieCard from "@/components/MovieFinder/MovieCard";
import LoadingSpinner from "@/components/MovieFinder/LoadingSpinner";
import { generateMovieRecommendations } from "@/lib/openai";
import { searchMovies, type Movie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (preferences: any) => {
    setIsLoading(true);
    try {
      const titles = await generateMovieRecommendations(preferences);
      const moviePromises = titles.map((title) => searchMovies(title));
      const movieResults = await Promise.all(moviePromises);
      setMovies(movieResults.map((results) => results[0]).filter(Boolean));
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

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).apiKey;
    localStorage.setItem("OPENAI_API_KEY", input.value);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "API key has been saved!",
    });
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

        {!localStorage.getItem("OPENAI_API_KEY") && !showApiKeyInput && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowApiKeyInput(true)}
              variant="outline"
              className="bg-transparent border-moviefinder-gold text-moviefinder-gold hover:bg-moviefinder-gold hover:text-black"
            >
              Set OpenAI API Key
            </Button>
          </div>
        )}

        {showApiKeyInput && (
          <form
            onSubmit={handleApiKeySubmit}
            className="max-w-md mx-auto mb-8 space-y-4"
          >
            <Input
              name="apiKey"
              type="password"
              placeholder="Enter your OpenAI API key"
              className="bg-transparent border-moviefinder-silver"
              required
            />
            <Button
              type="submit"
              className="w-full bg-moviefinder-gold text-black hover:bg-moviefinder-silver"
            >
              Save API Key
            </Button>
          </form>
        )}

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && (
          <div className="mt-12">
            <LoadingSpinner />
          </div>
        )}

        {movies.length > 0 && !isLoading && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;