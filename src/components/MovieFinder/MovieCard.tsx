import { Movie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="relative bg-moviefinder-card rounded-lg overflow-hidden mb-6 w-full">
      <div className="flex flex-col md:flex-row">
        {/* Movie Poster */}
        <div className="w-full md:w-1/4">
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Movie Information */}
        <div className="w-full md:w-3/4 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-moviefinder-gold">{movie.title}</h3>
            <span className="text-moviefinder-gold text-lg">★ {movie.vote_average.toFixed(1)}</span>
          </div>

          <div className="space-y-2 text-moviefinder-silver">
            <p className="text-sm">
              <span className="font-semibold">Type:</span> {movie.media_type === 'tv' ? 'TV Series' : 'Movie'}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Year:</span>{" "}
              {new Date(movie.release_date).getFullYear()}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Countries:</span>{" "}
              {movie.production_countries?.join(", ") || "Loading..."}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Cast:</span>{" "}
              {movie.cast?.join(", ") || "Loading..."}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Genres:</span>{" "}
              {movie.genres?.join(", ") || "Loading..."}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Themes:</span>{" "}
              {movie.themes?.join(", ") || "Not available"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Moods:</span>{" "}
              {movie.moods?.join(", ") || "Not available"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-moviefinder-silver">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;