import { FaHeart } from "react-icons/fa";

export const GameCard = ({ 
  game, 
  onGameLaunch, 
  onFavoriteToggle, 
  isFavorite, 
  user
}) => {
  return (
    <div
      onClick={() => onGameLaunch(game.gameId)}
      className="relative rounded-3xl overflow-hidden group bg-[#121212] border border-[#2c2c2c] shadow-xl hover:shadow-red-500/50 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
    >
      <img
        src={game.img}  
        alt={game.name}
        className="w-full h-40 object-cover rounded-t-lg group-hover:brightness-75 transition-all duration-300"
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
              ? "bg-red-500 text-white"
              : "bg-white text-gray-800 hover:bg-green-400"
          }`}
        >  
          <FaHeart size={14} />
        </button>
      )}

      <div className="absolute w-11/12 mx-auto text-center bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="backdrop-blur-md bg-white/10 text-white px-2 py-1 rounded-full border border-white/20 shadow-sm text-xs font-semibold hover:scale-105 transition-all duration-300">
          {game.name === "LuckSportGaming" ? "Lucky Exchange" : game.name}
        </div>
      </div>
    </div>
  );
}; 