import { useLanguage } from '@/contexts/LanguageContext';
import { GameCard } from './GameCard';
import { SearchBar } from './SearchBar';

export const MostPlayedGames = ({ 
  games, 
  onGameLaunch, 
  onFavoriteToggle, 
  favoriteGames, 
  user,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onLoadMore,
  hasMorePages,
  loading
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4 px-3 pb-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow">
        {t('popularGames')}
        </h3>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
        />
      </div>
      
      {games.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-3">
            {games.map((game,i) => (
              <GameCard
                key={i}
                game={game}
                onGameLaunch={onGameLaunch}
                onFavoriteToggle={onFavoriteToggle}
                isFavorite={favoriteGames.some(fav => fav.gameId === game.gameId)}
                user={user}
              />
            ))}
          </div>
          
          {/* Load More Button for Popular Games */}
          {hasMorePages && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  loading
                    ? 'bg-[#22282e] text-gray-400 cursor-not-allowed border border-[#facc15]/20'
                    : 'bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800] transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      ) : searchQuery ? (
        <div className="text-center text-gray-300 py-8">
          <p className="text-lg">No popular games found</p>
          <p className="text-sm mt-2 text-gray-400">
            Try a different search term
          </p>
        </div>
      ) : null}
    </div>
  );
}; 