import { Movie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300">
          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
            <p className="text-moviefinder-silver text-sm mb-2">
              {new Date(movie.release_date).getFullYear()}
            </p>
            <div className="flex items-center mb-2">
              <span className="text-moviefinder-gold">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <p className="text-white text-sm line-clamp-3">{movie.overview}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;