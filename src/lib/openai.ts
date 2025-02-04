const OPENAI_API_KEY = "sk-svcacct-XFS3uNgI_fYiLd-r3LsY_CuSGU9LVNk6snehVRqH-odYw8zGTVNWVpXmuX7gSxr9LT3BlbkFJsOB4ZCd8GZFb5sR7cmdfWs-d39Jsjff8wcqVxnHKOaPLXYE-k0FdRxr8A-vesajoQA";

interface SearchParameters {
  query: string;
  year?: string;
  with_genres?: string;
  with_cast?: string;
  region?: string;
  vote_average_gte?: string;
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
  const prompt = `As a movie expert, analyze these preferences and create optimal search parameters for TMDB API. Consider all aspects carefully:

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

Provide your response in this exact JSON format:
{
  "searchParameters": {
    "query": "search query for TMDB",
    "year": "year or year range if specified",
    "with_genres": "comma-separated genre ids if specified",
    "with_cast": "comma-separated cast names if specified",
    "region": "country code if specified",
    "vote_average_gte": "minimum rating if specified"
  },
  "understanding": "brief explanation of what the user is looking for"
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

export const enrichMovieData = async (movies: any[]) => {
  const prompt = `Analyze these movies and provide additional context. For each movie, provide themes and moods that match it. 
Return ONLY a JSON array where each object has the movie's original data plus 'themes' and 'moods' arrays.
Here are the movies to analyze: ${JSON.stringify(movies)}

Example of expected response format:
[
  {
    "id": "original_id",
    "title": "original_title",
    ...rest of original movie data...,
    "themes": ["theme1", "theme2"],
    "moods": ["mood1", "mood2"]
  }
]`;

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
    
    // Ensure we maintain the original movie data structure
    return movies.map((movie, index) => ({
      ...movie,
      themes: enrichedData[index]?.themes || [],
      moods: enrichedData[index]?.moods || []
    }));
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