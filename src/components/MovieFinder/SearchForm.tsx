
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchFormProps {
  onSearch: (preferences: SearchFormData) => void;
  isLoading: boolean;
}

export interface SearchFormData {
  type: string;
  years: string;
  country: string;
  originalLanguage: string;
  actors: string;
  genre: string;
  rating: string;
}

const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const [preferences, setPreferences] = useState<SearchFormData>({
    type: "",
    years: "",
    country: "",
    originalLanguage: "",
    actors: "",
    genre: "",
    rating: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
          <Label htmlFor="country">Production Country</Label>
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
          <Label htmlFor="originalLanguage">Original Language</Label>
          <Input
            id="originalLanguage"
            placeholder="e.g., English, French"
            value={preferences.originalLanguage}
            onChange={(e) =>
              setPreferences({ ...preferences, originalLanguage: e.target.value })
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
