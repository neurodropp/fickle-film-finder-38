
const OPENAI_API_KEY = "sk-svcacct-XFS3uNgI_fYiLd-r3LsY_CuSGU9LVNk6snehVRqH-odYw8zGTVNWVpXmuX7gSxr9LT3BlbkFJsOB4ZCd8GZFb5sR7cmdfWs-d39Jsjff8wcqVxnHKOaPLXYE-k0FdRxr8A-vesajoQA";

interface SearchParameters {
  query: string;
  primary_release_year?: string;
  region?: string;
  with_original_language?: string;
  with_genres?: string;
  vote_average_gte?: string;
  sort_by: string;
}

export const analyzePreferences = async (preferences: {
  type: string;
  years: string;
  country: string;
  originalLanguage: string;
  actors: string;
  genre: string;
  rating: string;
}) => {
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
   - Action: 28
   - Adventure: 12
   - Animation: 16
   - Comedy: 35
   - Crime: 80
   - Documentary: 99
   - Drama: 18
   - Family: 10751
   - Fantasy: 14
   - Horror: 27
   - Music: 10402
   - Mystery: 9648
   - Romance: 10749
   - Science Fiction: 878
   - Thriller: 53
   - War: 10752
   - Western: 37
4. Set sort_by=vote_count.desc,popularity.desc
5. Return exactly 10 results

Provide your response in this JSON format:
{
  "searchParameters": {
    "query": "actor names if specified",
    "primary_release_year": "from years field",
    "region": "country code",
    "with_original_language": "language code",
    "with_genres": "comma-separated genre IDs",
    "vote_average_gte": "minimum rating",
    "sort_by": "vote_count.desc,popularity.desc"
  }
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze preferences');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
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
      confidenceScore: 100, // All results are now considered equally relevant
    }
  }));
};
