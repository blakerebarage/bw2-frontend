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
  onClearSearch
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