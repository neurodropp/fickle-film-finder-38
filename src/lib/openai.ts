export const generateMovieRecommendations = async (preferences: {
  type: string;
  mood: string;
  years: string;
  country: string;
  actors: string;
  genre: string;
  themes: string;
  rating: string;
  otherInfo: string;
}) => {
  const prompt = `You are a movie expert. Based on these specific preferences, suggest exactly 5 movies or TV shows that STRICTLY match these criteria. Only suggest movies that actually exist:

Type: ${preferences.type || 'Any'}
Mood: ${preferences.mood || 'Any'}
Years: ${preferences.years || 'Any'}
Country: ${preferences.country || 'Any'}
Actors: ${preferences.actors || 'Any'}
Genre: ${preferences.genre || 'Any'}
Themes: ${preferences.themes || 'Any'}
Minimum Rating: ${preferences.rating || 'Any'}
Additional Info: ${preferences.otherInfo || 'None'}

Return ONLY the exact titles of 5 movies/shows that match ALL the specified criteria, separated by commas. Do not include any other text or explanations.`;

  try {
    const apiKey = localStorage.getItem("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    if (!apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) {
      throw new Error("Invalid OpenAI API key format. The API key should start with 'sk-' but not 'sk-proj-'. Please provide a valid OpenAI API key.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch recommendations');
    }

    const data = await response.json();
    const titles = data.choices[0].message.content.split(",").map((t: string) => t.trim());
    return titles;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(error.message || "Failed to generate recommendations");
  }
};