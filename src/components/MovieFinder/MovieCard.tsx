import { Movie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="relative bg-moviefinder-card rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Movie Poster */}
        <div className="w-full md:w-1/3">
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Movie Information */}
        <div className="w-full md:w-2/3 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-moviefinder-gold">{movie.title}</h3>
            <span className="text-moviefinder-gold text-lg">★ {movie.vote_average.toFixed(1)}</span>
          </div>

          <div className="space-y-2 text-moviefinder-silver">
            <p className="text-sm">
              <span className="font-semibold">Type:</span> {movie.media_type || "Movie"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Year:</span>{" "}
              {new Date(movie.release_date).getFullYear()}
            </p>
            {movie.production_countries && (
              <p className="text-sm">
                <span className="font-semibold">Countries:</span>{" "}
                {movie.production_countries.join(", ")}
              </p>
            )}
            {movie.cast && (
              <p className="text-sm">
                <span className="font-semibold">Cast:</span> {movie.cast.join(", ")}
              </p>
            )}
            {movie.genres && (
              <p className="text-sm">
                <span className="font-semibold">Genres:</span>{" "}
                {movie.genres.join(", ")}
              </p>
            )}
            {movie.themes && (
              <p className="text-sm">
                <span className="font-semibold">Themes:</span>{" "}
                {movie.themes.join(", ")}
              </p>
            )}
            {movie.moods && (
              <p className="text-sm">
                <span className="font-semibold">Moods:</span>{" "}
                {movie.moods.join(", ")}
              </p>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm text-moviefinder-silver line-clamp-4">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;