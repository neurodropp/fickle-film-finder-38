
import { OPENAI_API_KEY, OPENAI_API_URL, OPENAI_MODEL } from '../config/openai';
import { MoviePreferences, SearchParameters } from '../types/preferences';
import { countryMapping } from '../utils/countryMapping';

const cleanJsonResponse = (content: string): string => {
  const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/);
  return jsonMatch ? jsonMatch[1].trim() : content.trim();
};

export const analyzePreferences = async (preferences: MoviePreferences) => {
  const prompt = `Convert these search preferences to TMDB API parameters:
Search Parameters:
- Type: ${preferences.type || 'Any'}
- Years: ${preferences.years || 'Any'}
- Production Country: ${preferences.country || 'Any'}
- Original Language: ${preferences.originalLanguage || 'Any'}
- Actors: ${preferences.actors || 'Any'}
- Genre: ${preferences.genre || 'Any'}
- Minimum Rating: ${preferences.rating || 'Any'}

Instructions:
1. Convert country names to ISO codes (e.g., "Italy" → "IT")
2. Convert language names to ISO codes (e.g., "Italian" → "it")
3. Map genre names to TMDB genre IDs using this reference:
   Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
   Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, Horror: 27,
   Music: 10402, Mystery: 9648, Romance: 10749, Science Fiction: 878,
   Thriller: 53, War: 10752, Western: 37

Return ONLY a JSON object with this structure (no markdown):
{
  "searchParameters": {
    "query": "actor names if specified",
    "primary_release_year": "from years field",
    "with_origin_country": "country code",
    "with_original_language": "language code",
    "with_genres": "comma-separated genre IDs",
    "vote_average_gte": "minimum rating",
    "sort_by": "popularity.desc"
  }
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze preferences');
    }

    const data = await response.json();
    const cleanedContent = cleanJsonResponse(data.choices[0].message.content);
    const analysis = JSON.parse(cleanedContent);
    
    // Post-process the country code
    if (analysis.searchParameters.with_origin_country) {
      const countryLower = preferences.country.toLowerCase();
      if (countryMapping[countryLower]) {
        analysis.searchParameters.with_origin_country = countryMapping[countryLower];
      }
    }

    console.log("OpenAI Analysis:", analysis);
    return analysis;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(error.message || "Failed to analyze preferences");
  }
};

export const enrichMovieData = async (movies: any[]) => {
  return movies.map(movie => ({
    ...movie,
    matchAnalysis: {
      confidenceScore: 100
    }
  }));
};
