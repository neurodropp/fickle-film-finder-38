
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
  const prompt = `As a movie expert, analyze these preferences and create optimal search parameters for TMDB API. Consider ALL aspects carefully to create the most effective search:

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
1. Analyze the mood and themes to construct a relevant search query
2. Consider the type of content (movie/series) in the query
3. Extract any potential crew members or companies from Additional Info
4. Map countries to ISO region codes
5. Convert genres to appropriate TMDB genre terminology
6. Ensure high-quality results by setting appropriate vote count threshold

Provide your response in this exact JSON format:
{
  "searchParameters": {
    "query": "comprehensive search query incorporating mood and themes",
    "year": "year or year range if specified",
    "with_genres": "comma-separated genre ids if specified",
    "without_genres": "comma-separated genre ids to exclude if relevant",
    "with_cast": "comma-separated cast names if specified",
    "with_crew": "comma-separated crew names if mentioned in additional info",
    "with_companies": "comma-separated company ids if mentioned",
    "region": "ISO country code if specified",
    "with_original_language": "ISO language code if relevant",
    "vote_average_gte": "minimum rating if specified",
    "vote_count_gte": "minimum vote count to ensure quality results"
  },
  "understanding": "brief explanation of what the user is looking for, including mood and themes",
  "searchContext": {
    "moodKeywords": ["list", "of", "mood", "related", "keywords"],
    "themeKeywords": ["list", "of", "theme", "related", "keywords"],
    "additionalCriteria": ["list", "of", "other", "important", "criteria"]
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
  const prompt = `As a movie expert, analyze these movies against the original user preferences and provide detailed matching analysis.

Original User Preferences:
${JSON.stringify(originalPreferences, null, 2)}

Movies to Analyze:
${JSON.stringify(movies, null, 2)}

For each movie:
1. Analyze the overview and details to identify themes and moods
2. Check if the movie truly matches the user's requested mood
3. Verify if the themes align with user preferences
4. Validate any additional criteria from otherInfo
5. Calculate a confidence score (0-100) for how well it matches all criteria

Return ONLY a JSON array where each object has:
{
  ...original movie data...,
  "themes": ["identified", "themes"],
  "moods": ["identified", "moods"],
  "matchAnalysis": {
    "moodMatch": true/false,
    "themeMatch": true/false,
    "additionalCriteriaMatch": true/false,
    "confidenceScore": number,
    "matchExplanation": "brief explanation of why this movie matches or doesn't match"
  }
}

Sort the results by confidenceScore in descending order.`;

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
    
    // Filter out movies with low confidence scores or poor matches
    const filteredMovies = enrichedData
      .filter((movie: any) => 
        movie.matchAnalysis.confidenceScore >= 70 &&
        (movie.matchAnalysis.moodMatch || !originalPreferences.mood) &&
        (movie.matchAnalysis.themeMatch || !originalPreferences.themes)
      )
      .map((movie: any) => ({
        ...movie,
        themes: movie.themes || [],
        moods: movie.moods || [],
        matchAnalysis: movie.matchAnalysis || {}
      }));

    return filteredMovies;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    // Return original movies if enrichment fails
    return movies.map(movie => ({
      ...movie,
      themes: [],
      moods: []
    }));
  }
};
