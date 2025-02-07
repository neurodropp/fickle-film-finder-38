
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
  // Count specified parameters
  const specifiedParams = Object.entries(preferences).filter(([_, value]) => value.trim() !== '').length;

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
1. Only include search parameters for explicitly specified preferences
2. For unspecified preferences (empty or "Any"), omit those parameters entirely to allow for broader matches
3. Construct a search query that focuses on specified parameters while remaining flexible about unspecified ones
4. Set appropriate vote count thresholds based on how specific the search is:
   - More specific searches (many parameters) = lower threshold
   - Broader searches (few parameters) = higher threshold to ensure quality
5. Consider the mood and themes in query construction only if specified

Provide your response in this exact JSON format:
{
  "searchParameters": {
    "query": "search query focusing on specified parameters",
    // Only include parameters that correspond to specified preferences
    // Omit any parameter that corresponds to an unspecified preference
  },
  "understanding": "brief explanation of what the user is looking for, including which aspects are flexible",
  "searchContext": {
    "moodKeywords": ["relevant", "mood", "keywords"],
    "themeKeywords": ["relevant", "theme", "keywords"],
    "additionalCriteria": ["other", "important", "criteria"],
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
  // Count specified parameters for adjusting confidence threshold
  const specifiedParams = Object.entries(originalPreferences)
    .filter(([_, value]) => value && value.toString().trim() !== '')
    .length;

  const prompt = `As a movie expert, analyze these movies against the original user preferences and provide detailed matching analysis. Note that unspecified preferences (empty or "Any") should NOT impact the confidence score - only evaluate based on specified criteria.

Original User Preferences:
${JSON.stringify(originalPreferences, null, 2)}

Movies to Analyze:
${JSON.stringify(movies, null, 2)}

Important:
- Only evaluate matches against specified preferences
- Unspecified preferences should not affect the confidence score
- Scale confidence scores based on how many preferences were specified (${specifiedParams} parameters specified)
- Consider the context of broader vs. specific searches

For each movie:
1. Analyze how well it matches ONLY the specified preferences
2. Ignore any preferences that were left empty or "Any"
3. Calculate a confidence score (0-100) considering only specified criteria
4. Provide clear explanation of matches and mismatches

Return ONLY a JSON array where each object has:
{
  ...original movie data...,
  "themes": ["identified", "themes"],
  "moods": ["identified", "moods"],
  "matchAnalysis": {
    "moodMatch": true/false (only if mood was specified),
    "themeMatch": true/false (only if themes were specified),
    "additionalCriteriaMatch": true/false (only if additional criteria were specified),
    "confidenceScore": number (scaled based on specified parameters),
    "matchExplanation": "explanation focusing on specified criteria"
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
    const baseThreshold = 70;
    const thresholdAdjustment = Math.max(0, (8 - specifiedParams) * 5); // Adjust threshold based on specified parameters
    const adjustedThreshold = Math.max(50, baseThreshold - thresholdAdjustment); // Never go below 50

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
          adjustedThreshold // Include the threshold used for transparency
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
