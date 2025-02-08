
import { Movie } from "@/lib/tmdb";
import { useEffect, useState } from "react";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getTMDBUrl = (movie: Movie) => {
    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
    return `https://www.themoviedb.org/${type}/${movie.id}`;
  };

  useEffect(() => {
    const img = new Image();
    img.src = movie.poster_path;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
  }, [movie.poster_path]);

  return (
    <div className="relative bg-moviefinder-card rounded-lg overflow-hidden mb-6 w-full">
      <div className="flex flex-col md:flex-row">
        {/* Movie Poster */}
        <div className="w-full md:w-1/4">
          {!imageLoaded && !imageError && (
            <div className="w-full h-full bg-gray-200 animate-pulse aspect-[2/3]" />
          )}
          {!imageError ? (
            <img
              src={movie.poster_path}
              alt={movie.title}
              className={`w-full h-auto object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center aspect-[2/3]">
              <span className="text-gray-500">Image not available</span>
            </div>
          )}
        </div>

        {/* Movie Information */}
        <div className="w-full md:w-3/4 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <a 
              href={getTMDBUrl(movie)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl font-bold text-moviefinder-gold hover:underline hover:text-moviefinder-silver transition-colors"
            >
              {movie.title}
            </a>
            <div className="text-right">
              <div className="text-moviefinder-gold text-lg">★ {movie.vote_average.toFixed(1)}</div>
              <div className="text-sm text-moviefinder-silver">
                {movie.vote_count} votes
              </div>
            </div>
          </div>

          <div className="space-y-2 text-moviefinder-silver">
            <p className="text-sm">
              <span className="font-semibold">Release Year:</span>{" "}
              {new Date(movie.release_date).getFullYear()}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Production Countries:</span>{" "}
              {movie.production_countries?.join(", ") || "Not available"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Original Language:</span>{" "}
              {movie.original_language?.toUpperCase() || "Not available"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Cast:</span>{" "}
              {movie.cast?.join(", ") || "Not available"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Genres:</span>{" "}
              {movie.genres?.join(", ") || "Not available"}
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
