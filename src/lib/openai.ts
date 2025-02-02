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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const titles = data.choices[0].message.content.split(",").map((t: string) => t.trim());
  return titles;
};