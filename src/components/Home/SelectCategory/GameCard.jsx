import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { useLanguage } from '../../../contexts/LanguageContext';

export const GameCard = ({ 
  game, 
  onGameLaunch, 
  onFavoriteToggle, 
  isFavorite, 
  user
}) => {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const handleGameLaunch = () => {
    if (onGameLaunch) {
      onGameLaunch(game.gameId);
    }
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle && user) {
      onFavoriteToggle(game);
    }
  };

  return (
    <div
      onClick={handleGameLaunch}
      className="relative rounded-lg overflow-hidden group bg-[#1a1f24] border border-[#facc15]/20 shadow-sm hover:shadow-lg hover:shadow-[#facc15]/20 hover:scale-[1.02] hover:border-[#facc15]/40 transition-all duration-300 cursor-pointer"
    >
      <img
        src={
          game?.imageUrl ? `${import.meta.env.VITE_BASE_API_URL}${game?.imageUrl}` :
          game.img || 'https://via.placeholder.com/300x200?text=No+Image'
        }
        alt={game.name}
        className="w-full h-40 object-cover group-hover:brightness-90 transition-all duration-300"
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f24]/90 via-[#1a1f24]/40 to-transparent opacity-100 transition-all duration-300"></div>
      
      {user && (
        <button
          onClick={handleFavoriteToggle}
          className={`group absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
            isFavorite
              ? "bg-[#ef4444] text-[#ffffff] hover:bg-[#ef4444]/80 hover:text-[#ffffff]"
              : "bg-white text-[#ef4444] hover:bg-[#ef4444]/80 hover:text-[#ffffff] border border-[#facc15]/30 group-hover:text-[#ef4444] group-hover:bg-[#ef4444] group-hover:border-[#facc15]/30"
          }`}
        >  
          {isFavorite ? (
            <FaHeart size={12} className="text-white group-hover:text-white" />
          ) : (
            <FaHeart size={12} className="text-red-500 group-hover:text-white" />
          )}
        </button>
      )}
  
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="bg-[#22282e]/80 backdrop-blur-sm text-white px-2 py-2 rounded-lg border border-[#facc15]/30 shadow-sm">
          <p className="text-sm font-medium text-[#facc15] leading-tight break-words">
            {game.name === "LuckSportGaming" ? "Lucky Exchange" : game.name}
          </p>
          
        </div>
      </div>

      {/* Hover Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
        <div className="bg-[#facc15] text-[#1a1f24] px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {t('playNow')}
        </div>
      </div>
    </div>
  );
}; 