import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface SearchFormProps {
  onSearch: (preferences: any) => void;
  isLoading: boolean;
}

const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(localStorage.getItem("OPENAI_API_KEY") || "");
  const [preferences, setPreferences] = useState({
    type: "",
    mood: "",
    years: "",
    country: "",
    actors: "",
    genre: "",
    themes: "",
    rating: "",
    otherInfo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key. It should start with 'sk-' but not 'sk-proj-'.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("OPENAI_API_KEY", apiKey);
    onSearch(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="apiKey">OpenAI API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="text-gray-800"
        />
        <p className="text-xs text-gray-400">
          Get your API key from{" "}
          <a
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            OpenAI's dashboard
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            placeholder="Movie or Series"
            value={preferences.type}
            onChange={(e) =>
              setPreferences({ ...preferences, type: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mood">Mood</Label>
          <Input
            id="mood"
            placeholder="How do you feel?"
            value={preferences.mood}
            onChange={(e) =>
              setPreferences({ ...preferences, mood: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="years">Years</Label>
          <Input
            id="years"
            placeholder="e.g., 1990-2000 or 2023"
            value={preferences.years}
            onChange={(e) =>
              setPreferences({ ...preferences, years: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="e.g., USA, France"
            value={preferences.country}
            onChange={(e) =>
              setPreferences({ ...preferences, country: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actors">Actors</Label>
          <Input
            id="actors"
            placeholder="Favorite actors"
            value={preferences.actors}
            onChange={(e) =>
              setPreferences({ ...preferences, actors: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            placeholder="e.g., Action, Drama"
            value={preferences.genre}
            onChange={(e) =>
              setPreferences({ ...preferences, genre: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="themes">Themes</Label>
          <Input
            id="themes"
            placeholder="e.g., Revenge, Love"
            value={preferences.themes}
            onChange={(e) =>
              setPreferences({ ...preferences, themes: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            placeholder="Minimum rating (1-10)"
            value={preferences.rating}
            onChange={(e) =>
              setPreferences({ ...preferences, rating: e.target.value })
            }
            className="text-gray-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherInfo">Other Information</Label>
        <Input
          id="otherInfo"
          placeholder="e.g., Oscar winner, Based on true story"
          value={preferences.otherInfo}
          onChange={(e) =>
            setPreferences({ ...preferences, otherInfo: e.target.value })
          }
          className="text-gray-800"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-moviefinder-gold hover:bg-moviefinder-silver text-black"
        disabled={isLoading}
      >
        {isLoading ? "Finding Perfect Matches..." : "Find Movies"}
      </Button>
    </form>
  );
};

export default SearchForm;
