import { FaHeart } from "react-icons/fa";

export const GameCard = ({ 
  game, 
  onGameLaunch, 
  onFavoriteToggle, 
  isFavorite, 
  user, 
  updatedImagesMap 
}) => {

  // Use updated image if available
  const imageUrl = updatedImagesMap?.[game.game_code]
    ? updatedImagesMap[game.game_code].startsWith('http')
      ? updatedImagesMap[game.game_code]
      : `${import.meta.env.VITE_BASE_API_URL}${updatedImagesMap[game.game_code]}`
    : game.game_image?.startsWith('http')
      ? game.game_image
      : `${import.meta.env.VITE_BASE_API_URL}${game.game_image}`;

  return (
    <div
      onClick={() => onGameLaunch(game.game_code)}
      className="relative rounded-3xl overflow-hidden group bg-[#121212] border border-[#2c2c2c] shadow-xl hover:shadow-[#f4c004]/50 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
    >
      <img
        src={imageUrl}
        alt={game.game_name}
        className="w-full h-40  object-cover rounded-t-lg group-hover:brightness-75 transition-all duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 transition-all duration-300"></div>
      {user && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(game);
          }}
          className={`absolute top-3 right-3 p-[5px] rounded-full shadow-md transition duration-200 ${
            isFavorite
              ? "bg-[#f4c004] text-white"
              : "bg-white text-red-600 hover:bg-[#f4c004]"
          }`}
        >  
        <FaHeart size={14} />
        </button>
      ) 
      }

      <div className="absolute w-11/12 mx-auto text-center bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="backdrop-blur-md bg-white/10 text-white px-2 py-1 rounded-full border border-white/20 shadow-sm text-xs font-semibold hover:scale-105 transition-all duration-300">
          {game.game_name === "LuckSportGaming" ? "Lucky Exchange" : game.game_name}
        </div>
      </div>
    </div>
  );
}; 