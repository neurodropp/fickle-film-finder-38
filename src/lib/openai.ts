const OPENAI_API_KEY = "sk-svcacct-XFS3uNgI_fYiLd-r3LsY_CuSGU9LVNk6snehVRqH-odYw8zGTVNWVpXmuX7gSxr9LT3BlbkFJsOB4ZCd8GZFb5sR7cmdfWs-d39Jsjff8wcqVxnHKOaPLXYE-k0FdRxr8A-vesajoQA";

interface SearchParameters {
  query: string;
  year?: string;
  with_genres?: string;
  with_cast?: string;
  region?: string;
  vote_average_gte?: string;
  without_genres?: string;
  with_crew?: string;
  with_companies?: string;
  with_original_language?: string;
  vote_count_gte?: string;
}

export const analyzePreferences = async (
  preferences: {
    type: string;
    mood: string;
    years: string;
    country: string;
    actors: string;
    genre: string;
    themes: string;
    rating: string;
    otherInfo: string;
  },
  excludedTitles: string[] = []
) => {
  const prompt = `As a movie expert, analyze these preferences and create optimal search parameters for TMDB API. Note that unspecified parameters (empty or "Any") should NOT restrict the search - they indicate the user is flexible about that aspect.

User Preferences:
Type: ${preferences.type || 'Any'}
Mood: ${preferences.mood || 'Any'}
Years: ${preferences.years || 'Any'}
Country: ${preferences.country || 'Any'}
Actors: ${preferences.actors || 'Any'}
Genre: ${preferences.genre || 'Any'}
Themes: ${preferences.themes || 'Any'}
Minimum Rating: ${preferences.rating || 'Any'}
Additional Info: ${preferences.otherInfo || 'None'}

${excludedTitles.length > 0 ? 'Please exclude these titles: ' + excludedTitles.join(', ') : ''}

Instructions:
1. Create TWO search queries if a country is specified:
   - One focusing on movies produced in that country
   - Another focusing on movies in that country's language
2. For mood and themes, incorporate them into the query text rather than specific parameters
3. Set appropriate vote count thresholds:
   - For specific searches (3+ parameters): minimum 100 votes
   - For broader searches (1-2 parameters): minimum 500 votes
4. When country is specified:
   - Use both region (e.g., "IT" for Italy) AND with_original_language (e.g., "it" for Italian)
   - Consider movies that match EITHER criterion as valid
5. For unspecified preferences, omit those parameters entirely
6. Create natural language queries that capture the essence of specified preferences

Provide your response in this JSON format:
{
  "searchParameters": [{
    "query": "primary search query",
    "region": "country code if specified",
    "with_original_language": "language code if specified",
    // other relevant parameters
  },
  {
    "query": "alternative language/region search if country specified",
    // alternative parameters
  }],
  "understanding": "brief explanation of search approach",
  "searchContext": {
    "moodKeywords": ["relevant", "mood", "keywords"],
    "themeKeywords": ["relevant", "theme", "keywords"],
    "countryContext": {
      "region": "region code if specified",
      "language": "language code if specified"
    },
    "specifiedParameterCount": number
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
    return JSON.parse(data.choices[0].message.content);
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(error.message || "Failed to analyze preferences");
  }
};

export const enrichMovieData = async (movies: any[], originalPreferences: any) => {
  // Count specified parameters
  const specifiedParams = Object.entries(originalPreferences)
    .filter(([_, value]) => value && value.toString().trim() !== '')
    .length;

  const prompt = `As a movie expert, analyze these movies against the original user preferences and provide detailed matching analysis. Consider country matches based on BOTH production country AND original language.

Original User Preferences:
${JSON.stringify(originalPreferences, null, 2)}

Movies to Analyze:
${JSON.stringify(movies, null, 2)}

Important Guidelines:
1. Consider a movie a good country match if it EITHER:
   - Was produced in the specified country
   - Is in the specified country's language
2. For mood matching:
   - Consider plot, genre, and overall tone
   - Look for synonyms and related concepts
3. Adjust confidence scoring:
   - Base threshold: 60 (not 70 as before)
   - Country matches: Count as positive if EITHER production or language matches
   - Mood matches: Consider broader interpretations
4. Scale confidence scores based on:
   - Number of specified parameters (${specifiedParams} parameters specified)
   - Partial matches (especially for country/language)

For each movie, provide:
1. Detailed analysis of how it matches specified preferences
2. Confidence score calculation explanation
3. Clear identification of partial matches

Return a JSON array where each object has:
{
  ...original movie data...,
  "themes": ["identified", "themes"],
  "moods": ["identified", "moods"],
  "matchAnalysis": {
    "countryMatch": {
      "production": boolean,
      "language": boolean
    },
    "moodMatch": boolean,
    "confidenceScore": number,
    "matchExplanation": "detailed explanation"
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
      throw new Error(errorData.error?.message || 'Failed to enrich movie data');
    }

    const data = await response.json();
    const enrichedData = JSON.parse(data.choices[0].message.content);
    
    // Calculate minimum confidence threshold based on number of specified parameters
    const baseThreshold = 60; // Lowered from 70
    const thresholdAdjustment = Math.max(0, (8 - specifiedParams) * 7); // Increased adjustment factor
    const adjustedThreshold = Math.max(40, baseThreshold - thresholdAdjustment); // Lower minimum threshold

    // Filter movies with adjusted threshold
    const filteredMovies = enrichedData
      .filter((movie: any) => 
        movie.matchAnalysis.confidenceScore >= adjustedThreshold
      )
      .map((movie: any) => ({
        ...movie,
        themes: movie.themes || [],
        moods: movie.moods || [],
        matchAnalysis: {
          ...movie.matchAnalysis,
          adjustedThreshold
        }
      }));

    return filteredMovies;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return movies.map(movie => ({
      ...movie,
      themes: [],
      moods: []
    }));
  }
};
