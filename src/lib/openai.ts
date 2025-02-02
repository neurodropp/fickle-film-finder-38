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
  const prompt = `Based on these preferences:
    - Type: ${preferences.type}
    - Mood: ${preferences.mood}
    - Years: ${preferences.years}
    - Country: ${preferences.country}
    - Actors: ${preferences.actors}
    - Genre: ${preferences.genre}
    - Themes: ${preferences.themes}
    - Rating: ${preferences.rating}
    - Other Info: ${preferences.otherInfo}
    
    Suggest 5 movies or TV shows that match these criteria. Return only the titles separated by commas.`;

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