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
      className="relative rounded-lg overflow-hidden group bg-[#1a1f24] border border-[#facc15]/20 shadow-sm hover:shadow-lg hover:shadow-[#facc15]/20 hover:scale-[1.02] hover:border-[#facc15]/40 transition-all duration-300 cursor-pointer"
    >
      <img
        src={game.img}  
        alt={game.name}
        className="w-full h-40 object-cover group-hover:brightness-90 transition-all duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f24]/90 via-[#1a1f24]/40 to-transparent opacity-100 transition-all duration-300"></div>
      
      {user && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(game);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
            isFavorite
              ? "bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800]"
              : "bg-[#22282e] text-gray-300 hover:bg-[#facc15] hover:text-[#1a1f24] border border-[#facc15]/30"
          }`}
        >  
          <FaHeart size={12} />
        </button>
      )}
  
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="bg-[#22282e]/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg border border-[#facc15]/30 shadow-sm">
          <p className="text-sm font-medium text-[#facc15] truncate">
            {game.name === "LuckSportGaming" ? "Lucky Exchange" : game.name}
          </p>
          {game.provider && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {game.provider}
            </p>
          )}
        </div>
      </div>

      {/* Hover Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
        <div className="bg-[#facc15] text-[#1a1f24] px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Play Now
        </div>
      </div>
    </div>
  );
}; 